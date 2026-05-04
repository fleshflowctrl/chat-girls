import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getActiveProfiles,
  getCatalogVersion,
  subscribeCompanionCatalog,
} from '../../data/mockProfiles'
import type { MockProfile } from '../../types/profile'
import {
  readFunnelPreferences,
  readFunnelSkippedThisSession,
  writeFunnelSkippedThisSession,
} from '../../utils/funnelPreferences'
import { DiscreetNoticeBar } from '../DiscreetNoticeBar'
import { ConversionFunnel } from './ConversionFunnel'
import { ProfileGrid } from './ProfileGrid'

function DiscoverHeader() {
  return (
    <header className="flex items-center px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1">
      <span className="font-[family-name:var(--font-brand-serif)] text-[1.75rem] font-semibold leading-none tracking-tight text-stone-900 sm:text-[1.95rem]">
        whisper
      </span>
    </header>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const [showFunnel, setShowFunnel] = useState(() => !readFunnelSkippedThisSession())
  const catalogRevision = useSyncExternalStore(
    subscribeCompanionCatalog,
    getCatalogVersion,
    () => 0,
  )

  const handleSelectProfile = useCallback(
    (profile: MockProfile) => {
      navigate(`/profiles/${profile.id}`)
    },
    [navigate],
  )

  const completeFunnel = useCallback(() => {
    writeFunnelSkippedThisSession()
    setShowFunnel(false)
  }, [])

  const orderedProfiles = useMemo(() => {
    void catalogRevision
    const base = getActiveProfiles()
    if (showFunnel) return base

    const prefs = readFunnelPreferences()
    if (!prefs) return base

    const hasVibes = prefs.vibes.length > 0
    const ageAny = prefs.ageMin === 18 && prefs.ageMax === 99
    if (!hasVibes && ageAny) return base

    const score = (p: MockProfile) => {
      let s = 0
      if (hasVibes) {
        for (const v of prefs.vibes) {
          const vl = v.toLowerCase()
          if (p.tags.some((t) => t.toLowerCase() === vl)) s += 3
        }
      }
      if (p.age >= prefs.ageMin && p.age <= prefs.ageMax) s += 2
      return s
    }

    return [...base].sort((a, b) => score(b) - score(a))
  }, [showFunnel, catalogRevision])

  if (showFunnel) {
    return <ConversionFunnel onComplete={completeFunnel} />
  }

  return (
    <div className="min-h-screen bg-warm-canvas text-stone-900 antialiased">
      <DiscoverHeader />
      <DiscreetNoticeBar variant="compact" />

      <main className="mx-auto max-w-lg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <h1 className="font-[family-name:var(--font-brand-serif)] text-[1.5rem] font-semibold leading-snug tracking-tight text-stone-900 sm:text-[1.7rem]">
          People you might enjoy meeting
        </h1>
        <p className="mt-3 text-base leading-relaxed text-stone-700 sm:text-[1.05rem]">
          Thoughtful introductions. Private, respectful chat at your own pace.
        </p>

        <div className="mt-6">
          <ProfileGrid profiles={orderedProfiles} onSelectProfile={handleSelectProfile} />
        </div>
      </main>
    </div>
  )
}
