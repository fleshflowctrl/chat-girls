import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { CompanionCatalogBootstrap } from './components/CompanionCatalogBootstrap'
import { LandingPage } from './components/landing/LandingPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CreditsProvider } from './contexts/CreditsContext'
import { AppLayout } from './layouts/AppLayout'
import { ChatPage } from './pages/ChatPage'
import { ChatsPage } from './pages/ChatsPage'
import { CreditsPage } from './pages/CreditsPage'
import { ProfilePage } from './pages/ProfilePage'

function ChatAuthWall() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-100 px-6 text-center">
      <p className="font-display text-base font-semibold text-slate-900">Account required</p>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Use the sign-in window to continue. If you closed it, go back to Home and tap Chat again.
      </p>
    </div>
  )
}

/** Params come from the matched route; pass through so ChatPage does not rely on nested context quirks. */
function ChatRoute() {
  const { profileId } = useParams<{ profileId: string }>()
  const { session, authReady, openAuthModal } = useAuth()

  useEffect(() => {
    if (!profileId || !authReady || session) return
    openAuthModal({ returnTo: `/chat/${profileId}` })
  }, [profileId, authReady, session, openAuthModal])

  if (!profileId) return <Navigate to="/" replace />
  if (!authReady) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-100">
        <p className="text-sm font-medium text-slate-500">Loading…</p>
      </div>
    )
  }
  if (!session) return <ChatAuthWall />
  return <ChatPage key={profileId} profileId={profileId} />
}

function App() {
  return (
    <CreditsProvider>
      <BrowserRouter>
        <AuthProvider>
          <CompanionCatalogBootstrap />
          <Routes>
            {/* Match chat before the pathless layout so `/chat/:id` is never swallowed by layout ranking. */}
            <Route path="/chat/:profileId" element={<ChatRoute />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/chats" element={<ChatsPage />} />
              <Route path="/credits" element={<CreditsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </CreditsProvider>
  )
}

export default App
