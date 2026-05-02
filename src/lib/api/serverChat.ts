import type { SupabaseClient } from '@supabase/supabase-js'
import type { ChatMessage } from '../../types/chat'
import { loadThreadMessages, listLocalThreadProfileIds } from '../../utils/chatThreadStorage'

function rowsFromMessages(threadId: string, messages: ChatMessage[]) {
  return messages.map((m) => ({
    id: m.id,
    thread_id: threadId,
    role: m.role,
    body: m.text,
    created_at_ms: m.createdAt,
  }))
}

function messagesFromRows(
  rows: { id: string; role: string; body: string; created_at_ms: number }[],
): ChatMessage[] {
  return rows
    .filter((r) => r.role === 'user' || r.role === 'them')
    .map((r) => ({
      id: r.id,
      role: r.role as ChatMessage['role'],
      text: r.body,
      createdAt: r.created_at_ms,
    }))
}

export async function ensureChatThread(
  client: SupabaseClient,
  userId: string,
  companionProfileId: string,
): Promise<string | null> {
  const cid = companionProfileId.trim()
  if (!cid) return null
  const { data, error } = await client
    .from('chat_threads')
    .upsert(
      { user_id: userId, companion_profile_id: cid, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,companion_profile_id' },
    )
    .select('id')
    .single()
  if (error) {
    console.warn('[serverChat] ensureChatThread', error.message)
    return null
  }
  return data?.id ?? null
}

export async function fetchThreadMessages(
  client: SupabaseClient,
  threadId: string,
): Promise<ChatMessage[]> {
  const { data, error } = await client
    .from('chat_messages')
    .select('id, role, body, created_at_ms')
    .eq('thread_id', threadId)
    .order('created_at_ms', { ascending: true })
  if (error || !data) {
    if (error) console.warn('[serverChat] fetchThreadMessages', error.message)
    return []
  }
  return messagesFromRows(data)
}

/** Replace all messages for a thread (simple sync for modest histories). */
export async function replaceThreadMessages(
  client: SupabaseClient,
  threadId: string,
  messages: ChatMessage[],
): Promise<boolean> {
  const { error: delErr } = await client.from('chat_messages').delete().eq('thread_id', threadId)
  if (delErr) {
    console.warn('[serverChat] delete messages', delErr.message)
    return false
  }
  if (messages.length === 0) {
    await client.from('chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId)
    return true
  }
  const { error: insErr } = await client.from('chat_messages').insert(rowsFromMessages(threadId, messages))
  if (insErr) {
    console.warn('[serverChat] insert messages', insErr.message)
    return false
  }
  await client.from('chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId)
  return true
}

export type ServerChatThreadRow = {
  companion_profile_id: string
  updated_at: string
}

export async function listChatThreads(client: SupabaseClient): Promise<ServerChatThreadRow[]> {
  const { data, error } = await client
    .from('chat_threads')
    .select('companion_profile_id, updated_at')
    .order('updated_at', { ascending: false })
  if (error || !data) {
    if (error) console.warn('[serverChat] listChatThreads', error.message)
    return []
  }
  return data as ServerChatThreadRow[]
}

/** Upload local threads into Supabase (idempotent upsert by message id). */
export async function migrateLocalChatsToSupabase(
  client: SupabaseClient,
  userId: string,
): Promise<void> {
  const ids = listLocalThreadProfileIds()
  for (const profileId of ids) {
    const messages = loadThreadMessages(profileId)
    if (!messages?.length) continue
    const threadId = await ensureChatThread(client, userId, profileId)
    if (!threadId) continue
    const { error } = await client.from('chat_messages').upsert(rowsFromMessages(threadId, messages), {
      onConflict: 'id',
      ignoreDuplicates: false,
    })
    if (error) console.warn('[serverChat] migrate messages', profileId, error.message)
    await client.from('chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId)
  }
}
