import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getProfileById } from '../data/mockProfiles'
import { fetchChatThreadsForUser, parseMessagesJsonb } from '../lib/api/chatThreads'
import { tryGetSupabaseBrowserClient } from '../lib/supabase/client'
import {
  getUnreadSnapshot,
  parseUnreadCounts,
  subscribeUnreadChats,
} from '../utils/chatUnread'

function formatUnknownError(e: unknown): string {
  if (e instanceof Error && e.message.trim()) return e.message.trim()
  if (typeof e === 'object' && e !== null) {
    const o = e as Record<string, unknown>
    const bits = [o.message, o.details, o.hint].filter(
      (x): x is string => typeof x === 'string' && x.trim().length > 0,
    )
    if (bits.length) return bits.join(' — ')
  }
  if (typeof e === 'string' && e.trim()) return e.trim()
  return ''
}

function looksLikeInvalidJwtMessage(msg: string): boolean {
  const m = msg.toLowerCase()
  return (
    m.includes('jwt expired') ||
    m.includes('invalid jwt') ||
    m.includes('jwt signature') ||
    m.includes('pgrst301') ||
    m.includes('pgrst303')
  )
}

function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** Relative line in the Messages list (today = clock, else Yesterday / Nd ago / date). */
function formatMessageListTime(ms: number): string {
  if (!Number.isFinite(ms)) return ''
  const d = new Date(ms)
  const now = new Date()
  const diffDays = Math.round((startOfLocalDay(now) - startOfLocalDay(d)) / 86_400_000)
  if (diffDays === 0) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays < 7) return `${diffDays}d ago`
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d)
}

function MessagesGuidelineBanner() {
  return (
    <p
      className="rounded-xl bg-stone-50 px-3.5 py-3.5 text-center text-sm leading-relaxed text-stone-600 ring-1 ring-stone-200/80"
      role="note"
    >
      Please be respectful — honour privacy and personal boundaries.
    </p>
  )
}

function ChatsPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-canvas">
      <p className="text-base font-medium text-stone-600">Loading…</p>
    </div>
  )
}

function ChatsAuthGate() {
  const { openAuthModal } = useAuth()
  return (
    <div className="min-h-screen bg-warm-canvas text-stone-900">
      <h1 className="sr-only">Messages</h1>
      <div className="mx-auto flex max-w-lg flex-col px-4 py-10 pt-[max(2rem,env(safe-area-inset-top))] sm:px-6 sm:py-14">
        <p className="font-[family-name:var(--font-brand-serif)] text-2xl font-semibold tracking-tight text-stone-900">
          Messages
        </p>
        <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50/80 p-8 text-center shadow-sm shadow-black/[0.03]">
          <h2 className="font-display text-lg font-bold text-stone-900">Sign in to continue</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Sign in or create an account to see your conversations. You can start a chat from Discover once you&apos;re
            logged in.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal({ returnTo: '/chats' })}
            className="mt-8 min-h-[3rem] w-full rounded-xl bg-stone-900 py-3.5 font-display text-base font-semibold text-white shadow-md transition hover:bg-stone-800"
          >
            Sign in or sign up
          </button>
        </div>
      </div>
    </div>
  )
}

type Row = {
  threadId: string
  profileId: string
  preview: string
  lastMessageAt: number
  profile: NonNullable<ReturnType<typeof getProfileById>>
}

