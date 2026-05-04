import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getProfileById } from '../data/mockProfiles'
import type { MockProfile } from '../types/profile'
import {
  firstNameFromFull,
  galleryCellsForProfile,
  interestPillsFromProfile,
  pseudoDistanceKm,
} from '../utils/mockProfileDisplay'

const NAV_OFFSET_CLASS = 'bottom-[calc(4.25rem+max(0.35rem,env(safe-area-inset-bottom)))]'

function defaultAbout(p: MockProfile): string {
  if (p.aboutText?.trim()) return p.aboutText.trim()
  return `Into good coffee, road trips and meaningful conversations. ${p.moodLabel} — not here for games.`
}

function IconBack({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function IconDots({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconVerified({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-amber-950 ring-2 ring-white/40 shadow-sm ${className ?? ''}`}
      title="Verified"
      aria-label="Verified"
    >
      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

function IconChat({ className }: { className?: string }) {
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

function IconHeart({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      {filled ? (
        <path
          fill="currentColor"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      )}
    </svg>
  )
}

export function CompanionProfilePage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const { session, openAuthModal } = useAuth()
  const menuId = useId()
  const [menuOpen, setMenuOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const profile = profileId ? getProfileById(profileId) : undefined

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const goBack = useCallback(() => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }, [navigate])

  const sayHi = useCallback(() => {
    if (!profileId) return
    if (session) {
      navigate(`/chat/${profileId}`)
      return
    }
    openAuthModal({ returnTo: `/chat/${profileId}` })
  }, [navigate, openAuthModal, profileId, session])

  if (!profileId || !profile) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-warm-canvas px-6 text-center text-stone-900">
        <p className="font-display text-lg font-semibold">This profile isn&apos;t available.</p>
        <p className="mt-2 text-base text-stone-600">They may have been updated or removed.</p>
        <Link
          to="/"
          className="mt-8 rounded-full bg-stone-900 px-6 py-3 font-display text-base font-semibold text-white"
        >
          Back to Discover
        </Link>
      </div>
    )
  }

  const fn = firstNameFromFull(profile.name)
  const km = pseudoDistanceKm(profile.id)
  const verified = profile.isVip || profile.isPremium
  const gallery = galleryCellsForProfile(profile)
  const interests = interestPillsFromProfile(profile)

  return (
    <div className="min-h-[100dvh] bg-white text-stone-900">
      {/* Hero */}
      <div className="relative mx-auto max-w-lg">
        <div className="relative aspect-[3/4] max-h-[min(62vh,520px)] w-full overflow-hidden bg-stone-200 sm:max-h-[560px]">
          <img src={profile.imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4">
            <button
              type="button"
              onClick={goBack}
              className="flex size-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50"
              aria-label="Back"
            >
              <IconBack className="size-6" />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex size-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                aria-label="More options"
              >
                <IconDots className="size-5" />
              </button>
              {menuOpen ? (
                <div
                  id={menuId}
                  className="absolute right-0 top-12 z-20 min-w-[10rem] rounded-xl border border-stone-200 bg-white py-1 text-left text-sm shadow-lg"
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-2.5 text-left text-stone-800 hover:bg-stone-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Report or block
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-2.5 text-left text-stone-800 hover:bg-stone-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Share profile
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {profile.isOnline ? (
            <div className="absolute left-3 top-[calc(max(0.75rem,env(safe-area-inset-top))+3.25rem)] z-10 sm:left-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-2 rounded-full bg-emerald-400" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400 ring-2 ring-white/40" />
                </span>
                Online now
              </span>
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5 pt-16 sm:px-5 sm:pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight text-white drop-shadow-md sm:text-3xl">
                {fn}, {profile.age}
              </h1>
              {verified ? <IconVerified /> : null}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-base font-medium text-white/95 drop-shadow">
              <IconPin className="size-4 shrink-0 text-white/90" />
              {km} km away
            </p>
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="grid grid-cols-4 gap-2 bg-white px-3 py-3 sm:px-4">
          {gallery.map((cell, i) => (
            <div
              key={`${cell.url}-${i}`}
              className="relative aspect-square overflow-hidden rounded-xl bg-stone-200 ring-1 ring-stone-900/10"
            >
              <img src={cell.url} alt="" className="absolute inset-0 size-full object-cover" />
              {cell.overlay ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                  <span className="font-display text-lg font-bold text-white">{cell.overlay}</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-lg px-4 pb-40 pt-2 sm:px-5">
        <section className="mt-4">
          <h2 className="font-display text-lg font-bold text-stone-900 sm:text-xl">About me</h2>
          <p className="mt-3 text-base leading-relaxed text-stone-700 sm:text-[1.05rem]">{defaultAbout(profile)}</p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg font-bold text-stone-900 sm:text-xl">Interests</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {interests.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-stone-100 px-4 py-2 text-base font-semibold text-stone-900 ring-1 ring-stone-200/80"
              >
                {tag}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Bottom actions — clears app bottom nav */}
      <div
        className={`fixed left-0 right-0 z-40 border-t border-stone-200 bg-white px-4 py-3 shadow-[0_-6px_24px_rgba(0,0,0,0.06)] sm:px-5 ${NAV_OFFSET_CLASS}`}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={sayHi}
            className="flex min-h-[3.25rem] min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-stone-900 py-3.5 font-display text-base font-semibold text-white shadow-sm transition hover:bg-stone-800"
          >
            <IconChat className="size-5 shrink-0" />
            Say hi
          </button>
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className="flex size-[3.25rem] shrink-0 items-center justify-center rounded-full border-2 border-stone-900 bg-white text-stone-900 transition hover:bg-stone-50"
            aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
            aria-pressed={liked}
          >
            <IconHeart className="size-6" filled={liked} />
          </button>
        </div>
      </div>
    </div>
  )
}
