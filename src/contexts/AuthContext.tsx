/* eslint-disable react-refresh/only-export-components -- Provider + useAuth pattern */
import type { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthModal } from '../components/auth/AuthModal'
import { tryGetSupabaseBrowserClient } from '../lib/supabase/client'

type AuthContextValue = {
  session: Session | null
  user: User | null
  /** False until initial getSession (or “no client”) finishes */
  authReady: boolean
  openAuthModal: (options?: { returnTo?: string }) => void
  closeAuthModal: () => void
  authModalOpen: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [returnTo, setReturnTo] = useState<string | null>(null)

  useEffect(() => {
    const supabase = tryGetSupabaseBrowserClient()
    if (!supabase) {
      setSession(null)
      setAuthReady(true)
      return
    }

    let cancelled = false

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!cancelled) {
        setSession(s)
        setAuthReady(true)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useLayoutEffect(() => {
    if (!session) return
    setAuthModalOpen(false)
    if (returnTo) {
      navigate(returnTo, { replace: true })
      setReturnTo(null)
    }
  }, [session, returnTo, navigate])

  const openAuthModal = useCallback((options?: { returnTo?: string }) => {
    if (options?.returnTo) setReturnTo(options.returnTo)
    setAuthModalOpen(true)
  }, [])

  const sessionRef = useRef(session)
  sessionRef.current = session

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false)
    setReturnTo(null)
    const onChat = pathname.startsWith('/chat/')
    if (onChat && !sessionRef.current) {
      navigate('/', { replace: true })
    }
  }, [navigate, pathname])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      authReady,
      openAuthModal,
      closeAuthModal,
      authModalOpen,
    }),
    [session, authReady, openAuthModal, closeAuthModal, authModalOpen],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal open={authModalOpen} onClose={closeAuthModal} />
    </AuthContext.Provider>
  )
}
