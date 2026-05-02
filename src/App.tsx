import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { LandingPage } from './components/landing/LandingPage'
import { ChatPage } from './pages/ChatPage'

/** Remount chat when `profileId` changes so message state resets cleanly. */
function ChatRoute() {
  const { profileId } = useParams()
  return <ChatPage key={profileId ?? ''} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat/:profileId" element={<ChatRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
