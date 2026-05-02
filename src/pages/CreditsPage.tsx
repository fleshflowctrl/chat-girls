import { useCredits } from '../contexts/CreditsContext'
import { CREDITS_PER_MESSAGE } from '../constants/credits'
import { CREDIT_PACKS } from '../data/creditPacks'

export function CreditsPage() {
  const { balance, openBuyCredits, addCredits } = useCredits()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Credits
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Message credits power your chats. Demo adds are instant — later you will pay with a card or wallet.
        </p>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-700/90">Balance</p>
          <p className="mt-2 font-display text-4xl font-bold tabular-nums text-slate-900">{balance}</p>
          <p className="mt-1 text-sm text-slate-600">
            credits available · {CREDITS_PER_MESSAGE} per message sent
          </p>
          <button
            type="button"
            onClick={openBuyCredits}
            className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 font-display text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Open full purchase sheet
          </button>
        </section>

        <section>
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">
            Add credits
          </h2>
          <ul className="mt-3 space-y-3">
            {CREDIT_PACKS.map((pack) => (
              <li
                key={pack.id}
                className={`rounded-2xl border p-4 ${
                  pack.badge
                    ? 'border-sky-200 bg-sky-50/80 ring-1 ring-sky-100'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-bold text-slate-900">{pack.title}</h3>
                      {pack.badge && (
                        <span className="rounded-full bg-sky-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          {pack.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{pack.blurb}</p>
                    <p className="mt-2 font-display text-lg font-bold text-sky-800">{pack.credits} credits</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addCredits(pack.credits)}
                    className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 font-display text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 active:scale-[0.98]"
                  >
                    Add (demo)
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
