import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useCredits } from '../contexts/CreditsContext'
import { CREDITS_PER_MESSAGE } from '../constants/credits'
import { getProfileById } from '../data/mockProfiles'
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

export function ChatPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const { balance, trySpendCredits, openBuyCredits } = useCredits()
  const listRef = useRef<HTMLDivElement>(null)
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const profile = useMemo(
    () => (profileId ? getProfileById(profileId) : undefined),
    [profileId],
  )

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!profileId) return []
    const p = getProfileById(profileId)
    if (!p) return []
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
    return () => {
      if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current)
    }
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, themTyping])

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
    replyTimerRef.current = window.setTimeout(() => {
      replyTimerRef.current = null
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
    }, delay)
  }, [draft, profile, themTyping, trySpendCredits, openBuyCredits])

  if (!profileId) {
    return <Navigate to="/" replace />
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 px-4 text-center text-white">
        <p className="font-display text-lg font-semibold">This profile isn’t available.</p>
        <p className="mt-2 text-sm text-stone-400">She may have been updated or removed.</p>
        <Link
          to="/"
          className="mt-8 rounded-full bg-white px-6 py-2.5 font-display text-sm font-semibold text-stone-900 transition hover:bg-stone-200"
        >
          Back to browse
        </Link>
      </div>
    )
  }

  const fn = firstName(profile.name)

  return (
    <div className="flex min-h-[100dvh] flex-col bg-stone-950">
      <header className="flex items-center gap-3 border-b border-stone-800 bg-stone-900 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-800 hover:text-white"
          aria-label="Go back"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img
          src={profile.imageUrl}
          alt=""
          className="size-11 shrink-0 rounded-full object-cover ring-2 ring-rose-500/40"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-base font-bold text-white">{profile.name}</h1>
          <p className="truncate text-xs text-rose-300/90">{profile.moodLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden tabular-nums text-xs font-medium text-stone-400 sm:inline">
            {balance} cr
          </span>
          <button
            type="button"
            onClick={openBuyCredits}
            className="rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-2.5 py-1.5 font-display text-[11px] font-semibold text-white shadow-md transition hover:brightness-110 sm:px-3 sm:text-xs"
          >
            Buy
          </button>
          <Link
            to="/"
            className="hidden rounded-full border border-stone-700 bg-stone-800/80 px-3 py-1.5 text-xs font-semibold text-stone-200 transition hover:bg-stone-800 sm:inline"
          >
            Home
          </Link>
        </div>
      </header>

      <div
        ref={listRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto bg-stone-950 px-3 py-4 sm:px-4"
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
                  ? 'rounded-br-md bg-gradient-to-br from-rose-500 to-violet-600 text-white'
                  : 'rounded-bl-md bg-stone-800 text-stone-100 ring-1 ring-stone-700'
              }`}
            >
              {m.role === 'them' && (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-rose-400">
                  {fn}
                </p>
              )}
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {themTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-stone-800 px-4 py-3 text-sm text-stone-400 ring-1 ring-stone-700">
              <span className="inline-flex gap-1">
                <span className="size-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.2s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.1s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-stone-400" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-stone-800 bg-stone-900 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
        {balance < CREDITS_PER_MESSAGE && (
          <p className="mx-auto mb-2 max-w-3xl rounded-xl border border-amber-500/30 bg-amber-950/50 px-3 py-2 text-center text-xs font-medium text-amber-100/90 sm:text-sm">
            You’re out of credits.{' '}
            <button
              type="button"
              className="font-semibold text-rose-300 underline decoration-rose-300/60 hover:text-rose-200"
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
            className="min-w-0 flex-1 rounded-2xl border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 outline-none ring-violet-500/30 transition placeholder:text-stone-500 focus:border-violet-500 focus:ring-4"
          />
          <button
            type="submit"
            disabled={!draft.trim() || themTyping || balance < CREDITS_PER_MESSAGE}
            className="shrink-0 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-3 font-display text-sm font-semibold text-white shadow-md transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
