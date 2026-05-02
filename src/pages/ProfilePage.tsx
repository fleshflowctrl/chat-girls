import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  PROFILE_AGES,
  PROFILE_BIOS,
  PROFILE_DISPLAY_NAMES,
  PROFILE_INTEREST_TAGS,
  PROFILE_REGIONS,
  PROFILE_TAGLINES,
} from '../data/profilePickLists'
import {
  EMPTY_USER_PROFILE,
  profileCompletionPercent,
  readUserProfile,
  writeUserProfile,
  type UserProfileDraft,
} from '../utils/userProfileStorage'

const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/32.jpg'

function parseInterests(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

function toggleInterest(current: string, tag: string): string {
  const set = new Set(parseInterests(current))
  if (set.has(tag)) set.delete(tag)
  else set.add(tag)
  return [...set].join(', ')
}

function ChipButton({
  selected,
  children,
  onClick,
}: {
  selected: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-left text-sm font-medium transition active:scale-[0.98] ${
        selected
          ? 'border-sky-600 bg-sky-50 text-sky-950 ring-1 ring-sky-200/80'
          : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

function PickSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div>
        <h4 className="font-display text-sm font-bold text-slate-800">{title}</h4>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
      {children}
    </div>
  )
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25'

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileDraft>(() => readUserProfile())

  useEffect(() => {
    writeUserProfile(profile)
  }, [profile])

  const pct = useMemo(() => profileCompletionPercent(profile), [profile])

  const setField = useCallback((key: keyof UserProfileDraft) => {
    return (v: string) => setProfile((p) => ({ ...p, [key]: v }))
  }, [])

  const reset = useCallback(() => {
    setProfile({ ...EMPTY_USER_PROFILE })
    writeUserProfile({ ...EMPTY_USER_PROFILE })
  }, [])

  const displayName = profile.displayName.trim() || 'You'
  const handle = profile.displayName.trim()
    ? profile.displayName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 20) || 'member'
    : 'member'

  const interestSet = useMemo(() => new Set(parseInterests(profile.interests)), [profile.interests])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <h1 className="sr-only">Profile</h1>
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6 sm:px-6">
        <section
          className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 shadow-sm shadow-sky-900/5"
          aria-labelledby="profile-strength-label"
        >
          <div className="flex items-center justify-between gap-2">
            <p id="profile-strength-label" className="font-display text-sm font-bold text-slate-900">
              Profile strength
            </p>
            <span className="font-display text-sm font-bold tabular-nums text-sky-800">{pct}%</span>
          </div>
          <div
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-sky-200/90"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={`Profile ${pct} percent complete`}
          >
            <div
              className="h-full rounded-full bg-sky-600 transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-700 sm:text-sm">
            The more you fill in, the easier it is for people to trust you and reply. Members with a
            complete profile often see a <span className="font-semibold text-slate-900">higher response rate</span>.
          </p>
        </section>

        <section className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <img
            src={DEFAULT_AVATAR}
            alt=""
            className="size-24 rounded-full object-cover ring-4 ring-slate-100"
          />
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">{displayName}</h2>
          {profile.tagline.trim() ? (
            <p className="mt-1 text-sm font-medium text-sky-800">{profile.tagline.trim()}</p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Pick a tagline below</p>
          )}
          <p className="mt-1 text-xs text-slate-500">@{handle}</p>
          <p className="mt-2 text-xs text-slate-500">Member since May 2026</p>
        </section>

        <section className="space-y-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">
            Your details
          </h3>
          <p className="-mt-5 text-xs text-slate-600">
            Tap chips to fill your profile — almost no typing needed. Use “Type your own” only if you want
            something custom.
          </p>

          <PickSection title="Display name" hint="How you appear in chats.">
            <div className="flex flex-wrap gap-2">
              {PROFILE_DISPLAY_NAMES.map((n) => (
                <ChipButton
                  key={n}
                  selected={profile.displayName.trim() === n}
                  onClick={() => setField('displayName')(profile.displayName.trim() === n ? '' : n)}
                >
                  {n}
                </ChipButton>
              ))}
            </div>
            <details className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2">
              <summary className="cursor-pointer text-sm font-semibold text-sky-800">Type your own name</summary>
              <label htmlFor="pf-name-custom" className="sr-only">
                Custom display name
              </label>
              <input
                id="pf-name-custom"
                type="text"
                value={profile.displayName}
                onChange={(e) => setField('displayName')(e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
            </details>
          </PickSection>

          <PickSection title="Tagline" hint="One line that sums you up.">
            <div className="flex flex-wrap gap-2">
              {PROFILE_TAGLINES.map((t) => (
                <ChipButton
                  key={t}
                  selected={profile.tagline.trim() === t}
                  onClick={() => setField('tagline')(profile.tagline.trim() === t ? '' : t)}
                >
                  {t}
                </ChipButton>
              ))}
            </div>
            <details className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2">
              <summary className="cursor-pointer text-sm font-semibold text-sky-800">Type your own tagline</summary>
              <label htmlFor="pf-tag-custom" className="sr-only">
                Custom tagline
              </label>
              <input
                id="pf-tag-custom"
                type="text"
                value={profile.tagline}
                onChange={(e) => setField('tagline')(e.target.value)}
                placeholder="Short line about you"
                className={inputClass}
              />
            </details>
          </PickSection>

          <PickSection title="About you" hint="Pick a ready-made intro — tap again to clear.">
            <div className="space-y-2">
              {PROFILE_BIOS.map(({ id, text }) => {
                const selected = profile.bio.trim() === text.trim()
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setField('bio')(selected ? '' : text)}
                    className={`w-full rounded-xl border px-3 py-3 text-left text-sm leading-snug transition active:scale-[0.99] ${
                      selected
                        ? 'border-sky-600 bg-sky-50 text-slate-900 ring-1 ring-sky-200/80'
                        : 'border-slate-200 bg-slate-50/90 text-slate-700 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    {text}
                  </button>
                )
              })}
            </div>
            <details className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2">
              <summary className="cursor-pointer text-sm font-semibold text-sky-800">Write your own bio</summary>
              <label htmlFor="pf-bio-custom" className="sr-only">
                Custom bio
              </label>
              <textarea
                id="pf-bio-custom"
                rows={4}
                value={profile.bio}
                onChange={(e) => setField('bio')(e.target.value)}
                placeholder="Longer bio in your own words"
                className={`${inputClass} min-h-[6rem] resize-y`}
              />
            </details>
          </PickSection>

          <PickSection title="Age" hint="Tap your age.">
            <div className="flex flex-wrap gap-2">
              {PROFILE_AGES.map((a) => (
                <ChipButton
                  key={a}
                  selected={profile.age.trim() === a}
                  onClick={() => setField('age')(profile.age.trim() === a ? '' : a)}
                >
                  {a}
                </ChipButton>
              ))}
            </div>
            <details className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2">
              <summary className="cursor-pointer text-sm font-semibold text-sky-800">Type a different age</summary>
              <label htmlFor="pf-age-custom" className="sr-only">
                Custom age
              </label>
              <input
                id="pf-age-custom"
                inputMode="numeric"
                value={profile.age}
                onChange={(e) => setField('age')(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="e.g. 29"
                className={inputClass}
              />
            </details>
          </PickSection>

          <PickSection title="City or region" hint="Where you’re based — rough is fine.">
            <div className="flex flex-wrap gap-2">
              {PROFILE_REGIONS.map((r) => (
                <ChipButton
                  key={r}
                  selected={profile.region.trim() === r}
                  onClick={() => setField('region')(profile.region.trim() === r ? '' : r)}
                >
                  {r}
                </ChipButton>
              ))}
            </div>
            <details className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2">
              <summary className="cursor-pointer text-sm font-semibold text-sky-800">Type your own city</summary>
              <label htmlFor="pf-region-custom" className="sr-only">
                Custom region
              </label>
              <input
                id="pf-region-custom"
                type="text"
                value={profile.region}
                onChange={(e) => setField('region')(e.target.value)}
                placeholder="City or area"
                className={inputClass}
              />
            </details>
          </PickSection>

          <PickSection title="Interests" hint="Tap as many as you like — tap again to remove.">
            <div className="flex flex-wrap gap-2">
              {PROFILE_INTEREST_TAGS.map((tag) => (
                <ChipButton
                  key={tag}
                  selected={interestSet.has(tag)}
                  onClick={() => setProfile((p) => ({ ...p, interests: toggleInterest(p.interests, tag) }))}
                >
                  {tag}
                </ChipButton>
              ))}
            </div>
            {parseInterests(profile.interests).length > 0 ? (
              <p className="text-xs text-slate-600">
                Selected: {parseInterests(profile.interests).join(' · ')}
              </p>
            ) : null}
          </PickSection>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear all fields
          </button>
        </div>
      </div>
    </div>
  )
}
