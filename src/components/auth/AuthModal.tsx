import { useCallback, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export function AuthModal() {
  const { authModalOpen, closeAuthModal, signInWithPassword, signUpWithPassword } = useAuth()
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const resetFeedback = useCallback(() => {
    setError(null)
    setInfo(null)
  }, [])

  const submit = useCallback(async () => {
    resetFeedback()
    const em = email.trim()
    if (!em || !password) {
      setError('Enter email and password.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error: err } = await signInWithPassword(em, password)
        if (err) setError(err)
        else {
          closeAuthModal()
          setPassword('')
        }
      } else {
        const { error: err, needsEmailConfirm } = await signUpWithPassword(em, password)
        if (err) setError(err)
        else if (needsEmailConfirm) {
          setInfo('Check your inbox to confirm your email, then sign in.')
          setMode('signin')
        } else {
          closeAuthModal()
          setPassword('')
        }
      }
    } finally {
      setBusy(false)
    }
  }, [closeAuthModal, email, mode, password, resetFeedback, signInWithPassword, signUpWithPassword])

  if (!authModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={closeAuthModal}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h2 id="auth-modal-title" className="font-display text-lg font-bold text-slate-900">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {mode === 'signup'
            ? 'Save your chats securely and keep chatting on any device.'
            : 'Sign in to load your saved conversations.'}
        </p>

        <div className="mt-4 flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
            onClick={() => {
              setMode('signup')
              resetFeedback()
            }}
          >
            Sign up
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
            onClick={() => {
              setMode('signin')
              resetFeedback()
            }}
          >
            Log in
          </button>
        </div>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Password
          <input
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
          />
        </label>

        {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
        {info ? <p className="mt-3 text-sm font-medium text-sky-800">{info}</p> : null}

        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className="mt-5 w-full rounded-xl bg-slate-900 py-3 font-display text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
        </button>
        <button
          type="button"
          onClick={closeAuthModal}
          className="mt-2 w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Not now
        </button>
      </div>
    </div>
  )
}
