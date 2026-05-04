import { useMemo, useSyncExternalStore } from 'react'
import { NavLink } from 'react-router-dom'
import {
  getTotalUnreadFromSnapshot,
  getUnreadSnapshot,
  subscribeUnreadChats,
} from '../../utils/chatUnread'

const navBase =
  'flex min-w-0 min-h-[52px] flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-semibold transition sm:text-[13px]'
const navIdle = 'text-stone-500'
const navActive = 'text-stone-900'

function IconDiscover({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}

function IconMessages({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  )
}

function IconCredits({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function IconMe({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}

export function BottomNav() {
  const unreadJson = useSyncExternalStore(subscribeUnreadChats, getUnreadSnapshot, () => '{}')
  const unreadTotal = useMemo(() => getTotalUnreadFromSnapshot(unreadJson), [unreadJson])

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200/95 bg-warm-canvas pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}
        >
          <IconDiscover className="size-7 shrink-0" />
          Discover
        </NavLink>
        <NavLink
          to="/chats"
          aria-label={unreadTotal > 0 ? `Messages, ${unreadTotal} unread` : 'Messages'}
          className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}
        >
          <span className="relative inline-flex">
            <IconMessages className="size-7 shrink-0" />
            {unreadTotal > 0 ? (
              <span className="absolute -right-1 -top-0.5 flex min-h-[1rem] min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-0.5 font-display text-[9px] font-bold leading-none text-white ring-2 ring-white">
                {unreadTotal > 9 ? '9+' : unreadTotal}
              </span>
            ) : null}
          </span>
          Messages
        </NavLink>
        <NavLink to="/credits" className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}>
          <IconCredits className="size-7 shrink-0" />
          Credits
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}>
          <IconMe className="size-7 shrink-0" />
          Me
        </NavLink>
      </div>
    </nav>
  )
}
