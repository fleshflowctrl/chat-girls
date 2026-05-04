/** Shared helpers for Discover cards and companion profile screens. */

export function firstNameFromFull(full: string): string {
  return full.split(/\s+/)[0] ?? full
}

/** Stable pseudo-distance so cards feel local without storing coords */
export function pseudoDistanceKm(profileId: string): number {
  let h = 0
  for (let i = 0; i < profileId.length; i++) {
    h = (h + profileId.charCodeAt(i) * (i + 3)) % 1009
  }
  return 2 + (h % 10)
}

const FLAG_TAGS = new Set(['vip', 'online', 'new', 'hot'])

/** Personality / topic tags for “Interests” — strips catalog flags. */
/** Comma-separated interests (member profile editor). */
export function interestPillsFromCsv(csv: string): string[] {
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12)
}

export function interestPillsFromProfile(p: { tags: string[] }): string[] {
  const pills = p.tags.filter((t) => !FLAG_TAGS.has(t.toLowerCase()))
  if (pills.length > 0) return pills.slice(0, 8)
  return ['Conversation', 'Connection', 'Coffee']
}

/** Synthetic gallery when `galleryImageUrls` is not set (deterministic randomuser portraits). */
export function buildSyntheticGalleryUrls(p: { id: string; imageUrl: string }): string[] {
  const isWomen = p.imageUrl.includes('/women/')
  const folder = isWomen ? 'women' : 'men'
  let h = 0
  for (let i = 0; i < p.id.length; i++) {
    h = (h + p.id.charCodeAt(i) * (i + 3)) % 99
  }
  const out: string[] = [p.imageUrl]
  for (let k = 1; k < 7; k++) {
    const idx = ((h + k * 11) % 98) + 1
    out.push(`https://randomuser.me/api/portraits/${folder}/${idx}.jpg`)
  }
  return out
}

export type GalleryCell = { url: string; overlay?: string }

/** Four thumbnail cells; last may show a “+N” overlay when more photos exist. */
/** Hero + optional extra URLs for the signed-in member’s profile preview (same strip as companions). */
export function galleryCellsForMemberHero(heroUrl: string, extraUrls: string[]): GalleryCell[] {
  const extras = extraUrls.filter((u) => u.trim() && u.trim() !== heroUrl.trim())
  const urls = [heroUrl, ...extras].filter(Boolean)
  const cells: GalleryCell[] = urls.slice(0, 3).map((url) => ({ url }))
  const fourthUrl = urls[3] ?? heroUrl
  const more = Math.max(0, urls.length - 4)
  cells.push(more > 0 ? { url: fourthUrl, overlay: `+${more}` } : { url: fourthUrl })
  return cells
}

export function galleryCellsForProfile(p: {
  id: string
  imageUrl: string
  galleryImageUrls?: string[]
}): GalleryCell[] {
  const urls =
    p.galleryImageUrls && p.galleryImageUrls.length > 0 ? p.galleryImageUrls : buildSyntheticGalleryUrls(p)
  const cells: GalleryCell[] = urls.slice(0, 3).map((url) => ({ url }))
  const fourthUrl = urls[3] ?? p.imageUrl
  const more = Math.max(0, urls.length - 4)
  cells.push(more > 0 ? { url: fourthUrl, overlay: `+${more}` } : { url: fourthUrl })
  return cells
}
