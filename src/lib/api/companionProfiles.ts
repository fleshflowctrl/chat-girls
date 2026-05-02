import type { MockProfile } from '../../types/profile'
import { tryGetSupabaseBrowserClient } from '../supabase/client'

type CompanionRow = {
  id: string
  name: string
  age: number
  height_label: string
  image_url: string
  tags: string[] | null
  mood_label: string
  is_online: boolean
  is_premium: boolean
  is_vip: boolean
  is_hot: boolean
  is_new: boolean
}

function rowToProfile(r: CompanionRow): MockProfile {
  return {
    id: r.id,
    name: r.name,
    age: r.age,
    heightLabel: r.height_label,
    imageUrl: r.image_url,
    tags: Array.isArray(r.tags) ? r.tags : [],
    moodLabel: r.mood_label,
    isOnline: r.is_online,
    isPremium: r.is_premium,
    isVip: r.is_vip,
    isHot: r.is_hot,
    isNew: r.is_new,
  }
}

/** Loads catalog from Supabase `companion_profiles`. Returns [] if not configured, on error, or empty table. */
export async function fetchCompanionProfiles(): Promise<MockProfile[]> {
  const supabase = tryGetSupabaseBrowserClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('companion_profiles')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.warn('[companionProfiles]', error.message)
    return []
  }
  if (!data?.length) return []

  return (data as CompanionRow[]).map(rowToProfile)
}
