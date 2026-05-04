import type { MockProfile } from '../types/profile'

/**
 * Static mock profiles — replace with `GET /api/profiles` (or similar) when backend exists.
 */
/** In-memory catalog after a successful Supabase fetch (chat routes read this too). */
let runtimeProfiles: MockProfile[] | null = null
let catalogVersion = 0

export function getCatalogVersion(): number {
  return catalogVersion
}

export function subscribeCompanionCatalog(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }
  const fn = () => callback()
  window.addEventListener('companion-catalog-updated', fn)
  return () => window.removeEventListener('companion-catalog-updated', fn)
}

export function setRuntimeCompanionProfiles(profiles: MockProfile[]) {
  runtimeProfiles = profiles.length ? profiles : null
  catalogVersion += 1
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('companion-catalog-updated'))
  }
}

export function getActiveProfiles(): MockProfile[] {
  return runtimeProfiles ?? MOCK_PROFILES
}

const FEMALE_MOCK_PROFILES: MockProfile[] = [
  {
    id: '1',
    name: 'Sofia Laurent',
    age: 24,
    heightLabel: '172 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
    tags: ['Flirty', 'Romantic', 'Online', 'Teasing', 'VIP', 'Easy conversation'],
    moodLabel: 'Sweet tease',
    isOnline: true,
    isPremium: true,
    isVip: true,
    isHot: true,
    isNew: false,
  },
  {
    id: '2',
    name: 'Maya Chen',
    age: 26,
    heightLabel: '165 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    tags: ['Caring', 'Romantic', 'Playful', 'New', 'Warm company'],
    moodLabel: 'Soft & warm',
    isOnline: true,
    isPremium: false,
    isVip: false,
    isHot: false,
    isNew: true,
  },
  {
    id: '3',
    name: 'Elena Voss',
    age: 28,
    heightLabel: '178 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    tags: ['Wild', 'Flirty', 'Caring', 'VIP', 'Online'],
    moodLabel: 'Electric energy',
    isOnline: true,
    isPremium: true,
    isVip: true,
    isHot: true,
    isNew: false,
  },
  {
    id: '4',
    name: 'Aria Bloom',
    age: 22,
    heightLabel: '160 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/17.jpg',
    tags: ['Playful', 'Flirty', 'Teasing', 'New', 'Online'],
    moodLabel: 'Bubbly spark',
    isOnline: true,
    isPremium: false,
    isVip: false,
    isHot: true,
    isNew: true,
  },
  {
    id: '5',
    name: 'Noor El-Sayed',
    age: 25,
    heightLabel: '168 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
    tags: ['Caring', 'Romantic', 'Flirty', 'VIP', 'Easy conversation'],
    moodLabel: 'Deep listener',
    isOnline: false,
    isPremium: true,
    isVip: true,
    isHot: false,
    isNew: false,
  },
  {
    id: '6',
    name: 'Isla Hart',
    age: 27,
    heightLabel: '170 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/89.jpg',
    tags: ['Wild', 'Teasing', 'Playful', 'Online'],
    moodLabel: 'Late-night muse',
    isOnline: true,
    isPremium: true,
    isVip: false,
    isHot: true,
    isNew: false,
  },
  {
    id: '7',
    name: 'Victoria Kane',
    age: 29,
    heightLabel: '175 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
    tags: ['Romantic', 'Caring', 'Flirty', 'VIP', 'Easy conversation', 'Warm company'],
    moodLabel: 'Slow burn',
    isOnline: false,
    isPremium: true,
    isVip: true,
    isHot: false,
    isNew: false,
  },
  {
    id: '8',
    name: 'Luna Reyes',
    age: 23,
    heightLabel: '163 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/50.jpg',
    tags: ['Flirty', 'Wild', 'Romantic', 'Online', 'Hot'],
    moodLabel: 'Spicy confidante',
    isOnline: true,
    isPremium: false,
    isVip: false,
    isHot: true,
    isNew: false,
  },
  {
    id: '9',
    name: 'Clara Weiss',
    age: 26,
    heightLabel: '169 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/76.jpg',
    tags: ['Romantic', 'Caring', 'Flirty', 'New', 'Warm company'],
    moodLabel: 'Velvet voice',
    isOnline: true,
    isPremium: false,
    isVip: false,
    isHot: false,
    isNew: true,
  },
  {
    id: '10',
    name: 'Jade Monroe',
    age: 24,
    heightLabel: '173 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
    tags: ['Teasing', 'Flirty', 'Wild', 'VIP', 'Online'],
    moodLabel: 'Wink & whisper',
    isOnline: true,
    isPremium: true,
    isVip: true,
    isHot: true,
    isNew: false,
  },
  {
    id: '11',
    name: 'Freya Lindholm',
    age: 30,
    heightLabel: '176 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/90.jpg',
    tags: ['Caring', 'Romantic', 'Teasing', 'VIP', 'Easy conversation'],
    moodLabel: 'Nordic calm',
    isOnline: false,
    isPremium: true,
    isVip: true,
    isHot: false,
    isNew: false,
  },
  {
    id: '12',
    name: 'Nina Okonkwo',
    age: 25,
    heightLabel: '166 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/37.jpg',
    tags: ['Playful', 'Wild', 'Romantic', 'Online', 'New'],
    moodLabel: 'Laugh-out-loud',
    isOnline: true,
    isPremium: false,
    isVip: false,
    isHot: false,
    isNew: true,
  },
  {
    id: '13',
    name: 'Camille Duarte',
    age: 27,
    heightLabel: '171 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/54.jpg',
    tags: ['Romantic', 'Flirty', 'Playful', 'VIP', 'Hot'],
    moodLabel: 'Parisian edge',
    isOnline: false,
    isPremium: true,
    isVip: true,
    isHot: true,
    isNew: false,
  },
  {
    id: '14',
    name: 'Riley Brooks',
    age: 22,
    heightLabel: '164 cm',
    imageUrl: 'https://randomuser.me/api/portraits/women/8.jpg',
    tags: ['Flirty', 'Playful', 'Teasing', 'Online'],
    moodLabel: 'Sunshine flirt',
    isOnline: true,
    isPremium: false,
    isVip: false,
    isHot: false,
    isNew: false,
  },
]

