import { useCredits } from '../../contexts/CreditsContext'

/** Small chip — position with `absolute` inside a `relative` parent so it scrolls with the page. */
export function CreditsDock() {
  const { balance, openBuyCredits } = useCredits()

  return (
    <div
      className="pointer-events-none absolute left-3 z-20 sm:left-4"
      style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
      aria-label="Credits wallet"
    >
      <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-stone-600/70 bg-stone-900/90 px-2 py-1 shadow-lg shadow-black/30 backdrop-blur-md ring-1 ring-white/5">
        <span className="select-none pl-0.5 font-display text-[11px] font-semibold tabular-nums text-stone-300 sm:text-xs">
          <span className="text-white">{balance}</span>
          <span className="text-stone-500"> cr</span>
        </span>
        <button
          type="button"
          onClick={openBuyCredits}
          className="rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-white transition hover:brightness-110 active:scale-[0.97] sm:px-2.5 sm:text-[11px]"
        >
          Buy
        </button>
      </div>
    </div>
  )
}
