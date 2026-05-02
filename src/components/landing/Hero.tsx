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
      className="relative overflow-hidden bg-stone-950 px-4 pb-16 pt-14 sm:pb-20 sm:pt-20 md:pt-24"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(124,58,237,0.35),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,rgba(225,29,72,0.12),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-rose-300/90 sm:text-sm">
          Premium private chat
        </p>
        <h1
          id="hero-heading"
          className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]"
        >
          Discreet chats
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-stone-300 sm:text-lg">
          {subline}
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button
            type="button"
            onClick={onStartChat}
            className="rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-8 py-3.5 font-display text-sm font-semibold text-white shadow-lg shadow-rose-900/40 transition hover:brightness-110 active:scale-[0.98]"
          >
            Start chatting
          </button>
          <button
            type="button"
            onClick={onBrowseGirls}
            className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 font-display text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 active:scale-[0.98]"
          >
            Browse girls
          </button>
        </div>
        <p className="mt-6 text-sm text-stone-400">
          <span className="text-stone-300">Private</span>
          <span className="mx-2 text-stone-600" aria-hidden>
            •
          </span>
          <span className="text-stone-300">Instant</span>
          <span className="mx-2 text-stone-600" aria-hidden>
            •
          </span>
          <span className="text-stone-300">18+ only</span>
        </p>
      </div>
    </section>
  )
}
