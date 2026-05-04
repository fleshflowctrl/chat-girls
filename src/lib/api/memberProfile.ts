import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserProfileDraft } from '../../utils/userProfileStorage'

const TABLE = 'member_profiles'
export const MEMBER_AVATARS_BUCKET = 'member-avatars'
const AVATAR_OBJECT_NAME = 'avatar'

export function memberAvatarStoragePath(userId: string): string {
  return `${userId}/${AVATAR_OBJECT_NAME}`
}

function parseGalleryUrlsColumn(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((u): u is string => typeof u === 'string' && u.trim().length > 4)
}

function rowToDraft(row: {
  display_name?: string | null
  tagline?: string | null
  bio?: string | null
  age?: string | null
  region?: string | null
  interests?: string | null
  avatar_url?: string | null
  gallery_urls?: unknown
}): UserProfileDraft {
  return {
    displayName: row.display_name ?? '',
    tagline: row.tagline ?? '',
    bio: row.bio ?? '',
    age: row.age ?? '',
    region: row.region ?? '',
    interests: row.interests ?? '',
    avatarUrl: row.avatar_url ?? '',
    galleryUrls: parseGalleryUrlsColumn(row.gallery_urls),
  }
}

function draftToRow(userId: string, p: UserProfileDraft) {
  return {
    id: userId,
    display_name: p.displayName,
    tagline: p.tagline,
    bio: p.bio,
    age: p.age,
    region: p.region,
    interests: p.interests,
    avatar_url: p.avatarUrl,
    gallery_urls: p.galleryUrls,
  }
}

export async function fetchMemberProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfileDraft | null> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  if (!data) return null
  return rowToDraft(data)
}

export async function upsertMemberProfile(
  supabase: SupabaseClient,
  userId: string,
  p: UserProfileDraft,
): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert(draftToRow(userId, p), { onConflict: 'id' })
  if (error) throw error
}

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024

/** Uploads to `{userId}/avatar` (upsert). Returns public URL for `member_profiles.avatar_url`. */
export async function uploadMemberAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<string> {
  const t = file.type || 'application/octet-stream'
  if (!ALLOWED_TYPES.has(t)) {
    throw new Error('Please choose a JPEG, PNG, or WebP image.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be 5 MB or smaller.')
  }

  const path = memberAvatarStoragePath(userId)
  const { error: upErr } = await supabase.storage.from(MEMBER_AVATARS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: t,
  })
  if (upErr) throw upErr

  const { data } = supabase.storage.from(MEMBER_AVATARS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/** Best-effort remove of the stored object (ignore missing file). */
export async function removeMemberAvatarObject(supabase: SupabaseClient, userId: string): Promise<void> {
  const path = memberAvatarStoragePath(userId)
  await supabase.storage.from(MEMBER_AVATARS_BUCKET).remove([path])
}

/** Path inside `member-avatars` from a public object URL, or null if not ours. */
export function storagePathFromMemberAvatarsPublicUrl(publicUrl: string): string | null {
  const marker = `/object/public/${MEMBER_AVATARS_BUCKET}/`
  const i = publicUrl.indexOf(marker)
  if (i === -1) return null
  try {
    return decodeURIComponent(publicUrl.slice(i + marker.length))
  } catch {
    return null
  }
}

const GALLERY_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/** Upload an extra gallery image; returns public URL. Max size enforced like avatar. */
export async function uploadMemberGalleryImage(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<string> {
  const t = file.type || 'application/octet-stream'
  if (!ALLOWED_TYPES.has(t)) {
    throw new Error('Please choose a JPEG, PNG, or WebP image.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be 5 MB or smaller.')
  }
  const ext = GALLERY_EXT[t] ?? 'jpg'
  const path = `${userId}/gallery-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
  const { error: upErr } = await supabase.storage.from(MEMBER_AVATARS_BUCKET).upload(path, file, {
    upsert: false,
    contentType: t,
  })
  if (upErr) throw upErr
  const { data } = supabase.storage.from(MEMBER_AVATARS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function removeMemberGalleryObjectByPublicUrl(
  supabase: SupabaseClient,
  publicUrl: string,
): Promise<void> {
  const path = storagePathFromMemberAvatarsPublicUrl(publicUrl)
  if (!path) return
  await supabase.storage.from(MEMBER_AVATARS_BUCKET).remove([path])
}
