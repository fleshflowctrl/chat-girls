import { buildHeroSublineFromVibes } from './heroSubline'

type HeroProps = {
  onStartChat: () => void
  onBrowseGirls: () => void
  /** Vibe labels from the funnel (session prefs); empty = generic hero line. */
  funnelVibes?: string[]
}

export function Hero({ onStartChat, onBrowseGirls, funnelVibes = [] }: HeroProps) {
  const subline = buildHeroSublineFromVibes(funnelVibes)
  return (
    <section
      className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 pb-16 pt-14 sm:pb-20 sm:pt-20 md:pt-24"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_-15%,rgba(14,116,144,0.06),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(51,65,85,0.04),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-sky-800 sm:text-sm">
          Private messaging
        </p>
        <h1
          id="hero-heading"
          className="font-display text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-[3.25rem]"
        >
          Discreet chats
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-slate-600 sm:text-lg">{subline}</p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button
            type="button"
            onClick={onStartChat}
            className="rounded-full bg-slate-900 px-8 py-3.5 font-display text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition hover:bg-slate-800 active:scale-[0.98]"
          >
            Start chatting
          </button>
          <button
            type="button"
            onClick={onBrowseGirls}
            className="rounded-full border border-slate-300 bg-white px-8 py-3.5 font-display text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
          >
            Browse girls
          </button>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          <span className="text-slate-700">Private</span>
          <span className="mx-2 text-slate-300" aria-hidden>
            •
          </span>
          <span className="text-slate-700">Secure</span>
          <span className="mx-2 text-slate-300" aria-hidden>
            •
          </span>
          <span className="text-slate-700">18+ only</span>
        </p>
      </div>
    </section>
  )
}
