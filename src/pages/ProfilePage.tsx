import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchMemberProfile,
  removeMemberAvatarObject,
  removeMemberGalleryObjectByPublicUrl,
  upsertMemberProfile,
  uploadMemberAvatar,
  uploadMemberGalleryImage,
} from '../lib/api/memberProfile'
import { tryGetSupabaseBrowserClient } from '../lib/supabase/client'
import defaultAvatarUrl from '../assets/default-avatar-profile-icon.webp?url'
import {
  EMPTY_USER_PROFILE,
  profileCompletionPercent,
  readUserProfile,
  writeUserProfile,
  type UserProfileDraft,
} from '../utils/userProfileStorage'
import { firstNameFromFull, galleryCellsForMemberHero, interestPillsFromCsv } from '../utils/mockProfileDisplay'

const DEFAULT_AVATAR = defaultAvatarUrl
const MAX_GALLERY_EXTRAS = 6

const labelClass = 'text-base font-medium text-stone-800'
const fieldInputClass =
  'w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-base text-stone-900 shadow-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/25'

function IconBack({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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

function formatMemberSince(createdAt: string | undefined): string {
  if (!createdAt) return 'Member since —'
  const d = new Date(createdAt)
  if (Number.isNaN(d.getTime())) return 'Member since —'
  return `Member since ${new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(d)}`
}

function ProfilePageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-canvas">
      <p className="text-sm font-medium text-stone-500">Loading…</p>
    </div>
  )
}

function ProfileAuthGate() {
  const { openAuthModal } = useAuth()
  return (
    <div className="min-h-screen bg-warm-canvas text-stone-900">
      <h1 className="sr-only">Profile</h1>
      <div className="mx-auto flex max-w-lg flex-col px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm shadow-stone-900/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-800/90">Your profile</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-stone-900">Sign in required</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Create an account or sign in to view and edit your member profile. Your details stay private and are
            stored with your account.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal({ returnTo: '/profile' })}
            className="mt-8 w-full rounded-xl bg-stone-900 py-3.5 font-display text-sm font-semibold text-white shadow-md transition hover:bg-stone-800 active:scale-[0.99]"
          >
            Sign in or sign up
          </button>
        </div>
      </div>
    </div>
  )
}

