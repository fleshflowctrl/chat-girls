import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCredits } from '../contexts/CreditsContext'
import { CREDITS_PER_MESSAGE } from '../constants/credits'
import { getProfileById } from '../data/mockProfiles'
import { ensureChatThread, updateThreadMessages } from '../lib/api/chatThreads'
import { tryGetSupabaseBrowserClient } from '../lib/supabase/client'
import { clearUnread, incrementUnread } from '../utils/chatUnread'
import {
  loadThreadMessages,
  parseThreadMessagesJson,
  saveThreadMessages,
  threadStorageKey,
} from '../utils/chatThreadStorage'
import { recordChatOpened } from '../utils/recentChats'
import type { ChatMessage } from '../types/chat'

const MOCK_REPLIES = [
  'Mmm, tell me more… I like where this is going.',
  'You always know how to make me smile.',
  'I was just thinking about you. Coincidence?',
  'Keep going — I’m listening.',
  'That’s so you. I love it.',
  'You’re trouble. The good kind.',
  'I wish I could lean in closer right now.',
  'Say that again, slower.',
  'You have my full attention.',
  'Flirty today? I’m not complaining.',
]

function firstName(full: string): string {
  return full.split(/\s+/)[0] ?? full
}

function randomReply(): string {
  return MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)]!
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

type ChatPageProps = {
  profileId: string
}

