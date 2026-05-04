import type { MockProfile } from '../../types/profile'
import { ProfileCard } from './ProfileCard'

type ProfileGridProps = {
  profiles: MockProfile[]
  onSelectProfile: (profile: MockProfile) => void
}

export function ProfileGrid({ profiles, onSelectProfile }: ProfileGridProps) {
  return (
    <section id="browse" aria-label="Profiles">
      {profiles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 py-16 text-center text-base text-stone-600">
          No profiles to show yet.
        </p>
      ) : (
        <ul className="mx-auto grid max-w-lg grid-cols-2 gap-3 sm:gap-4">
          {profiles.map((profile) => (
            <li key={profile.id} className="min-w-0">
              <ProfileCard profile={profile} onSelectProfile={onSelectProfile} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
