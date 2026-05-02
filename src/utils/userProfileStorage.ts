const STORAGE_KEY = 'velvet_user_profile'

export type UserProfileDraft = {
  displayName: string
  tagline: string
  bio: string
  age: string
  region: string
  interests: string
}

export const EMPTY_USER_PROFILE: UserProfileDraft = {
  displayName: '',
  tagline: '',
  bio: '',
  age: '',
  region: '',
  interests: '',
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
  return Math.min(100, n)
}

export function readUserProfile(): UserProfileDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY_USER_PROFILE }
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object') return { ...EMPTY_USER_PROFILE }
    const x = o as Record<string, unknown>
    const str = (k: keyof UserProfileDraft) => (typeof x[k] === 'string' ? x[k] : '')
    return {
      displayName: str('displayName'),
      tagline: str('tagline'),
      bio: str('bio'),
      age: str('age'),
      region: str('region'),
      interests: str('interests'),
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