export function ChatPage({ profileId }: ChatPageProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const supabase = tryGetSupabaseBrowserClient()
  const useRemote = Boolean(user?.id && supabase && profileId)
  const { balance, trySpendCredits, openBuyCredits } = useCredits()
  const listRef = useRef<HTMLDivElement>(null)
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const viewOpenRef = useRef(true)
  /** Bumped on mount/unmount so late reply timers do not touch a new session or call setState after unmount. */
  const generationRef = useRef(0)
  const threadIdRef = useRef<string | null>(null)

  const profile = useMemo(
    () => (profileId ? getProfileById(profileId) : undefined),
    [profileId],
  )

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [threadId, setThreadId] = useState<string | null>(null)
  const [remotePhase, setRemotePhase] = useState<'off' | 'loading' | 'live' | 'err'>('off')
  const [draft, setDraft] = useState('')
  const [themTyping, setThemTyping] = useState(false)

  useEffect(() => {
    threadIdRef.current = threadId
  }, [threadId])

  useEffect(() => {
    if (profileId && profile && !useRemote) recordChatOpened(profileId)
  }, [profileId, profile, useRemote])

  useEffect(() => {
    generationRef.current += 1
    viewOpenRef.current = true
    clearUnread(profileId)
    return () => {
      viewOpenRef.current = false
      generationRef.current += 1
    }
  }, [profileId])

  useEffect(() => {
    if (!profileId || !profile) {
      setMessages([])
      setThreadId(null)
      setRemotePhase('off')
      return
    }

    if (!useRemote || !user?.id || !supabase) {
      setRemotePhase('off')
      setThreadId(null)
      const saved = loadThreadMessages(profileId)
      const opener = `Hey… it’s ${firstName(profile.name)}. I’ve been hoping you’d message. What’s on your mind?`
      setMessages(
        saved ?? [
          {
            id: newId(),
            role: 'them' as const,
            text: opener,
            createdAt: Date.now(),
          },
        ],
      )
      return
    }

    setRemotePhase('loading')
    const openerEarly = `Hey… it’s ${firstName(profile.name)}. I’ve been hoping you’d message. What’s on your mind?`
    const savedEarly = loadThreadMessages(profileId)
    setMessages(
      savedEarly?.length
        ? savedEarly
        : [
            {
              id: newId(),
              role: 'them' as const,
              text: openerEarly,
              createdAt: Date.now(),
            },
          ],
    )

    let cancelled = false

    void (async () => {
      try {
        const { threadId: tid, messages: remote } = await ensureChatThread(supabase, user.id, profileId)
        if (cancelled) return

        let next = remote
        if (!remote.length) {
          const local = loadThreadMessages(profileId)
          if (local?.length) {
            next = local
            await updateThreadMessages(supabase, tid, next)
            saveThreadMessages(profileId, [])
          } else {
            const opener = `Hey… it’s ${firstName(profile.name)}. I’ve been hoping you’d message. What’s on your mind?`
            next = [
              {
                id: newId(),
                role: 'them' as const,
                text: opener,
                createdAt: Date.now(),
              },
            ]
            await updateThreadMessages(supabase, tid, next)
          }
        }

        if (cancelled) return
        setThreadId(tid)
        setMessages(next)
        setRemotePhase('live')
      } catch {
        if (cancelled) return
        setRemotePhase('err')
        setThreadId(null)
        const saved = loadThreadMessages(profileId)
        const opener = `Hey… it’s ${firstName(profile.name)}. I’ve been hoping you’d message. What’s on your mind?`
        setMessages(
          saved ?? [
            {
              id: newId(),
              role: 'them' as const,
              text: opener,
              createdAt: Date.now(),
            },
          ],
        )
      }
    })()

    return () => {
      cancelled = true
    }
  }, [profileId, profile, useRemote, user?.id, supabase])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, themTyping])

  useEffect(() => {
    if (!profileId || !profile || useRemote) return
    saveThreadMessages(profileId, messages)
  }, [profileId, profile, messages, useRemote])

  useEffect(() => {
    if (!profileId || useRemote) return
    const k = threadStorageKey(profileId)
    const onStorage = (e: StorageEvent) => {
      if (e.key !== k || e.newValue == null) return
      const parsed = parseThreadMessagesJson(e.newValue)
      if (parsed) setMessages(parsed)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [profileId, useRemote])

  useEffect(() => {
    if (!useRemote || !supabase || !threadId || remotePhase !== 'live') return
    const t = window.setTimeout(() => {
      void updateThreadMessages(supabase, threadId, messages).catch(() => {})
    }, 650)
    return () => window.clearTimeout(t)
  }, [messages, threadId, useRemote, remotePhase, supabase])

  const send = useCallback(() => {
    const text = draft.trim()
    if (!text || !profile || themTyping) return

    if (!trySpendCredits(CREDITS_PER_MESSAGE)) {
      openBuyCredits()
      return
    }

    const userMsg: ChatMessage = {
      id: newId(),
      role: 'user',
      text,
      createdAt: Date.now(),
    }
    setDraft('')
    setMessages((m) => [...m, userMsg])
    setThemTyping(true)

    // Later: stream from chat API / WebSocket instead of a timed mock reply.
    if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current)
    const delay = 700 + Math.random() * 1200
    const scheduledGen = generationRef.current
    replyTimerRef.current = window.setTimeout(() => {
      replyTimerRef.current = null
      if (scheduledGen !== generationRef.current) {
        incrementUnread(profileId)
        return
      }
      if (viewOpenRef.current) {
        setMessages((m) => [
          ...m,
          {
            id: newId(),
            role: 'them',
            text: randomReply(),
            createdAt: Date.now(),
          },
        ])
        setThemTyping(false)
      } else {
        incrementUnread(profileId)
      }
    }, delay)
  }, [draft, profile, profileId, themTyping, trySpendCredits, openBuyCredits])

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center text-stone-900">
        <p className="font-display text-lg font-semibold">This profile isn’t available.</p>
        <p className="mt-2 text-sm text-stone-600">They may have been updated or removed.</p>
        <Link
          to="/"
          className="mt-8 rounded-full bg-stone-900 px-6 py-2.5 font-display text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Back to browse
        </Link>
      </div>
    )
  }

  const fn = firstName(profile.name)
  /** Block send until remote thread is ready; messages stay visible (optimistic opener / cache) while loading. */
  const remoteInputLocked = useRemote && remotePhase === 'loading'

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-stone-100">
      {remotePhase === 'err' && useRemote ? (
        <p className="shrink-0 border-b border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-950">
          Could not sync this chat with your account. You&apos;re viewing a local copy; try refreshing after checking
          your connection.
        </p>
      ) : null}
      <header className="flex shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
          aria-label="Back to home"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img
          src={profile.imageUrl}
          alt=""
          className="size-11 shrink-0 rounded-full object-cover ring-2 ring-stone-200"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-base font-bold text-stone-900">{profile.name}</h1>
          <p className="truncate text-xs text-stone-600">{profile.moodLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="tabular-nums text-xs font-medium text-stone-500">{balance} cr</span>
        </div>
      </header>

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain bg-stone-100 px-3 py-4 sm:px-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {remoteInputLocked ? (
          <p className="shrink-0 text-center text-xs font-medium text-stone-500">Syncing conversation…</p>
        ) : null}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[70%] ${
                m.role === 'user'
                  ? 'rounded-br-md bg-stone-900 text-white shadow-stone-900/15'
                  : 'rounded-bl-md border border-stone-200 bg-white text-stone-900 shadow-stone-900/5'
              }`}
            >
              {m.role === 'them' && (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                  {fn}
                </p>
              )}
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {!remoteInputLocked && themTyping ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-400 shadow-sm">
              <span className="inline-flex gap-1">
                <span className="size-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.2s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.1s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-stone-400" />
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-stone-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
        {balance < CREDITS_PER_MESSAGE && (
          <p className="mx-auto mb-2 max-w-3xl rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-center text-xs font-medium text-amber-950/90 sm:text-sm">
            You’re out of credits.{' '}
            <button
              type="button"
              className="font-semibold text-stone-900 underline decoration-stone-400 hover:decoration-stone-600"
              onClick={openBuyCredits}
            >
              Buy credits
            </button>{' '}
            to keep chatting.
          </p>
        )}
        <form
          className="mx-auto flex max-w-3xl gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Message {fn}
          </label>
          <input
            id="chat-input"
            type="text"
            autoComplete="off"
            placeholder={`Message ${fn}…`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={remoteInputLocked}
            className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none ring-stone-400/0 transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-4 focus:ring-stone-300/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={remoteInputLocked || !draft.trim() || themTyping || balance < CREDITS_PER_MESSAGE}
            className="shrink-0 rounded-2xl bg-stone-900 px-5 py-3 font-display text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
