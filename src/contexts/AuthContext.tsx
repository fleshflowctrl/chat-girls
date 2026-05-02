/* eslint-disable react-refresh/only-export-components -- Provider + useAuth pattern */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { migrateLocalChatsToSupabase } from '../lib/api/serverChat'
import { tryGetSupabaseBrowserClient } from '../lib/supabase/client'
import { AuthModal } from '../components/auth/AuthModal'

type AuthContextValue = {
  user: User | null
  sessionReady: boolean
  authModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsEmailConfirm: boolean }>
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const v = useContext(AuthCtx)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    const client = tryGetSupabaseBrowserClient()
    if (!client) {
      queueMicrotask(() => {
        setUser(null)
        setSessionReady(true)
      })
      return
    }

    client.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      queueMicrotask(() => {
        setUser(u)
        setSessionReady(true)
      })
      if (u) void migrateLocalChatsToSupabase(client, u.id)
    })

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      queueMicrotask(() => setUser(u))
      if (event === 'SIGNED_IN' && u) {
        void migrateLocalChatsToSupabase(client, u.id).then(() => {
          window.dispatchEvent(new Event('velvet-server-chats-migrated'))
        })
      }
      if (event === 'SIGNED_OUT') queueMicrotask(() => setAuthModalOpen(false))
    })

    return () => subscription.unsubscribe()
  }, [])

  const openAuthModal = useCallback(() => setAuthModalOpen(true), [])
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const client = tryGetSupabaseBrowserClient()
    if (!client) return { error: 'Chat server is not configured.' }
    const { error } = await client.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    const client = tryGetSupabaseBrowserClient()
    if (!client) return { error: 'Chat server is not configured.', needsEmailConfirm: false }
    const { data, error } = await client.auth.signUp({ email, password })
    if (error) return { error: error.message, needsEmailConfirm: false }
    const needsEmailConfirm = !data.session
    return { error: null, needsEmailConfirm }
  }, [])

  const signOut = useCallback(async () => {
    const client = tryGetSupabaseBrowserClient()
    if (client) await client.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({
      user,
      sessionReady,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    }),
    [
      user,
      sessionReady,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    ],
  )

  return (
    <AuthCtx.Provider value={value}>
      {children}
      <AuthModal />
    </AuthCtx.Provider>
  )
}
