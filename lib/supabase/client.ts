import { createBrowserClient } from '@supabase/ssr'

type SupabaseClient = ReturnType<typeof createBrowserClient>

// Key used to cache the client on the window object.
// window survives Next.js HMR reloads; a module-level `let` variable does not.
// Without this, every hot-reload creates a second client that immediately
// races the first for the auth token refresh lock, producing:
//   "Lock … was released because another request stole it"
const WIN_KEY = '__vx_supabase_client__'

export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // SSR path — shouldn't normally be reached (use lib/supabase/server.ts for
    // server components), but create an ephemeral client just in case.
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  const win = window as typeof window & { [WIN_KEY]?: SupabaseClient }
  if (!win[WIN_KEY]) {
    win[WIN_KEY] = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return win[WIN_KEY]!
}
