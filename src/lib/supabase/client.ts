/**
 * Browser Supabase client for this Vite + React SPA.
 *
 * Next.js patterns (server.ts with cookies(), middleware.ts) do not apply here.
 * If you add SSR later, add a server helper and session refresh at the edge then.
 */
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | undefined

function ensureBrowserClient(): SupabaseClient | null {
  if (browserClient) return browserClient

  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null

  browserClient = createBrowserClient(url, key)
  return browserClient
}

/** Returns null if env is not configured (app can keep using local mocks). */
export function tryGetSupabaseBrowserClient(): SupabaseClient | null {
  return ensureBrowserClient()
}

export function getSupabaseBrowserClient(): SupabaseClient {
  const c = ensureBrowserClient()
  if (!c) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill values.',
    )
  }
  return c
}
