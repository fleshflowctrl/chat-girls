import { NavLink } from 'react-router-dom'
import { useCredits } from '../../contexts/CreditsContext'

const navBase =
  'flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition sm:text-xs'
const navIdle = 'text-slate-500'
const navActive = 'text-sky-600'

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 0v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  )
}

function IconChats({ className }: { className?: string }) {
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

function IconProfile({ className }: { className?: string }) {
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
  const { balance } = useCredits()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-white/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}
        >
          <IconHome className="size-6 shrink-0 sm:size-6" />
          Home
        </NavLink>
        <NavLink
          to="/chats"
          className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}
        >
          <IconChats className="size-6 shrink-0 sm:size-6" />
          Chats
        </NavLink>
        <NavLink
          to="/credits"
          className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}
        >
          <span className="relative inline-flex">
            <IconCredits className="size-6 shrink-0 sm:size-6" />
            <span className="absolute -right-1 -top-0.5 min-w-[1rem] rounded-full bg-slate-900 px-0.5 text-center font-display text-[9px] font-bold leading-4 text-white ring-2 ring-white">
              {balance > 999 ? '999+' : balance}
            </span>
          </span>
          Credits
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}
        >
          <IconProfile className="size-6 shrink-0 sm:size-6" />
          Profile
        </NavLink>
      </div>
    </nav>
  )
}
