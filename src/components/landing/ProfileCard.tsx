import type { MockProfile } from '../../types/profile'

type ProfileCardProps = {
  profile: MockProfile
  /** Wire to chat route / modal when chat flow exists */
  onChatNow: (profile: MockProfile) => void
}

function tagPillClass(tag: string): string {
  const t = tag.toLowerCase()
  if (t === 'vip')
    return 'bg-amber-400/95 text-amber-950 ring-1 ring-amber-200/80'
  if (t === 'online')
    return 'bg-emerald-500/95 text-white ring-1 ring-emerald-300/50'
  if (t === 'new')
    return 'bg-sky-500/95 text-white ring-1 ring-sky-200/60'
  if (t === 'hot')
    return 'bg-orange-600/95 text-white ring-1 ring-orange-300/40'
  return 'bg-white/92 text-stone-800 ring-1 ring-black/5 shadow-sm'
}

export function ProfileCard({ profile, onChatNow }: ProfileCardProps) {
  const visibleTags = profile.tags.slice(0, 6)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md shadow-slate-900/5 ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/8">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-200">
        <img
          src={profile.imageUrl}
          alt=""
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5 sm:bottom-3 sm:left-3 sm:right-3">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${tagPillClass(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-slate-900">
            {profile.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
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
