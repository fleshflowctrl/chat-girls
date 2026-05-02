const STORAGE_KEY = 'velvet_recent_chats'

export const RECENT_CHATS_EVENT = 'velvet-recent-chats'

export function subscribeRecentChats(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) callback()
  }
  const onLocal = () => callback()
  window.addEventListener('storage', onStorage)
  window.addEventListener(RECENT_CHATS_EVENT, onLocal)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(RECENT_CHATS_EVENT, onLocal)
  }
}

export type RecentChatEntry = {
  profileId: string
  openedAt: number
}

/** Stable string for `useSyncExternalStore` — must not return a new reference when data unchanged. */
export function getRecentChatsSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '[]'
  } catch {
    return '[]'
  }
}

export function parseRecentChatsJson(raw: string): RecentChatEntry[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (x): x is RecentChatEntry =>
          typeof x === 'object' &&
          x !== null &&
          typeof (x as RecentChatEntry).profileId === 'string' &&
          typeof (x as RecentChatEntry).openedAt === 'number',
      )
      .sort((a, b) => b.openedAt - a.openedAt)
  } catch {
    return []
  }
}

function readRaw(): RecentChatEntry[] {
  return parseRecentChatsJson(getRecentChatsSnapshot())
}

export function getRecentChats(): RecentChatEntry[] {
  return readRaw()
}

/** Call when opening a conversation so it appears on the Chats tab. */
export function recordChatOpened(profileId: string) {
  const id = profileId.trim()
  if (!id) return
  const now = Date.now()
  const rest = readRaw().filter((e) => e.profileId !== id)
  const next = [{ profileId: id, openedAt: now }, ...rest].slice(0, 30)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event(RECENT_CHATS_EVENT))
}
