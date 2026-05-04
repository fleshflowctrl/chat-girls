type DiscreetNoticeBarProps = {
  /** Tighter copy for the discover-style home layout */
  variant?: 'default' | 'compact'
}

/** Short discretion copy shown under the status bar / notch on supported devices. */
export function DiscreetNoticeBar({ variant = 'default' }: DiscreetNoticeBarProps) {
  if (variant === 'compact') {
    return (
      <p className="px-4 pb-2 pt-1 text-center text-sm leading-relaxed text-stone-600" role="note">
        Please be respectful — honour privacy and personal boundaries.
      </p>
    )
  }
  return (
    <p
      className="border-b border-stone-200 bg-warm-canvas px-4 pb-3 pt-[max(1rem,calc(env(safe-area-inset-top)+0.75rem))] text-center text-base leading-relaxed text-stone-800 sm:px-6"
      role="note"
    >
      Treat everyone here with kindness — respect their privacy and boundaries, just as you would want
      others to respect yours.
    </p>
  )
}
