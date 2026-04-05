import { supabase, supabaseAdmin } from '../config/supabaseClient.js'
import { upsertProfile } from '../repositories/userRepository.js'
import logger from '../utils/logger.js'

export async function register(email: string, password: string, full_name: string, role: 'buyer' | 'vendor') {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw Object.assign(new Error(error.message), { status: 400 })

  const userId = data.user?.id
  if (!userId) throw Object.assign(new Error('User creation failed.'), { status: 500 })

  try {
    await upsertProfile({ id: userId, full_name, role, email })
  } catch (err) {
    logger.warn(`Profile upsert failed for ${userId}: ${(err as Error).message}`)
  }

  return { user_id: userId, email, role }
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw Object.assign(new Error(error.message), { status: 401 })

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: { id: data.user.id, email: data.user.email },
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) throw Object.assign(new Error('Profile not found.'), { status: 404 })
  return data
}
