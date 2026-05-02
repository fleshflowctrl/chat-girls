import { useCredits } from '../../contexts/CreditsContext'

const TIERS = [
  {
    name: 'Start free',
    blurb: 'Sample chats and explore personalities before you commit.',
    highlight: false,
  },
  {
    name: 'Buy message credits',
    blurb: 'Top up when you want longer conversations — simple pay-as-you-go.',
    highlight: true,
  },
  {
    name: 'Unlock VIP profiles',
    blurb: 'Access our boldest VIP girls and priority replies when it matters.',
    highlight: false,
  },
] as const

export function PricingPreview() {
  const { openBuyCredits } = useCredits()

  return (
    <section className="border-t border-slate-200 bg-slate-900 px-4 py-14 text-white sm:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-sky-300/90">
          Preview only
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
          How pricing could look
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-400 sm:text-base">
          Credit packs add instantly in this demo (no real card charge). Later: checkout + receipts.
          Credits unlock chat time across the girls you like most.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <li
              key={tier.name}
              className={`rounded-2xl border px-5 py-6 ${
                tier.highlight
                  ? 'border-sky-700/40 bg-slate-800/90 ring-1 ring-sky-900/25'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <h3 className="font-display text-lg font-bold">{tier.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{tier.blurb}</p>
              {tier.highlight && (
                <button
                  type="button"
                  onClick={openBuyCredits}
                  className="mt-4 w-full rounded-xl bg-sky-600 py-2.5 font-display text-sm font-semibold text-white shadow-md transition hover:bg-sky-700"
                >
                  Buy credits
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
