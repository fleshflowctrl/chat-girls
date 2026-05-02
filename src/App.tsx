import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { CompanionCatalogBootstrap } from './components/CompanionCatalogBootstrap'
import { LandingPage } from './components/landing/LandingPage'
import { AuthProvider } from './contexts/AuthContext'
import { CreditsProvider } from './contexts/CreditsContext'
import { AppLayout } from './layouts/AppLayout'
import { ChatPage } from './pages/ChatPage'
import { ChatsPage } from './pages/ChatsPage'
import { CreditsPage } from './pages/CreditsPage'
import { ProfilePage } from './pages/ProfilePage'

/** Params come from the matched route; pass through so ChatPage does not rely on nested context quirks. */
function ChatRoute() {
  const { profileId } = useParams<{ profileId: string }>()
  if (!profileId) return <Navigate to="/" replace />
  return <ChatPage key={profileId} profileId={profileId} />
}

function App() {
  return (
    <CreditsProvider>
      <AuthProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </AuthProvider>
    </CreditsProvider>
  )
}

export default App