function ChatsPageContent() {
  const { user } = useAuth()
  const supabase = tryGetSupabaseBrowserClient()
  const [rows, setRows] = useState<Row[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listErr, setListErr] = useState<string | null>(null)

  const unreadSnapshot = useSyncExternalStore(subscribeUnreadChats, getUnreadSnapshot, () => '{}')
  const unreadByProfile = useMemo(() => parseUnreadCounts(unreadSnapshot), [unreadSnapshot])

  const reload = useCallback(async () => {
    if (!user?.id || !supabase) {
      setRows([])
      setListLoading(false)
      setListErr(null)
      return
    }
    setListLoading(true)
    setListErr(null)
    try {
      const { data: authUserData, error: authUserErr } = await supabase.auth.getUser()
      if (authUserErr) {
        const code =
          typeof authUserErr === 'object' && authUserErr && 'code' in authUserErr
            ? String((authUserErr as { code?: string }).code)
            : ''
        const status =
          typeof authUserErr === 'object' && authUserErr && 'status' in authUserErr
            ? Number((authUserErr as { status?: number }).status)
            : NaN
        const em = formatUnknownError(authUserErr)
        const shouldSignOut =
          status === 401 ||
          status === 403 ||
          ['bad_jwt', 'session_not_found', 'invalid_refresh_token', 'refresh_token_not_found'].includes(code) ||
          looksLikeInvalidJwtMessage(em)
        if (shouldSignOut) {
          await supabase.auth.signOut()
          return
        }
      } else if (!authUserData.user) {
        await supabase.auth.signOut()
        return
      }

      const threads = await fetchChatThreadsForUser(supabase, user.id)
      const next: Row[] = []
      for (const t of threads) {
        const p = getProfileById(t.companion_profile_id)
        if (!p) continue
        const msgs = parseMessagesJsonb(t.messages)
        const last = msgs[msgs.length - 1]
        const preview =
          last?.text?.trim() ||
          (msgs.length === 0 ? 'Tap to start chatting' : 'Tap to chat')
        const updated = Date.parse(t.updated_at)
        const lastMessageAt =
          last && Number.isFinite(last.createdAt) ? last.createdAt : Number.isFinite(updated) ? updated : Date.now()
        next.push({
          threadId: t.id,
          profileId: t.companion_profile_id,
          preview,
          lastMessageAt,
          profile: p,
        })
      }
      setRows(next)
    } catch (e) {
      const msg = formatUnknownError(e)
      if (msg && looksLikeInvalidJwtMessage(msg)) {
        await supabase.auth.signOut()
        return
      }
      setListErr(msg || 'Could not load chats')
      setRows([])
    } finally {
      setListLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void reload()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [reload])

  const empty = useMemo(() => !listLoading && !listErr && rows.length === 0, [listLoading, listErr, rows.length])

  return (
    <div className="min-h-screen bg-warm-canvas text-stone-900">
      <header className="flex items-center px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <h1 className="font-[family-name:var(--font-brand-serif)] text-2xl font-semibold tracking-tight text-stone-900">
          Messages
        </h1>
      </header>

      <div className="mx-auto max-w-lg px-4 pb-6">
        <MessagesGuidelineBanner />

        {listLoading ? (
          <p className="py-10 text-center text-sm text-stone-500">Loading your messages…</p>
        ) : null}

        {listErr ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-4 text-center">
            <p className="text-sm font-medium text-red-900">{listErr}</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="mt-3 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : null}

        {empty ? (
          <div className="mt-8 border-t border-stone-100 pt-8 text-center">
            <p className="font-display text-base font-semibold text-stone-900">No conversations yet</p>
            <p className="mt-2 text-sm text-stone-600">
              Go to Discover and tap a profile to <span className="font-semibold">start a chat</span>.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-2.5 font-display text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Discover
            </Link>
          </div>
        ) : null}

        {!listLoading && !listErr && rows.length > 0 ? (
          <ul className="mt-4 divide-y divide-stone-100 border-t border-stone-100">
            {rows.map((row) => {
              const unread = unreadByProfile[row.profileId] ?? 0
              return (
                <li key={row.threadId}>
                  <Link
                    to={`/chat/${row.profile.id}`}
                    className="flex items-center gap-3 py-3.5 pr-1 transition active:bg-stone-50"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={row.profile.imageUrl}
                        alt=""
                        className="size-14 rounded-full object-cover ring-1 ring-black/5"
                      />
                      {row.profile.isOnline ? (
                        <span
                          className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-white"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[15px] font-bold text-black">{row.profile.name}</p>
                      <p className="mt-0.5 truncate text-sm text-stone-500">{row.preview}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="whitespace-nowrap text-xs tabular-nums text-stone-500">
                        {formatMessageListTime(row.lastMessageAt)}
                      </span>
                      {unread > 0 ? (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

export function ChatsPage() {
  const { session, authReady } = useAuth()
  const supabase = tryGetSupabaseBrowserClient()
  if (!authReady) return <ChatsPageLoading />
  if (!session || !supabase) return <ChatsAuthGate />
  return <ChatsPageContent />
}
