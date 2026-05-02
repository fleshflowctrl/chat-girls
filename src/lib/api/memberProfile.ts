import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserProfileDraft } from '../../utils/userProfileStorage'

const TABLE = 'member_profiles'

function rowToDraft(row: {
  display_name?: string | null
  tagline?: string | null
  bio?: string | null
  age?: string | null
  region?: string | null
  interests?: string | null
}): UserProfileDraft {
  return {
    displayName: row.display_name ?? '',
    tagline: row.tagline ?? '',
    bio: row.bio ?? '',
    age: row.age ?? '',
    region: row.region ?? '',
    interests: row.interests ?? '',
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
