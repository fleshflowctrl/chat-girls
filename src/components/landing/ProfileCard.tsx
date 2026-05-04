import type { MockProfile } from '../../types/profile'
import { firstNameFromFull, pseudoDistanceKm } from '../../utils/mockProfileDisplay'

type ProfileCardProps = {
  profile: MockProfile
  onSelectProfile: (profile: MockProfile) => void
}

export function ProfileCard({ profile, onSelectProfile }: ProfileCardProps) {
  const fn = firstNameFromFull(profile.name)
  const km = pseudoDistanceKm(profile.id)

  return (
    <button
      type="button"
      onClick={() => onSelectProfile(profile)}
      className="group relative block w-full overflow-hidden rounded-[1.75rem] bg-stone-200 text-left shadow-sm ring-1 ring-stone-900/10 transition sm:rounded-[1.85rem]"
    >
      <div className="relative aspect-[3/4] w-full">
        <img
          src={profile.imageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-[1] px-3.5 pb-3.5 pt-12 sm:px-4 sm:pb-4">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-display text-xl font-bold tracking-tight text-white drop-shadow-md sm:text-2xl">
              {fn}, {profile.age}
            </p>
            {profile.isOnline ? (
              <span className="relative flex size-2 shrink-0" title="Online" aria-label="Online">
                <span className="absolute inline-flex size-2 rounded-full bg-emerald-400 opacity-90" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400 ring-2 ring-white/30" />
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-base font-medium text-white/95 drop-shadow">About {km} km away</p>
        </div>
      </div>
    </button>
  )
}
