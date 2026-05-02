import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_PROFILES } from '../../data/mockProfiles'
import type { MockProfile } from '../../types/profile'
import { readFunnelPreferences } from '../../utils/funnelPreferences'
import { Benefits } from './Benefits'
import { ConversionFunnel } from './ConversionFunnel'
import { Footer } from './Footer'
import { Hero } from './Hero'
import { PricingPreview } from './PricingPreview'
import { ProfileGrid } from './ProfileGrid'

/** Session-only: funnel runs again each new browser session (new tab/window session). */
const FUNNEL_SKIP_SESSION_KEY = 'velvet_funnel_skipped_this_session'

function readFunnelSkippedThisSession(): boolean {
  try {
    return sessionStorage.getItem(FUNNEL_SKIP_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function LandingPage() {
  const navigate = useNavigate()
  const [showFunnel, setShowFunnel] = useState(() => !readFunnelSkippedThisSession())

  const scrollToBrowse = useCallback(() => {
    document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleChatNow = useCallback(
    (profile: MockProfile) => {
      navigate(`/chat/${profile.id}`)
    },
    [navigate],
  )

  const completeFunnel = useCallback(() => {
    try {
      sessionStorage.setItem(FUNNEL_SKIP_SESSION_KEY, '1')
    } catch {
      /* private / blocked storage */
    }
    setShowFunnel(false)
    window.setTimeout(() => {
      document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }, [])

  const funnelVibes = useMemo(() => {
    if (showFunnel) return [] as string[]
    return readFunnelPreferences()?.vibes ?? []
  }, [showFunnel])

  const orderedProfiles = useMemo(() => {
    if (showFunnel) return MOCK_PROFILES

    const prefs = readFunnelPreferences()
    if (!prefs) return MOCK_PROFILES

    const hasVibes = prefs.vibes.length > 0
    const ageAny = prefs.ageMin === 18 && prefs.ageMax === 99
    if (!hasVibes && ageAny) return MOCK_PROFILES

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

    return [...MOCK_PROFILES].sort((a, b) => score(b) - score(a))
  }, [showFunnel])

  if (showFunnel) {
    return <ConversionFunnel onComplete={completeFunnel} />
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
      <Hero
        onStartChat={scrollToBrowse}
        onBrowseGirls={scrollToBrowse}
        funnelVibes={funnelVibes}
      />
      <ProfileGrid profiles={orderedProfiles} onChatNow={handleChatNow} />
      <Benefits />
      <PricingPreview />
      <Footer />
    </div>
  )
}
