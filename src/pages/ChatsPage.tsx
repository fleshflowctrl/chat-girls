import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { DiscreetNoticeBar } from '../components/DiscreetNoticeBar'
import { getProfileById } from '../data/mockProfiles'
import { listChatThreads, type ServerChatThreadRow } from '../lib/api/serverChat'
import { tryGetSupabaseBrowserClient } from '../lib/supabase/client'
import {
  getRecentChatsSnapshot,
  parseRecentChatsJson,
  subscribeRecentChats,
} from '../utils/recentChats'

function formatOpened(d: Date): string {
  const now = new Date()
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (sameDay) return 'Today'
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  const yest =
    d.getDate() === y.getDate() &&
    d.getMonth() === y.getMonth() &&
    d.getFullYear() === y.getFullYear()
  if (yest) return 'Yesterday'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d)
}

export function ChatsPage() {
  const { user } = useAuth()
  const recentJson = useSyncExternalStore(
    subscribeRecentChats,
    getRecentChatsSnapshot,
    () => '[]',
  )
  const recent = useMemo(() => parseRecentChatsJson(recentJson), [recentJson])

  const [serverThreads, setServerThreads] = useState<ServerChatThreadRow[]>([])

  const refreshServerThreads = useCallback(() => {
    const client = tryGetSupabaseBrowserClient()
    if (!user || !client) {
      setServerThreads([])
      return
    }
    void listChatThreads(client).then(setServerThreads)
  }, [user])

  useEffect(() => {
    queueMicrotask(() => refreshServerThreads())
  }, [refreshServerThreads])

  useEffect(() => {
    const onMigrated = () => refreshServerThreads()
    window.addEventListener('velvet-server-chats-migrated', onMigrated)
    return () => window.removeEventListener('velvet-server-chats-migrated', onMigrated)
  }, [refreshServerThreads])

  const rows = useMemo(() => {
    if (user) {
      return serverThreads
        .map((t) => {
          const p = getProfileById(t.companion_profile_id)
          if (!p) return null
          const openedAt = new Date(t.updated_at).getTime()
          return { profile: p, openedAt, key: p.id }
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
    }
    return recent
      .map((e) => {
        const p = getProfileById(e.profileId)
        if (!p) return null
        return { profile: p, openedAt: e.openedAt, key: p.id }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [user, recent, serverThreads])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DiscreetNoticeBar />

      <div className="mx-auto max-w-lg px-3 py-4 sm:px-4">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <p className="font-display text-base font-semibold text-slate-800">No chats yet</p>
            <p className="mt-2 text-sm text-slate-600">
              Browse profiles on Home and tap <span className="font-semibold">Chat now</span> to start.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 font-display text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to Home
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map(({ profile, openedAt }) => (
              <li key={profile.id}>
                <Link
                  to={`/chat/${profile.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <img
                    src={profile.imageUrl}
                    alt=""
                    className="size-14 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold text-slate-900">{profile.name}</p>
                    <p className="truncate text-sm text-slate-600">{profile.moodLabel}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatOpened(new Date(openedAt))} · <span className="text-sky-700">Open</span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
