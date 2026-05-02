/** Demo credit packs — replace with Stripe Price IDs / server catalog when payments go live. */
export type CreditPack = {
  id: string
  credits: number
  title: string
  blurb: string
  badge?: string
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'pack_50',
    credits: 50,
    title: 'Starter',
    blurb: 'Enough for a flirty back-and-forth.',
  },
  {
    id: 'pack_200',
    credits: 200,
    title: 'Popular',
    blurb: 'What most guys grab first.',
    badge: 'Best value',
  },
  {
    id: 'pack_600',
    credits: 600,
    title: 'Night-owl',
    blurb: 'Long threads, no counting.',
  },
]
