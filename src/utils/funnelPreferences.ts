/** Session keys — written when the conversion funnel completes. */

/** Session-only: funnel runs again each new browser session until completed once. */
export const FUNNEL_SKIP_SESSION_KEY = 'velvet_funnel_skipped_this_session'

export function readFunnelSkippedThisSession(): boolean {
  try {
    return sessionStorage.getItem(FUNNEL_SKIP_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export const FUNNEL_SKIP_EVENT = 'velvet-funnel-skip'

export function writeFunnelSkippedThisSession() {
  try {
    sessionStorage.setItem(FUNNEL_SKIP_SESSION_KEY, '1')
  } catch {
    /* private / blocked storage */
  }
  window.dispatchEvent(new Event(FUNNEL_SKIP_EVENT))
}

export function subscribeFunnelSkipSession(callback: () => void) {
  const onCustom = () => callback()
  const onStorage = (e: StorageEvent) => {
    if (e.key === FUNNEL_SKIP_SESSION_KEY || e.key === null) callback()
  }
  window.addEventListener(FUNNEL_SKIP_EVENT, onCustom)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(FUNNEL_SKIP_EVENT, onCustom)
    window.removeEventListener('storage', onStorage)
  }
}

export const FUNNEL_VIBES_KEY = 'velvet_funnel_vibes'
export const FUNNEL_AGE_MIN_KEY = 'velvet_funnel_age_min'
export const FUNNEL_AGE_MAX_KEY = 'velvet_funnel_age_max'

export type FunnelPreferences = {
  vibes: string[]
  ageMin: number
  ageMax: number
}

/** Read saved funnel answers — use to reorder highlights or call recommendations API later. */
export function readFunnelPreferences(): FunnelPreferences | null {
  try {
    const raw = sessionStorage.getItem(FUNNEL_VIBES_KEY)
    const minS = sessionStorage.getItem(FUNNEL_AGE_MIN_KEY)
    const maxS = sessionStorage.getItem(FUNNEL_AGE_MAX_KEY)
    if (minS === null || maxS === null) return null
    const ageMin = Number(minS)
    const ageMax = Number(maxS)
    if (Number.isNaN(ageMin) || Number.isNaN(ageMax)) return null
    let vibes: string[] = []
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) vibes = parsed
      } catch {
        /* ignore */
      }
    }
    return { vibes, ageMin, ageMax }
  } catch {
    return null
  }
}
