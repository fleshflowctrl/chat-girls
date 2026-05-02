import type { MockProfile } from '../../types/profile'

type ProfileCardProps = {
  profile: MockProfile
  /** Wire to chat route / modal when chat flow exists */
  onChatNow: (profile: MockProfile) => void
}

function tagPillClass(tag: string): string {
  const t = tag.toLowerCase()
  if (t === 'new')
    return 'bg-sky-500/95 text-white ring-1 ring-sky-200/60'
  return 'bg-white/92 text-stone-800 ring-1 ring-black/5 shadow-sm'
}

const TAGS_HIDDEN_ON_CARD = new Set(['vip', 'online', 'hot', 'new'])

export function ProfileCard({ profile, onChatNow }: ProfileCardProps) {
  const showNew = profile.isNew || profile.tags.some((t) => t.toLowerCase() === 'new')
  const visibleTags = profile.tags
    .filter((tag) => !TAGS_HIDDEN_ON_CARD.has(tag.toLowerCase()))
    .slice(0, 6)

  return (
    <article className="group flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl bg-white shadow-md shadow-slate-900/5 ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/8">
      <div className="relative aspect-[4/5] bg-slate-200">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={profile.imageUrl}
            alt=""
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-transparent to-black/20" />
        {profile.isOnline ? (
          <span
            className="absolute left-2 top-2 z-[5] flex size-3.5 items-center justify-center"
            title="Online now"
            aria-label="Online now"
          >
            <span className="absolute size-3 animate-ping rounded-full bg-emerald-500/50 motion-reduce:animate-none" />
            <span className="relative size-2.5 rounded-full bg-emerald-500" />
          </span>
        ) : null}
        {showNew ? (
          <span
            className={`profile-new-pill-pulse absolute right-2 top-2 z-[5] rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${tagPillClass('new')}`}
          >
            New
          </span>
        ) : null}

        <div
          className="absolute bottom-2 left-1 right-1 z-[5] flex min-w-0 flex-nowrap items-center justify-center gap-2 overflow-x-auto overflow-y-visible overscroll-x-contain px-1 pb-0.5 pt-1 touch-pan-x sm:bottom-3 sm:left-2 sm:right-2 sm:gap-2.5 sm:px-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:px-2 sm:text-xs ${tagPillClass(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="min-h-0 flex-1">
          <h3 className="truncate font-display text-lg font-bold tracking-tight text-slate-900">
            {profile.name}
          </h3>
          <p className="mt-0.5 h-[2.625rem] overflow-hidden text-xs leading-snug text-slate-600 line-clamp-2 sm:h-[2.875rem] sm:text-sm">
            <span>{profile.age} yrs</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span>{profile.heightLabel}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="text-sky-800">{profile.moodLabel}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChatNow(profile)}
          className="mt-auto w-full rounded-xl bg-slate-800 py-2.5 font-display text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition hover:bg-slate-900 active:scale-[0.99]"
        >
          Chat now
        </button>
      </div>
    </article>
  )
}
