const STORAGE_KEY = 'velvet_chat_unread'

export const UNREAD_CHATS_EVENT = 'velvet-chat-unread'

export function subscribeUnreadChats(callback: () => void) {
  const onLocal = () => callback()
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) callback()
  }
  window.addEventListener(UNREAD_CHATS_EVENT, onLocal)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(UNREAD_CHATS_EVENT, onLocal)
    window.removeEventListener('storage', onStorage)
  }
}

/** Stable snapshot for `useSyncExternalStore`. */
export function getUnreadSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '{}'
  } catch {
    return '{}'
  }
}

function parseCounts(raw: string): Record<string, number> {
  try {
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object' || Array.isArray(o)) return {}
    const out: Record<string, number> = {}
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) out[k] = Math.min(999, Math.floor(v))
    }
    return out
  } catch {
    return {}
  }
}

export function getTotalUnreadFromSnapshot(raw: string): number {
  const m = parseCounts(raw)
  let sum = 0
  for (const n of Object.values(m)) sum += n
  return sum
}

function writeCounts(m: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m))
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event(UNREAD_CHATS_EVENT))
}

/** Call when a reply arrives while the user is not viewing that thread. */
export function incrementUnread(profileId: string) {
  const id = profileId.trim()
  if (!id) return
  const m = parseCounts(getUnreadSnapshot())
  m[id] = (m[id] ?? 0) + 1
  writeCounts(m)
}

/** Call when the user opens a conversation for that profile. */
export function clearUnread(profileId: string) {
  const id = profileId.trim()
  if (!id) return
  const m = parseCounts(getUnreadSnapshot())
  if (!(id in m)) return
  delete m[id]
  writeCounts(m)
}
