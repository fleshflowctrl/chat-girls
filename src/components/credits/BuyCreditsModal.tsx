import { useCredits } from '../../contexts/CreditsContext'
import { CREDIT_PACKS } from '../../data/creditPacks'

type BuyCreditsModalProps = {
  open: boolean
  onClose: () => void
}

export function BuyCreditsModal({ open, onClose }: BuyCreditsModalProps) {
  const { addCredits } = useCredits()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-credits-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400/90">Top up</p>
            <h2 id="buy-credits-title" className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
              Buy message credits
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Demo checkout — adds credits instantly. Later: card / Apple Pay via your payments provider.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ul className="mt-6 space-y-3">
          {CREDIT_PACKS.map((pack) => (
            <li
              key={pack.id}
              className={`rounded-2xl border p-4 ${
                pack.badge
                  ? 'border-sky-700/35 bg-slate-800/90 ring-1 ring-sky-900/20'
                  : 'border-slate-600 bg-slate-800/70'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-bold text-white">{pack.title}</h3>
                    {pack.badge && (
                      <span className="rounded-full bg-sky-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        {pack.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{pack.blurb}</p>
                  <p className="mt-2 font-display text-lg font-bold text-sky-200">{pack.credits} credits</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addCredits(pack.credits)
                    onClose()
                  }}
                  className="shrink-0 rounded-xl bg-sky-600 px-4 py-2.5 font-display text-sm font-semibold text-white shadow-md transition hover:bg-sky-700 active:scale-[0.98]"
                >
                  Add to account
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
