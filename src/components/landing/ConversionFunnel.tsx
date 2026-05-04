import { useCallback, useState } from 'react'
import {
  FUNNEL_AGE_MAX_KEY,
  FUNNEL_AGE_MIN_KEY,
  FUNNEL_VIBES_KEY,
} from '../../utils/funnelPreferences'

const TOTAL_STEPS = 5

/** Vibes shown in funnel — align with profile tags / future recommendations API. */
const VIBE_OPTIONS = [
  'Romantic',
  'Caring',
  'Easy conversation',
  'Warm company',
  'Flirty',
  'Playful',
  'Chill & sweet',
  'Bold & confident',
] as const

const AGE_PRESETS = [
  { id: '60-69', label: '60–69', min: 60, max: 69 },
  { id: '70plus', label: '70+', min: 70, max: 99 },
  { id: '50-59', label: '50–59', min: 50, max: 59 },
  { id: '40-49', label: '40–49', min: 40, max: 49 },
  { id: 'any', label: 'Any age', min: 18, max: 99 },
] as const

type ConversionFunnelProps = {
  /** Called after the final CTA — parent should persist + reveal the landing page. */
  onComplete: () => void
}

function persistPreferences(vibes: string[], ageMin: number, ageMax: number) {
  try {
    sessionStorage.setItem(FUNNEL_VIBES_KEY, JSON.stringify(vibes))
    sessionStorage.setItem(FUNNEL_AGE_MIN_KEY, String(ageMin))
    sessionStorage.setItem(FUNNEL_AGE_MAX_KEY, String(ageMax))
  } catch {
    /* blocked storage */
  }
  // Later: POST /api/onboarding or attach to signup payload with vibes + age range.
}

