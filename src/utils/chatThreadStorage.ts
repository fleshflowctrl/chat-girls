import type { ChatMessage } from '../types/chat'

const PREFIX = 'velvet_chat_thread_'

export function threadStorageKey(profileId: string): string {
  return PREFIX + encodeURIComponent(profileId.trim())
}

/** Profile ids that have a non-empty saved thread in this browser (for migration). */
export function listLocalThreadProfileIds(): string[] {
  const out: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k?.startsWith(PREFIX)) continue
      const encoded = k.slice(PREFIX.length)
      try {
        out.push(decodeURIComponent(encoded))
      } catch {
        /* ignore bad keys */
      }
    }
  } catch {
    /* access denied */
  }
  return out
}

function isMessage(x: unknown): x is ChatMessage {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    (o.role === 'user' || o.role === 'them') &&
    typeof o.text === 'string' &&
    typeof o.createdAt === 'number'
  )
}

/** Returns saved messages, or `null` if nothing valid is stored. */
export function loadThreadMessages(profileId: string): ChatMessage[] | null {
  const id = profileId.trim()
  if (!id) return null
  try {
    const raw = localStorage.getItem(threadStorageKey(id))
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const msgs = parsed.filter(isMessage)
    return msgs.length > 0 ? msgs : null
  } catch {
    return null
  }
}

export function saveThreadMessages(profileId: string, messages: ChatMessage[]): void {
  const id = profileId.trim()
  if (!id) return
  try {
    if (messages.length === 0) {
      localStorage.removeItem(threadStorageKey(id))
      return
    }
    localStorage.setItem(threadStorageKey(id), JSON.stringify(messages))
  } catch {
    /* quota / private mode */
  }
}

export function parseThreadMessagesJson(raw: string): ChatMessage[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const msgs = parsed.filter(isMessage)
    return msgs.length > 0 ? msgs : null
  } catch {
    return null
  }
}