function ProfileEditor() {
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const supabase = tryGetSupabaseBrowserClient()
  const useRemote = Boolean(session && supabase && user?.id)

  const [profile, setProfile] = useState<UserProfileDraft>(() => readUserProfile())
  const [remoteLoading, setRemoteLoading] = useState(false)
  const [remoteHydrated, setRemoteHydrated] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarErr, setAvatarErr] = useState<string | null>(null)
  const [avatarKey, setAvatarKey] = useState(0)
  const [galleryBusy, setGalleryBusy] = useState(false)
  const [galleryErr, setGalleryErr] = useState<string | null>(null)
  const profileRef = useRef(profile)
  profileRef.current = profile

  useEffect(() => {
    if (!useRemote || !user?.id || !supabase) {
      setRemoteLoading(false)
      setRemoteHydrated(false)
      return
    }

    let cancelled = false
    setRemoteHydrated(false)
    setRemoteLoading(true)

    void (async () => {
      try {
        const row = await fetchMemberProfile(supabase, user.id)
        if (cancelled) return
        setProfile(row ? { ...EMPTY_USER_PROFILE, ...row } : { ...EMPTY_USER_PROFILE })
        setSaveMessage(null)
      } catch (e) {
        if (!cancelled) {
          setSaveMessage(e instanceof Error ? e.message : 'Could not load profile')
          setProfile(readUserProfile())
        }
      } finally {
        if (!cancelled) {
          setRemoteLoading(false)
          setRemoteHydrated(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [useRemote, user?.id, supabase, session])

  useEffect(() => {
    if (useRemote) return
    writeUserProfile(profile)
  }, [profile, useRemote])

  useEffect(() => {
    if (!useRemote || !user?.id || !supabase || !remoteHydrated || remoteLoading) return

    setSaveStatus('saving')
    const t = window.setTimeout(() => {
      void upsertMemberProfile(supabase, user.id, profile)
        .then(() => {
          setSaveStatus('saved')
          setSaveMessage(null)
          window.setTimeout(() => setSaveStatus('idle'), 2000)
        })
        .catch((e) => {
          setSaveStatus('error')
          setSaveMessage(e instanceof Error ? e.message : 'Could not save profile')
        })
    }, 750)

    return () => window.clearTimeout(t)
  }, [profile, useRemote, user?.id, supabase, remoteHydrated, remoteLoading])

  const pct = useMemo(() => profileCompletionPercent(profile), [profile])

  const setField = useCallback((key: keyof UserProfileDraft) => {
    return (v: string) => setProfile((p) => ({ ...p, [key]: v }))
  }, [])

  const reset = useCallback(() => {
    setProfile((prev) => {
      const empty = { ...EMPTY_USER_PROFILE }
      if (!useRemote) {
        writeUserProfile(empty)
        return empty
      }
      if (supabase && user?.id) {
        void (async () => {
          for (const url of prev.galleryUrls) {
            try {
              await removeMemberGalleryObjectByPublicUrl(supabase, url)
            } catch {
              /* ignore */
            }
          }
          try {
            await removeMemberAvatarObject(supabase, user.id)
          } catch {
            /* file may not exist */
          }
          try {
            await upsertMemberProfile(supabase, user.id, empty)
          } catch {
            /* ignore */
          }
        })()
      }
      return empty
    })
  }, [useRemote, supabase, user?.id])

  const onAvatarFilePicked = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file || !useRemote || !supabase || !user?.id) return
      setAvatarErr(null)
      setAvatarBusy(true)
      try {
        const url = await uploadMemberAvatar(supabase, user.id, file)
        setProfile((prev) => {
          const next = { ...prev, avatarUrl: url }
          void upsertMemberProfile(supabase, user.id, next).catch(() => {})
          return next
        })
        setAvatarKey((k) => k + 1)
      } catch (err) {
        setAvatarErr(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setAvatarBusy(false)
      }
    },
    [useRemote, supabase, user?.id],
  )

  const removeAvatar = useCallback(async () => {
    if (!useRemote || !supabase || !user?.id) return
    setAvatarErr(null)
    setAvatarBusy(true)
    try {
      await removeMemberAvatarObject(supabase, user.id)
      setProfile((prev) => {
        const next = { ...prev, avatarUrl: '' }
        void upsertMemberProfile(supabase, user.id, next).catch(() => {})
        return next
      })
      setAvatarKey((k) => k + 1)
    } catch (err) {
      setAvatarErr(err instanceof Error ? err.message : 'Could not remove photo')
    } finally {
      setAvatarBusy(false)
    }
  }, [useRemote, supabase, user?.id])

  const onGalleryFilePicked = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file || !useRemote || !supabase || !user?.id) return
      setGalleryErr(null)
      if (profileRef.current.galleryUrls.length >= MAX_GALLERY_EXTRAS) {
        setGalleryErr(`You can add up to ${MAX_GALLERY_EXTRAS} extra photos.`)
        return
      }
      setGalleryBusy(true)
      try {
        const url = await uploadMemberGalleryImage(supabase, user.id, file)
        setProfile((prev) => {
          if (prev.galleryUrls.length >= MAX_GALLERY_EXTRAS) return prev
          const next = { ...prev, galleryUrls: [...prev.galleryUrls, url] }
          void upsertMemberProfile(supabase, user.id, next).catch(() => {})
          return next
        })
        setAvatarKey((k) => k + 1)
      } catch (err) {
        setGalleryErr(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setGalleryBusy(false)
      }
    },
    [useRemote, supabase, user?.id],
  )

  const removeGalleryUrl = useCallback(
    async (publicUrl: string) => {
      setGalleryErr(null)
      if (!useRemote) {
        setProfile((prev) => ({
          ...prev,
          galleryUrls: prev.galleryUrls.filter((u) => u !== publicUrl),
        }))
        return
      }
      if (!supabase || !user?.id) return
      setGalleryBusy(true)
      try {
        await removeMemberGalleryObjectByPublicUrl(supabase, publicUrl)
        setProfile((prev) => {
          const next = {
            ...prev,
            galleryUrls: prev.galleryUrls.filter((u) => u !== publicUrl),
          }
          void upsertMemberProfile(supabase, user.id, next).catch(() => {})
          return next
        })
      } catch (err) {
        setGalleryErr(err instanceof Error ? err.message : 'Could not remove photo')
      } finally {
        setGalleryBusy(false)
      }
    },
    [useRemote, supabase, user?.id],
  )

  const goBack = useCallback(() => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }, [navigate])

  const handle = profile.displayName.trim()
    ? profile.displayName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 20) || 'member'
    : 'member'

  const syncHint = useMemo(() => {
    if (useRemote && remoteLoading) return 'Loading your profile from your account…'
    if (useRemote && saveStatus === 'saving') return 'Saving to your account…'
    if (useRemote && saveStatus === 'saved') return 'Saved to your account.'
    if (useRemote && saveStatus === 'error' && saveMessage) return saveMessage
    if (session && !supabase) return 'Add Supabase keys in .env.local to sync this profile to the cloud.'
    return null
  }, [useRemote, remoteLoading, saveStatus, saveMessage, session, supabase])

  const avatarSrc = profile.avatarUrl.trim() ? profile.avatarUrl.trim() : DEFAULT_AVATAR

  const memberSinceLabel = useMemo(() => formatMemberSince(user?.created_at), [user?.created_at])

  const galleryCells = useMemo(
    () => galleryCellsForMemberHero(avatarSrc, profile.galleryUrls),
    [avatarSrc, profile.galleryUrls],
  )
  const firstName = useMemo(
    () => firstNameFromFull(profile.displayName.trim() || 'You'),
    [profile.displayName],
  )
  const ageHero = useMemo(() => {
    const n = Number.parseInt(profile.age.trim(), 10)
    if (!Number.isFinite(n) || n < 18 || n > 120) return null
    return n
  }, [profile.age])
  const interestPills = useMemo(() => interestPillsFromCsv(profile.interests), [profile.interests])

  return (
    <div className="min-h-screen bg-warm-canvas text-stone-900">
      <h1 className="sr-only">Profile</h1>
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6 sm:px-6">
        {syncHint ? (
          <p className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-center text-xs text-stone-600 shadow-sm">
            {syncHint}
          </p>
        ) : null}
        <section
          className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm shadow-amber-900/5"
          aria-labelledby="profile-strength-label"
        >
          <div className="flex items-center justify-between gap-2">
            <p id="profile-strength-label" className="font-display text-sm font-bold text-stone-900">
              Profile strength
            </p>
            <span className="font-display text-sm font-bold tabular-nums text-amber-900">{pct}%</span>
          </div>
          <div
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-amber-200/90"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={`Profile ${pct} percent complete`}
          >
            <div
              className="h-full rounded-full bg-amber-700 transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-stone-700 sm:text-sm">
            The more you fill in, the easier it is for people to trust you and reply. Members with a
            complete profile often see a <span className="font-semibold text-stone-900">higher response rate</span>.
          </p>
        </section>
      </div>

      <div className="bg-white text-stone-900">
        <div className={`relative mx-auto max-w-lg ${remoteLoading ? 'pointer-events-none opacity-60' : ''}`}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            id="pf-avatar-file"
            onChange={onAvatarFilePicked}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            id="pf-gallery-file"
            onChange={onGalleryFilePicked}
          />

          <div className="relative aspect-[3/4] max-h-[min(62vh,520px)] w-full overflow-hidden bg-stone-200 sm:max-h-[560px]">
            <img key={avatarKey} src={avatarSrc} alt="" className="absolute inset-0 size-full object-cover" />
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
            </div>

            {avatarBusy || galleryBusy ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
                <span className="rounded-full bg-black/50 px-4 py-2 font-display text-sm font-semibold text-white">
                  Working…
                </span>
              </div>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5 pt-16 sm:px-5 sm:pb-6">
              <h2 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight text-white drop-shadow-md sm:text-3xl">
                {firstName}
                {ageHero !== null ? `, ${ageHero}` : ''}
              </h2>
              {profile.tagline.trim() ? (
                <p className="mt-2 text-base font-medium text-white/95 drop-shadow">{profile.tagline.trim()}</p>
              ) : null}
              <p className="mt-2 flex items-center gap-1.5 text-base font-medium text-white/95 drop-shadow">
                <IconPin className="size-4 shrink-0 text-white/90" />
                {profile.region.trim() ? profile.region.trim() : 'City or region — add it below'}
              </p>
            </div>

            {useRemote ? (
              <div className="absolute bottom-20 right-3 z-10 flex flex-col items-end gap-2 sm:bottom-24 sm:right-4">
                <button
                  type="button"
                  disabled={avatarBusy || galleryBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-white/95 px-4 py-2.5 font-display text-sm font-semibold text-stone-900 shadow-md transition hover:bg-white disabled:opacity-50"
                >
                  Main photo
                </button>
                {profile.avatarUrl.trim() ? (
                  <button
                    type="button"
                    disabled={avatarBusy || galleryBusy}
                    onClick={() => void removeAvatar()}
                    className="rounded-full border border-white/50 bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/55 disabled:opacity-50"
                  >
                    Remove main
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-4 gap-2 bg-white px-3 py-3 sm:px-4">
            {galleryCells.map((cell, i) => (
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

          {useRemote ? (
            <div className="border-b border-stone-100 px-3 pb-3 pt-1 sm:px-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={galleryBusy || avatarBusy || profile.galleryUrls.length >= MAX_GALLERY_EXTRAS}
                  onClick={() => galleryInputRef.current?.click()}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 disabled:opacity-50"
                >
                  Add gallery photo
                  {profile.galleryUrls.length > 0 ? ` (${profile.galleryUrls.length}/${MAX_GALLERY_EXTRAS})` : ''}
                </button>
              </div>
              {profile.galleryUrls.length > 0 ? (
                <ul className="mt-2 space-y-1.5 text-sm text-stone-600">
                  {profile.galleryUrls.map((url) => (
                    <li key={url} className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 px-2 py-1.5">
                      <span className="min-w-0 truncate text-xs">Extra photo</span>
                      <button
                        type="button"
                        disabled={galleryBusy}
                        onClick={() => void removeGalleryUrl(url)}
                        className="shrink-0 rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p className="border-b border-stone-100 px-4 py-3 text-center text-xs text-stone-500">
              Link Supabase in .env.local to upload a main photo and gallery images.
            </p>
          )}
          {avatarErr ? <p className="px-4 py-2 text-center text-xs text-red-700">{avatarErr}</p> : null}
          {galleryErr ? <p className="px-4 py-2 text-center text-xs text-red-700">{galleryErr}</p> : null}

          <div className="mx-auto max-w-lg px-4 pb-10 pt-2 sm:px-5">
            <p className="text-center text-xs text-stone-500">{memberSinceLabel}</p>
            <p className="mt-1 text-center text-xs text-stone-400">@{handle}</p>

            <section className="mt-6">
              <h3 className="font-display text-lg font-bold text-stone-900 sm:text-xl">About me</h3>
              {profile.bio.trim() ? (
                <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-stone-700 sm:text-[1.05rem]">
                  {profile.bio.trim()}
                </p>
              ) : (
                <p className="mt-3 text-base leading-relaxed text-stone-500 sm:text-[1.05rem]">
                  Add a short “About me” below — people like to know who they&apos;re talking to.
                </p>
              )}
              <label htmlFor="pf-bio" className="mt-4 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Edit about me
              </label>
              <textarea
                id="pf-bio"
                rows={5}
                value={profile.bio}
                onChange={(e) => setField('bio')(e.target.value)}
                placeholder="A few sentences about you"
                className={`${fieldInputClass} mt-1.5 min-h-[6rem] resize-y`}
              />
            </section>

            <section className="mt-8">
              <h3 className="font-display text-lg font-bold text-stone-900 sm:text-xl">Interests</h3>
              {interestPills.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {interestPills.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-stone-100 px-4 py-2 text-base font-semibold text-stone-900 ring-1 ring-stone-200/80"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-stone-500">Add interests below (comma-separated).</p>
              )}
              <label htmlFor="pf-interests" className="mt-4 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Edit interests
              </label>
              <input
                id="pf-interests"
                type="text"
                value={profile.interests}
                onChange={(e) => setField('interests')(e.target.value)}
                placeholder="Music, Travel, Food"
                className={`${fieldInputClass} mt-1.5`}
              />
            </section>

            <section className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-warm-canvas/40 p-4 sm:p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-stone-500">Name &amp; details</h3>
              <div className="space-y-1.5">
                <label htmlFor="pf-display-name" className={labelClass}>
                  Display name
                </label>
                <input
                  id="pf-display-name"
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setField('displayName')(e.target.value)}
                  placeholder="How you appear in chats"
                  className={fieldInputClass}
                  autoComplete="nickname"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="pf-tagline" className={labelClass}>
                  Tagline
                </label>
                <input
                  id="pf-tagline"
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => setField('tagline')(e.target.value)}
                  placeholder="One short line under your name"
                  className={fieldInputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="pf-age" className={labelClass}>
                  Age
                </label>
                <input
                  id="pf-age"
                  inputMode="numeric"
                  type="text"
                  value={profile.age}
                  onChange={(e) => setField('age')(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="e.g. 29"
                  className={fieldInputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="pf-region" className={labelClass}>
                  City or region
                </label>
                <input
                  id="pf-region"
                  type="text"
                  value={profile.region}
                  onChange={(e) => setField('region')(e.target.value)}
                  placeholder="Rough area is fine"
                  className={fieldInputClass}
                />
              </div>
            </section>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Clear all fields
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { session, authReady } = useAuth()
  if (!authReady) return <ProfilePageLoading />
  if (!session) return <ProfileAuthGate />
  return <ProfileEditor />
}
