import { useAuth } from '../contexts/AuthContext'
import { useCredits } from '../contexts/CreditsContext'
import { CREDITS_PER_MESSAGE } from '../constants/credits'
import { CREDIT_PACKS } from '../data/creditPacks'

function CreditsPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-canvas">
      <p className="text-base font-medium text-stone-600">Loading…</p>
    </div>
  )
}

function CreditsAuthGate() {
  const { openAuthModal } = useAuth()
  return (
    <div className="min-h-screen bg-warm-canvas text-stone-900">
      <h1 className="sr-only">Credits</h1>
      <div className="mx-auto flex max-w-lg flex-col px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm shadow-stone-900/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-800/90">Credits</p>
          <h2 className="mt-2 font-[family-name:var(--font-brand-serif)] text-2xl font-semibold tracking-tight text-stone-900">
            Sign in required
          </h2>
          <p className="mt-3 text-base leading-relaxed text-stone-700">
            Sign in to view your balance and add message credits. Credits stay on your account.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal({ returnTo: '/credits' })}
            className="mt-8 min-h-[3rem] w-full rounded-xl bg-stone-900 py-3.5 font-display text-base font-semibold text-white shadow-md transition hover:bg-stone-800"
          >
            Sign in or sign up
          </button>
        </div>
      </div>
    </div>
  )
}

function CreditsPageContent() {
  const { balance, openBuyCredits, addCredits } = useCredits()

  return (
    <div className="min-h-screen bg-warm-canvas text-stone-900">
      <h1 className="sr-only">Credits</h1>
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm shadow-stone-900/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-800/90">Balance</p>
          <p className="mt-2 font-display text-4xl font-bold tabular-nums text-stone-900">{balance}</p>
          <p className="mt-2 text-base text-stone-700">
            credits available · {CREDITS_PER_MESSAGE} credits for each message you send
          </p>
          <button
            type="button"
            onClick={openBuyCredits}
            className="mt-5 min-h-[2.75rem] w-full rounded-xl border border-stone-300 bg-stone-50 py-3 font-display text-base font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            Open purchase options
          </button>
        </section>

        <section>
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-stone-600">Add credits</h2>
          <ul className="mt-3 space-y-3">
            {CREDIT_PACKS.map((pack) => (
              <li
                key={pack.id}
                className={`rounded-2xl border p-4 ${
                  pack.badge
                    ? 'border-amber-200 bg-amber-50/90 ring-1 ring-amber-100'
                    : 'border-stone-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-stone-900">{pack.title}</h3>
                      {pack.badge && (
                        <span className="rounded-full bg-amber-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          {pack.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-base text-stone-700">{pack.blurb}</p>
                    <p className="mt-2 font-display text-lg font-bold text-amber-900">{pack.credits} credits</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addCredits(pack.credits)}
                    className="min-h-[2.75rem] shrink-0 rounded-xl bg-stone-900 px-4 py-3 font-display text-base font-semibold text-white shadow-md transition hover:bg-stone-800"
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

export function CreditsPage() {
  const { session, authReady } = useAuth()
  if (!authReady) return <CreditsPageLoading />
  if (!session) return <CreditsAuthGate />
  return <CreditsPageContent />
}
