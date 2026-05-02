import { useCredits } from '../../contexts/CreditsContext'

/** Small chip — `absolute` inside a `relative` parent so it scrolls with the page. */
export function CreditsDock() {
  const { balance, openBuyCredits } = useCredits()

  return (
    <div
      className="pointer-events-none absolute left-3 z-20 sm:left-4"
      style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
      aria-label="Credits wallet"
    >
      <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-slate-600/80 bg-slate-900/90 px-2 py-1 shadow-lg shadow-slate-950/40 backdrop-blur-md ring-1 ring-white/5">
        <span className="select-none pl-0.5 font-display text-[11px] font-semibold tabular-nums text-slate-300 sm:text-xs">
          <span className="text-white">{balance}</span>
          <span className="text-slate-500"> cr</span>
        </span>
        <button
          type="button"
          onClick={openBuyCredits}
          className="rounded-full bg-sky-700 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-sky-600 active:scale-[0.97] sm:px-2.5 sm:text-[11px]"
        >
          Buy
        </button>
      </div>
    </div>
  )
}
