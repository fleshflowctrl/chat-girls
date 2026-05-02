import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCredits } from '../contexts/CreditsContext'
import { CREDITS_PER_MESSAGE } from '../constants/credits'
import { getProfileById } from '../data/mockProfiles'
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
  const { balance, trySpendCredits, openBuyCredits } = useCredits()
  const listRef = useRef<HTMLDivElement>(null)
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const viewOpenRef = useRef(true)
  /** Bumped on mount/unmount so late reply timers do not touch a new session or call setState after unmount. */
  const generationRef = useRef(0)

  const profile = useMemo(
    () => (profileId ? getProfileById(profileId) : undefined),
    [profileId],
  )

  useEffect(() => {
    if (profileId && profile) recordChatOpened(profileId)
  }, [profileId, profile])

  useEffect(() => {
    generationRef.current += 1
    viewOpenRef.current = true
    clearUnread(profileId)
    return () => {
      viewOpenRef.current = false
      generationRef.current += 1
    }
  }, [profileId])

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!profileId) return []
    const p = getProfileById(profileId)
    if (!p) return []
    const saved = loadThreadMessages(profileId)
    if (saved) return saved
    const opener = `Hey… it’s ${firstName(p.name)}. I’ve been hoping you’d message. What’s on your mind?`
    return [
      {
        id: newId(),
        role: 'them' as const,
        text: opener,
        createdAt: Date.now(),
      },
    ]
  })
  const [draft, setDraft] = useState('')
  const [themTyping, setThemTyping] = useState(false)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, themTyping])

  useEffect(() => {
    if (!profileId || !profile) return
    saveThreadMessages(profileId, messages)
  }, [profileId, profile, messages])

  useEffect(() => {
    if (!profileId) return
    const k = threadStorageKey(profileId)
    const onStorage = (e: StorageEvent) => {
      if (e.key !== k || e.newValue == null) return
      const next = parseThreadMessagesJson(e.newValue)
      if (next) setMessages(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [profileId])

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center text-slate-900">
        <p className="font-display text-lg font-semibold">This profile isn’t available.</p>
        <p className="mt-2 text-sm text-slate-600">She may have been updated or removed.</p>
        <Link
          to="/"
          className="mt-8 rounded-full bg-slate-900 px-6 py-2.5 font-display text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to browse
        </Link>
      </div>
    )
  }

  const fn = firstName(profile.name)

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-slate-100">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Go back"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img
          src={profile.imageUrl}
          alt=""
          className="size-11 shrink-0 rounded-full object-cover ring-2 ring-slate-200"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-base font-bold text-slate-900">{profile.name}</h1>
          <p className="truncate text-xs text-slate-600">{profile.moodLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="tabular-nums text-xs font-medium text-slate-500">{balance} cr</span>
          <Link
            to="/"
            className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 sm:inline"
          >
            Home
          </Link>
        </div>
      </header>

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain bg-slate-100 px-3 py-4 sm:px-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[70%] ${
                m.role === 'user'
                  ? 'rounded-br-md bg-slate-900 text-white shadow-slate-900/15'
                  : 'rounded-bl-md border border-slate-200 bg-white text-slate-900 shadow-slate-900/5'
              }`}
            >
              {m.role === 'them' && (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {fn}
                </p>
              )}
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {themTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">
              <span className="inline-flex gap-1">
                <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
        {balance < CREDITS_PER_MESSAGE && (
          <p className="mx-auto mb-2 max-w-3xl rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-center text-xs font-medium text-amber-950/90 sm:text-sm">
            You’re out of credits.{' '}
            <button
              type="button"
              className="font-semibold text-slate-900 underline decoration-slate-400 hover:decoration-slate-600"
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
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-slate-400/0 transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-300/40"
          />
          <button
            type="submit"
            disabled={!draft.trim() || themTyping || balance < CREDITS_PER_MESSAGE}
            className="shrink-0 rounded-2xl bg-slate-900 px-5 py-3 font-display text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
