/** Profile shown in the grid — later: map from API / profile model. */
export interface MockProfile {
  id: string
  name: string
  age: number
  /** Display string e.g. "172 cm" */
  heightLabel: string
  imageUrl: string
  /** Pills shown on card (personality + flags) */
  tags: string[]
  moodLabel: string
  isOnline: boolean
  isPremium: boolean
  isVip: boolean
  isHot: boolean
  isNew: boolean
}
