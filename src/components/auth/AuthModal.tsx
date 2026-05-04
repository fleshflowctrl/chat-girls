import { useCallback, useEffect, useId, useState } from 'react'
import { tryGetSupabaseBrowserClient } from '../../lib/supabase/client'

type AuthModalProps = {
  open: boolean
  onClose: () => void
}

type Tab = 'signin' | 'signup'

export function AuthModal({ open, onClose }: AuthModalProps) {
  const titleId = useId()
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTab('signin')
      setEmail('')
      setPassword('')
      setBusy(false)
      setError(null)
      setInfo(null)
    }
  }, [open])

  const submit = useCallback(async () => {
    setError(null)
    setInfo(null)
    const supabase = tryGetSupabaseBrowserClient()
    if (!supabase) {
      setError('Sign-in is not set up yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.')
      return
    }

    const e = email.trim()
    const p = password
    if (!e || !p) {
      setError('Enter email and password.')
      return
    }

    setBusy(true)
    try {
      if (tab === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({ email: e, password: p })
        if (err) {
          setError(err.message)
          return
        }
        if (data.session) {
          /* Email confirmation off — session is active; AuthProvider closes modal and navigates */
          return
        }
        setInfo('Check your email to confirm your account, then sign in.')
        setTab('signin')
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: e, password: p })
        if (err) {
          setError(err.message)
          return
        }
        /* Session updates; AuthProvider clears modal and applies returnTo */
      }
    } finally {
      setBusy(false)
    }
  }, [email, password, tab])

  if (!open) return null

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-base text-stone-900 shadow-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/30'

  return (
    <div
      className="fixed inset-0 z-[210] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/75 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-800/90">Account</p>
            <h2 id={titleId} className="mt-1 font-[family-name:var(--font-brand-serif)] text-xl font-semibold text-stone-900 sm:text-2xl">
              Sign in to continue
            </h2>
            <p className="mt-2 text-base leading-relaxed text-stone-700">
              Create a free account or sign in to send messages. Your details are stored securely with your
              profile.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-3 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            aria-label="Close"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex rounded-xl bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => setTab('signin')}
            className={`min-h-[2.75rem] flex-1 rounded-lg py-2.5 text-base font-semibold transition ${
              tab === 'signin' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`min-h-[2.75rem] flex-1 rounded-lg py-2.5 text-base font-semibold transition ${
              tab === 'signup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign up
          </button>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(ev) => {
            ev.preventDefault()
            void submit()
          }}
        >
          <div>
            <label htmlFor="auth-email" className="text-base font-medium text-stone-800">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="text-base font-medium text-stone-800">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className={inputClass}
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-base text-red-900">{error}</p>
          ) : null}
          {info ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-base text-amber-950">{info}</p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="min-h-[3rem] w-full rounded-xl bg-stone-900 py-3.5 font-display text-base font-semibold text-white shadow-md transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Please wait…' : tab === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
