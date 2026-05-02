import { useMemo, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { getProfileById } from '../data/mockProfiles'
import {
  getRecentChatsSnapshot,
  parseRecentChatsJson,
  subscribeRecentChats,
} from '../utils/recentChats'

function formatOpened(ts: number): string {
  const d = new Date(ts)
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
  const recentJson = useSyncExternalStore(
    subscribeRecentChats,
    getRecentChatsSnapshot,
    () => '[]',
  )
  const recent = useMemo(() => parseRecentChatsJson(recentJson), [recentJson])

  const rows = useMemo(() => {
    return recent
      .map((e) => {
        const p = getProfileById(e.profileId)
        if (!p) return null
        return { entry: e, profile: p }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [recent])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Chats
        </h1>
        <p className="mt-1 text-sm text-slate-600">Conversations you have opened recently.</p>
      </header>

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
            {rows.map(({ entry, profile }) => (
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
                      {formatOpened(entry.openedAt)} · <span className="text-sky-700">Open</span>
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
