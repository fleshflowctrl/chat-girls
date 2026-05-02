import type { MockProfile } from '../../types/profile'
import { ProfileCard } from './ProfileCard'

type ProfileGridProps = {
  profiles: MockProfile[]
  onChatNow: (profile: MockProfile) => void
}

export function ProfileGrid({ profiles, onChatNow }: ProfileGridProps) {
  return (
    <section
      id="browse"
      className="bg-stone-50 px-4 py-10 sm:py-12"
      aria-label="Profiles"
    >
      <div className="mx-auto max-w-7xl">
        {profiles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white py-16 text-center text-stone-500">
            No profiles to show yet.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {profiles.map((profile) => (
              <li key={profile.id}>
                <ProfileCard profile={profile} onChatNow={onChatNow} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
