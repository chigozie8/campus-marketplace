import { createBrowserClient } from '@supabase/ssr'

type SupabaseClient = ReturnType<typeof createBrowserClient>

// Key used to cache the client on the window object.
// window survives Next.js HMR reloads; a module-level `let` variable does not.
// Without this, every hot-reload creates a second client that immediately
// races the first for the auth token refresh lock, producing:
//   "Lock … was released because another request stole it"
const WIN_KEY = '__vx_supabase_client__'
const PATCH_KEY = '__vx_supabase_console_patched__'

/**
 * Supabase's auth client logs a warning whenever its Web Lock is "stolen" by
 * another concurrent token-refresh request (common with multiple tabs or React
 * strict-mode double mounts). The auth flow still works correctly, but Next.js
 * dev mode promotes any console.error to a full-screen runtime-error overlay,
 * which scares users. We filter out only this exact, well-known harmless message.
 */
function silenceHarmlessLockWarning() {
  if (typeof window === 'undefined') return
  const w = window as typeof window & { [PATCH_KEY]?: boolean }
  if (w[PATCH_KEY]) return
  w[PATCH_KEY] = true

  const HARMLESS = /Lock ".*-auth-token" was released because another request stole it/i
  const origError = console.error
  const origWarn = console.warn
  console.error = (...args: unknown[]) => {
    const msg = args.map(a => (typeof a === 'string' ? a : (a as Error)?.message || '')).join(' ')
    if (HARMLESS.test(msg)) return
    origError.apply(console, args)
  }
  console.warn = (...args: unknown[]) => {
    const msg = args.map(a => (typeof a === 'string' ? a : (a as Error)?.message || '')).join(' ')
    if (HARMLESS.test(msg)) return
    origWarn.apply(console, args)
  }
}

export function createClient(): SupabaseClient {
  silenceHarmlessLockWarning()

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
