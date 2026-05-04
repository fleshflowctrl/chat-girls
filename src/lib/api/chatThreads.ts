import type { SupabaseClient } from '@supabase/supabase-js'
import type { ChatMessage } from '../../types/chat'

const TABLE = 'chat_threads'

function postgrestErrorBlob(err: { message?: string; details?: string; hint?: string; code?: string }): string {
  return [err.message, err.details, err.hint, err.code].filter(Boolean).join(' ')
}

/** Older DBs may lack the `messages` jsonb column. */
function looksLikeMissingMessagesColumn(err: {
  message?: string
  details?: string
  hint?: string
  code?: string
}): boolean {
  const t = postgrestErrorBlob(err)
  if (/messages/i.test(t) && /(could not find|does not exist|unknown column|schema cache)/i.test(t)) return true
  if (err.code === '42703') return true
  return false
}

export function parseMessagesJsonb(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return []
  const out: ChatMessage[] = []
  for (const x of raw) {
    if (typeof x !== 'object' || x === null) continue
    const o = x as Record<string, unknown>
    if (typeof o.id !== 'string' || (o.role !== 'user' && o.role !== 'them') || typeof o.text !== 'string') continue
    let createdAt: number
    if (typeof o.createdAt === 'number' && Number.isFinite(o.createdAt)) {
      createdAt = o.createdAt
    } else if (typeof o.createdAt === 'string') {
      const n = Number(o.createdAt)
      if (!Number.isFinite(n)) continue
      createdAt = n
    } else {
      continue
    }
    out.push({ id: o.id, role: o.role, text: o.text, createdAt })
  }
  return out
}

export function messagesToJsonb(messages: ChatMessage[]): unknown {
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    text: m.text,
    createdAt: m.createdAt,
  }))
}

export type ChatThreadRow = {
  id: string
  companion_profile_id: string
  messages: ChatMessage[]
  updated_at: string
}

/** Load or create the thread row for this user + companion. */
export async function ensureChatThread(
  supabase: SupabaseClient,
  userId: string,
  companionProfileId: string,
): Promise<{ threadId: string; messages: ChatMessage[] }> {
  const cid = companionProfileId.trim()
  const fullSel = await supabase
    .from(TABLE)
    .select('id, messages')
    .eq('user_id', userId)
    .eq('companion_profile_id', cid)
    .maybeSingle()

  let existing: { id: string; messages?: unknown } | null = null
  if (fullSel.error) {
    if (!looksLikeMissingMessagesColumn(fullSel.error)) throw fullSel.error
    const slim = await supabase
      .from(TABLE)
      .select('id')
      .eq('user_id', userId)
      .eq('companion_profile_id', cid)
      .maybeSingle()
    if (slim.error) throw slim.error
    existing = slim.data ? { id: slim.data.id as string } : null
  } else {
    existing = fullSel.data as { id: string; messages?: unknown } | null
  }

  if (existing) {
    return {
      threadId: existing.id,
      messages: parseMessagesJsonb('messages' in existing ? existing.messages : []),
    }
  }

  let ins = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      companion_profile_id: cid,
      messages: [],
    })
    .select('id, messages')
    .single()

  if (ins.error && looksLikeMissingMessagesColumn(ins.error)) {
    ins = await supabase
      .from(TABLE)
      .insert({
        user_id: userId,
        companion_profile_id: cid,
      })
      .select('id')
      .single()
  }

  if (ins.error) throw ins.error
  const inserted = ins.data as { id: string; messages?: unknown }
  return {
    threadId: inserted.id,
    messages: parseMessagesJsonb('messages' in inserted && inserted.messages !== undefined ? inserted.messages : []),
  }
}

export async function updateThreadMessages(
  supabase: SupabaseClient,
  threadId: string,
  messages: ChatMessage[],
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ messages: messagesToJsonb(messages) as never })
    .eq('id', threadId)
  if (!error) return
  if (looksLikeMissingMessagesColumn(error)) return
  throw error
}

export type ChatThreadListItem = {
  id: string
  companion_profile_id: string
  updated_at: string
  messages: unknown
}

export async function fetchChatThreadsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ChatThreadListItem[]> {
  const full = await supabase
    .from(TABLE)
    .select('id, companion_profile_id, updated_at, messages')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (!full.error) {
    return (full.data ?? []) as ChatThreadListItem[]
  }

  if (looksLikeMissingMessagesColumn(full.error)) {
    const slim = await supabase
      .from(TABLE)
      .select('id, companion_profile_id, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (!slim.error) {
      const rows = (slim.data ?? []) as Omit<ChatThreadListItem, 'messages'>[]
      return rows.map((r) => ({ ...r, messages: [] }))
    }
    throw slim.error
  }

  throw full.error
}