const MALE_MOCK_PROFILES: MockProfile[] = [
  {
    id: 'm1',
    name: 'James Carter',
    age: 32,
    heightLabel: '182 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    tags: ['Romantic', 'Caring', 'Easy conversation', 'Online'],
    moodLabel: 'Steady & kind',
    isOnline: true,
    isPremium: false,
    isVip: false,
    isHot: false,
    isNew: false,
  },
  {
    id: 'm2',
    name: 'Marcus Webb',
    age: 29,
    heightLabel: '178 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
    tags: ['Playful', 'Chill & sweet', 'Warm company', 'Online'],
    moodLabel: 'Easy laugh',
    isOnline: true,
    isPremium: true,
    isVip: false,
    isHot: true,
    isNew: true,
  },
  {
    id: 'm3',
    name: 'Daniel Ortiz',
    age: 35,
    heightLabel: '175 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
    tags: ['Caring', 'Romantic', 'Flirty', 'VIP'],
    moodLabel: 'Warm voice',
    isOnline: false,
    isPremium: true,
    isVip: true,
    isHot: false,
    isNew: false,
  },
  {
    id: 'm4',
    name: 'Thomas Berg',
    age: 41,
    heightLabel: '188 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/52.jpg',
    tags: ['Easy conversation', 'Bold & confident', 'Online'],
    moodLabel: 'Thoughtful depth',
    isOnline: true,
    isPremium: false,
    isVip: false,
    isHot: false,
    isNew: false,
  },
  {
    id: 'm5',
    name: 'Alex Rivera',
    age: 26,
    heightLabel: '173 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
    tags: ['Playful', 'Romantic', 'Teasing', 'New', 'Online'],
    moodLabel: 'Bright energy',
    isOnline: true,
    isPremium: false,
    isVip: false,
    isHot: true,
    isNew: true,
  },
  {
    id: 'm6',
    name: 'Oliver Grant',
    age: 38,
    heightLabel: '180 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
    tags: ['Caring', 'Warm company', 'Romantic', 'VIP'],
    moodLabel: 'Quiet confidence',
    isOnline: false,
    isPremium: true,
    isVip: false,
    isHot: false,
    isNew: false,
  },
  {
    id: 'm7',
    name: 'Ethan Cole',
    age: 27,
    heightLabel: '179 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/36.jpg',
    tags: ['Flirty', 'Playful', 'Online', 'Hot'],
    moodLabel: 'Charming tease',
    isOnline: true,
    isPremium: true,
    isVip: true,
    isHot: true,
    isNew: false,
  },
  {
    id: 'm8',
    name: 'Noah Kim',
    age: 33,
    heightLabel: '176 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/59.jpg',
    tags: ['Chill & sweet', 'Easy conversation', 'Online'],
    moodLabel: 'Low-key sweet',
    isOnline: true,
    isPremium: false,
    isVip: false,
    isHot: false,
    isNew: false,
  },
  {
    id: 'm9',
    name: 'Lucas Meyer',
    age: 44,
    heightLabel: '184 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/71.jpg',
    tags: ['Romantic', 'Caring', 'VIP', 'Easy conversation'],
    moodLabel: 'Classic gentleman',
    isOnline: false,
    isPremium: true,
    isVip: true,
    isHot: false,
    isNew: false,
  },
  {
    id: 'm10',
    name: 'Ryan Foster',
    age: 30,
    heightLabel: '177 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/43.jpg',
    tags: ['Bold & confident', 'Playful', 'Flirty', 'Online'],
    moodLabel: 'Direct & fun',
    isOnline: true,
    isPremium: false,
    isVip: false,
    isHot: true,
    isNew: true,
  },
  {
    id: 'm11',
    name: 'Benjamin Ross',
    age: 36,
    heightLabel: '181 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/28.jpg',
    tags: ['Caring', 'Romantic', 'Teasing', 'VIP', 'Online'],
    moodLabel: 'Soft edge',
    isOnline: true,
    isPremium: true,
    isVip: false,
    isHot: false,
    isNew: false,
  },
  {
    id: 'm12',
    name: 'Samuel Okonkwo',
    age: 28,
    heightLabel: '174 cm',
    imageUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
    tags: ['Warm company', 'Easy conversation', 'New', 'Online'],
    moodLabel: 'Grounded warmth',
    isOnline: false,
    isPremium: false,
    isVip: false,
    isHot: false,
    isNew: true,
  },
]

/** Women and men interleaved so the Discover grid shows a mixed catalog. */
function interleaveByIndex(first: MockProfile[], second: MockProfile[]): MockProfile[] {
  const out: MockProfile[] = []
  const n = Math.max(first.length, second.length)
  for (let i = 0; i < n; i++) {
    if (i < first.length) out.push(first[i]!)
    if (i < second.length) out.push(second[i]!)
  }
  return out
}

/**
 * Supabase `companion_profiles` often ships women-only seed data. Merge in local male demos so Discover
 * stays mixed; skips any male whose `id` already exists on the server.
 */
export function mergeRemoteCompanionCatalogWithDemoMales(remote: MockProfile[]): MockProfile[] {
  const remoteIds = new Set(remote.map((p) => p.id.trim()))
  const men = MALE_MOCK_PROFILES.filter((p) => !remoteIds.has(p.id.trim()))
  if (men.length === 0) return remote
  return interleaveByIndex(remote, men)
}

export const MOCK_PROFILES: MockProfile[] = interleaveByIndex(FEMALE_MOCK_PROFILES, MALE_MOCK_PROFILES)

export function getProfileById(id: string): MockProfile | undefined {
  return getActiveProfiles().find((p) => p.id === id)
}
