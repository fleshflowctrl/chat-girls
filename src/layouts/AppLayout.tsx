import { useSyncExternalStore } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '../components/nav/BottomNav'
import { readFunnelSkippedThisSession, subscribeFunnelSkipSession } from '../utils/funnelPreferences'

export function AppLayout() {
  const { pathname } = useLocation()
  const funnelSkipped = useSyncExternalStore(
    subscribeFunnelSkipSession,
    readFunnelSkippedThisSession,
    () => false,
  )
  const showNav = pathname !== '/' || funnelSkipped

  return (
    <div className="min-h-[100dvh]">
      <div
        className={
          showNav
            ? 'pb-[calc(3.75rem+max(0.35rem,env(safe-area-inset-bottom)))]'
            : 'min-h-[100dvh]'
        }
      >
        <Outlet />
      </div>
      {showNav ? <BottomNav /> : null}
    </div>
  )
}
