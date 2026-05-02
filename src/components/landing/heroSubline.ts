/** Builds hero subcopy from funnel vibe picks — keep in sync with `ConversionFunnel` VIBE_OPTIONS. */
export function buildHeroSublineFromVibes(vibes: string[]): string {
  const tail = 'Chat with girls you matched with and are online now!'
  if (vibes.length === 0) {
    return tail
  }

  let lead: string
  if (vibes.length === 1) {
    lead = vibes[0]!
  } else if (vibes.length === 2) {
    lead = `${vibes[0]} & ${vibes[1]}`
  } else {
    lead = `${vibes.slice(0, -1).join(', ')} & ${vibes[vibes.length - 1]}`
  }

  return `${lead} — ${tail}`
}
