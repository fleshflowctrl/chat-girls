import { useEffect } from 'react'
import { mergeRemoteCompanionCatalogWithDemoMales, setRuntimeCompanionProfiles } from '../data/mockProfiles'
import { fetchCompanionProfiles } from '../lib/api/companionProfiles'

/** Loads companion rows from Supabase once; keeps chat deep-links in sync with the grid. */
export function CompanionCatalogBootstrap() {
  useEffect(() => {
    let cancelled = false
    fetchCompanionProfiles().then((rows) => {
      if (cancelled || rows.length === 0) return
      setRuntimeCompanionProfiles(mergeRemoteCompanionCatalogWithDemoMales(rows))
    })
    return () => {
      cancelled = true
    }
  }, [])
  return null
}
