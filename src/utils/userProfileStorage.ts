const STORAGE_KEY = 'velvet_user_profile'

export type UserProfileDraft = {
  displayName: string
  tagline: string
  bio: string
  age: string
  region: string
  interests: string
  /** Public URL from Supabase Storage when signed in; empty uses placeholder in UI */
  avatarUrl: string
  /** Extra photos (public URLs) for the same gallery strip as companion profiles */
  galleryUrls: string[]
}

export const EMPTY_USER_PROFILE: UserProfileDraft = {
  displayName: '',
  tagline: '',
  bio: '',
  age: '',
  region: '',
  interests: '',
  avatarUrl: '',
  galleryUrls: [],
}

function parseAge(age: string): number | null {
  const n = Number.parseInt(age.trim(), 10)
  if (!Number.isFinite(n)) return null
  return n
}

/** 0–100: how complete the profile is for the “response rate” bar. */
export function profileCompletionPercent(p: UserProfileDraft): number {
  let n = 0
  if (p.displayName.trim().length >= 2) n += 22
  if (p.tagline.trim().length >= 3) n += 15
  if (p.bio.trim().length >= 40) n += 25
  else if (p.bio.trim().length >= 12) n += 12
  const ageN = parseAge(p.age)
  if (ageN !== null && ageN >= 18 && ageN <= 120) n += 15
  if (p.region.trim().length >= 2) n += 13
  if (p.interests.trim().length >= 12) n += 10
  else if (p.interests.trim().length >= 3) n += 5
  if (p.avatarUrl.trim().length > 8) n += 8
  if (p.galleryUrls.length >= 2) n += 8
  else if (p.galleryUrls.length === 1) n += 4
  return Math.min(100, n)
}

export function readUserProfile(): UserProfileDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY_USER_PROFILE }
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object') return { ...EMPTY_USER_PROFILE }
    const x = o as Record<string, unknown>
    const str = (k: keyof UserProfileDraft) => (typeof x[k] === 'string' ? (x[k] as string) : '')
    const rawGu = x.galleryUrls
    let galleryUrls: string[] = []
    if (Array.isArray(rawGu)) {
      galleryUrls = rawGu.filter((u): u is string => typeof u === 'string' && u.trim().length > 4)
    }
    return {
      displayName: str('displayName'),
      tagline: str('tagline'),
      bio: str('bio'),
      age: str('age'),
      region: str('region'),
      interests: str('interests'),
      avatarUrl: str('avatarUrl'),
      galleryUrls,
    }
  } catch {
    return { ...EMPTY_USER_PROFILE }
  }
}

export function writeUserProfile(p: UserProfileDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* private mode */
  }
}
