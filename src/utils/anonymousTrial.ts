import { ANONYMOUS_FREE_MESSAGES } from '../constants/anonymousTrial'

const STORAGE_KEY = 'velvet_anonymous_outbound_count'

export function getAnonymousOutboundCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return 0
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

export function canSendAnonymousMessage(): boolean {
  return getAnonymousOutboundCount() < ANONYMOUS_FREE_MESSAGES
}

export function recordAnonymousOutboundMessage(): void {
  const next = getAnonymousOutboundCount() + 1
  try {
    localStorage.setItem(STORAGE_KEY, String(next))
  } catch {
    /* private mode */
  }
}

export function remainingAnonymousMessages(): number {
  return Math.max(0, ANONYMOUS_FREE_MESSAGES - getAnonymousOutboundCount())
}
