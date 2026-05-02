import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_PROFILES } from '../../data/mockProfiles'
import type { MockProfile } from '../../types/profile'
import {
  readFunnelPreferences,
  readFunnelSkippedThisSession,
  writeFunnelSkippedThisSession,
} from '../../utils/funnelPreferences'
import { DiscreetNoticeBar } from '../DiscreetNoticeBar'
import { ConversionFunnel } from './ConversionFunnel'
import { ProfileGrid } from './ProfileGrid'

export function LandingPage() {
  const navigate = useNavigate()
  const [showFunnel, setShowFunnel] = useState(() => !readFunnelSkippedThisSession())

  const handleChatNow = useCallback(
    (profile: MockProfile) => {
      navigate(`/chat/${profile.id}`)
    },
    [navigate],
  )

  const completeFunnel = useCallback(() => {
    writeFunnelSkippedThisSession()
    setShowFunnel(false)
  }, [])

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
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <DiscreetNoticeBar />
      <ProfileGrid profiles={orderedProfiles} onChatNow={handleChatNow} />
    </div>
  )
}