export function ConversionFunnel({ onComplete }: ConversionFunnelProps) {
  const [step, setStep] = useState(1)
  const [vibeTags, setVibeTags] = useState<Set<string>>(() => new Set())
  const [agePresetId, setAgePresetId] = useState<string>('60-69')
  const [ageMinCustom, setAgeMinCustom] = useState(18)
  const [ageMaxCustom, setAgeMaxCustom] = useState(35)
  const [useCustomAge, setUseCustomAge] = useState(false)

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }, [])

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1))
  }, [])

  const toggleVibe = useCallback((tag: string) => {
    setVibeTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }, [])

  const resolveAgeRange = useCallback((): { min: number; max: number } => {
    if (useCustomAge) {
      const lo = Math.min(ageMinCustom, ageMaxCustom, 99)
      const hi = Math.max(ageMinCustom, ageMaxCustom, 18)
      return { min: Math.max(18, lo), max: Math.min(99, hi) }
    }
    const preset = AGE_PRESETS.find((p) => p.id === agePresetId)
    return preset ? { min: preset.min, max: preset.max } : { min: 18, max: 99 }
  }, [agePresetId, useCustomAge, ageMinCustom, ageMaxCustom])

  const handleFinal = useCallback(() => {
    const { min, max } = resolveAgeRange()
    const vibes = [...vibeTags]
    persistPreferences(vibes, min, max)
    onComplete()
  }, [onComplete, resolveAgeRange, vibeTags])

  return (
    <div className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-stone-900 text-stone-50">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(120,113,108,0.35),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_100%_100%,rgba(87,83,78,0.45),transparent)]"
        aria-hidden
      />

      <header className="relative flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="flex w-14 shrink-0 items-center gap-1 text-sm font-medium text-stone-400 transition hover:text-white"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        ) : (
          <span className="w-14 shrink-0" aria-hidden />
        )}
        <div className="flex max-w-[55vw] flex-wrap justify-center gap-1 sm:max-w-none" role="status" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i + 1 === step
                  ? 'w-5 bg-amber-500 sm:w-8'
                  : i + 1 < step
                    ? 'w-1.5 bg-white/50 sm:w-2'
                    : 'w-1.5 bg-white/15 sm:w-2'
              }`}
            />
          ))}
        </div>
        <span className="w-14 shrink-0 text-right font-[family-name:var(--font-brand-serif)] text-sm font-semibold tracking-tight text-stone-100">
          whisper
        </span>
      </header>

      <main className="relative flex flex-1 flex-col justify-center overflow-y-auto px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
        {step === 1 && (
          <div className="mx-auto w-full max-w-lg">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-amber-200/95">
              Private chat
            </p>
            <h1 className="mt-4 text-center font-[family-name:var(--font-brand-serif)] text-[1.65rem] font-semibold leading-snug tracking-tight text-stone-50 sm:text-3xl md:text-[2.1rem]">
              Conversation that feels easy and real
            </h1>
            <p className="mx-auto mt-5 max-w-md text-center text-base leading-relaxed text-stone-300 sm:text-lg">
              Meet people who reply thoughtfully — on your phone, in your own time, with your privacy respected.
            </p>
            <p className="mt-6 text-center text-sm leading-relaxed text-stone-400">
              <span className="text-stone-200">Private</span>
              <span className="mx-2 text-stone-500">·</span>
              <span className="text-stone-200">Clear &amp; simple</span>
              <span className="mx-2 text-stone-500">·</span>
              <span className="text-stone-200">No pressure</span>
            </p>
            <button
              type="button"
              onClick={goNext}
              className="mx-auto mt-10 flex min-h-[3.25rem] w-full max-w-sm items-center justify-center rounded-full bg-amber-600 px-6 py-4 font-display text-lg font-semibold text-stone-950 shadow-lg shadow-black/25 transition hover:bg-amber-500 sm:min-h-[3.5rem] sm:text-xl"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto w-full max-w-lg">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Quick check
            </p>
            <h2 className="mt-3 text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Adults only
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-center text-base leading-relaxed text-stone-400">
              This service is for adults (18+). Please confirm you meet the age requirement.
            </p>
            <div className="mx-auto mt-10 flex w-full max-w-sm flex-col gap-3">
              <button
                type="button"
                onClick={goNext}
                className="min-h-[3.25rem] w-full rounded-full bg-amber-600 py-4 font-display text-lg font-semibold text-stone-950 shadow-lg shadow-black/25 transition hover:bg-amber-500"
              >
                I’m 18 or older
              </button>
              <a
                href="https://www.google.com"
                className="min-h-[3rem] w-full rounded-full border border-white/20 py-3.5 text-center font-display text-base font-medium text-stone-300 transition hover:bg-white/5 hover:text-stone-100"
              >
                I’m not 18 — exit
              </a>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mx-auto w-full max-w-lg">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">
              Your preferences
            </p>
            <h2 className="mt-3 text-center font-[family-name:var(--font-brand-serif)] text-2xl font-semibold leading-snug tracking-tight text-stone-50 sm:text-3xl">
              What kind of connection feels right to you?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-base leading-relaxed text-stone-400 sm:text-[1.05rem]">
              Pick all that fit — we’ll show matching profiles first. You can skip and browse everyone.
            </p>
            <div className="mx-auto mt-8 flex max-w-md flex-wrap justify-center gap-2">
              {VIBE_OPTIONS.map((tag) => {
                const active = vibeTags.has(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleVibe(tag)}
                    className={`min-h-[2.75rem] rounded-full px-4 py-2.5 text-base font-semibold transition ${
                      active
                        ? 'bg-amber-600 text-stone-950 shadow-md shadow-black/20'
                        : 'border border-white/15 bg-white/5 text-stone-200 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={goNext}
              className="mx-auto mt-10 flex min-h-[3.25rem] w-full max-w-sm items-center justify-center rounded-full bg-white py-4 font-display text-lg font-semibold text-stone-900 shadow-lg transition hover:bg-stone-100"
            >
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="mx-auto w-full max-w-lg">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">
              Almost there
            </p>
            <h2 className="mt-3 text-center font-[family-name:var(--font-brand-serif)] text-2xl font-semibold leading-snug tracking-tight text-stone-50 sm:text-3xl">
              Preferred age range?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-base leading-relaxed text-stone-400 sm:text-[1.05rem]">
              Choose a bracket or set your own minimum and maximum (18+). This only filters what you see first.
            </p>

            <div className="mx-auto mt-8 max-w-md">
              <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-stone-500">
                Quick picks
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {AGE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setUseCustomAge(false)
                      setAgePresetId(p.id)
                    }}
                    className={`min-h-[2.75rem] rounded-full px-4 py-2.5 text-base font-semibold transition ${
                      !useCustomAge && agePresetId === p.id
                        ? 'bg-amber-600 text-stone-950 shadow-md shadow-black/20'
                        : 'border border-white/15 bg-white/5 text-stone-200 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-200">
                  <input
                    type="checkbox"
                    checked={useCustomAge}
                    onChange={(e) => setUseCustomAge(e.target.checked)}
                    className="size-5 rounded border-stone-500 text-amber-600 focus:ring-amber-500"
                  />
                  Use custom min / max
                </label>
                {useCustomAge && (
                  <div className="mt-4 flex items-center gap-3">
                    <label className="flex flex-1 flex-col gap-1 text-xs text-stone-400">
                      Min
                      <input
                        type="number"
                        min={18}
                        max={99}
                        value={ageMinCustom}
                        onChange={(e) =>
                          setAgeMinCustom(Math.min(99, Math.max(18, Number(e.target.value) || 18)))
                        }
                        className="rounded-xl border border-white/10 bg-stone-950/80 px-3 py-3 text-lg text-white outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </label>
                    <span className="mt-5 text-stone-500">—</span>
                    <label className="flex flex-1 flex-col gap-1 text-xs text-stone-400">
                      Max
                      <input
                        type="number"
                        min={18}
                        max={99}
                        value={ageMaxCustom}
                        onChange={(e) =>
                          setAgeMaxCustom(Math.min(99, Math.max(18, Number(e.target.value) || 99)))
                        }
                        className="rounded-xl border border-white/10 bg-stone-950/80 px-3 py-3 text-lg text-white outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={goNext}
              className="mx-auto mt-10 flex min-h-[3.25rem] w-full max-w-sm items-center justify-center rounded-full bg-amber-600 py-4 font-display text-lg font-semibold text-stone-950 shadow-lg shadow-black/25 transition hover:bg-amber-500"
            >
              Continue
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="mx-auto w-full max-w-lg">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">
              You’re in
            </p>
            <h2 className="mt-3 text-center font-[family-name:var(--font-brand-serif)] text-2xl font-semibold leading-snug tracking-tight text-stone-50 sm:text-3xl">
              Here’s what you can expect
            </h2>
            <ul className="mx-auto mt-8 max-w-md space-y-4 text-left">
              <li className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/25 text-amber-200">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-white">Timely replies</p>
                  <p className="mt-1 text-base leading-relaxed text-stone-400">
                    Messages tend to come back quickly — whenever you feel like chatting.
                  </p>
                </div>
              </li>
              <li className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-stone-500/30 text-stone-200">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-white">Your privacy</p>
                  <p className="mt-1 text-base leading-relaxed text-stone-400">
                    What you share stays in your conversation — handled with care.
                  </p>
                </div>
              </li>
              <li className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-600/25 text-amber-100">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-white">Simple to use</p>
                  <p className="mt-1 text-base leading-relaxed text-stone-400">
                    Browse profiles, tap to chat, and pick up where you left off — no fuss.
                  </p>
                </div>
              </li>
            </ul>
            <button
              type="button"
              onClick={handleFinal}
              className="mx-auto mt-10 flex min-h-[3.25rem] w-full max-w-sm items-center justify-center rounded-full bg-white py-4 font-display text-lg font-semibold text-stone-900 shadow-xl transition hover:bg-stone-100 sm:text-xl"
            >
              Browse profiles
            </button>
          </div>
        )}
      </main>

      <footer className="relative shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 text-center text-xs leading-relaxed text-stone-500">
        For chat and companionship online only. Be kind, be honest, and respect boundaries.
      </footer>
    </div>
  )
}
