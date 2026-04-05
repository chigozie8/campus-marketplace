import { supabaseAdmin } from '../config/supabaseClient.js'
import { ProfileRow } from '../types/index.js'

export async function findProfileById(id: string): Promise<ProfileRow> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) throw Object.assign(new Error('Profile not found.'), { status: 404 })
  return data as ProfileRow
}

export async function upsertProfile(profile: Partial<ProfileRow> & { id: string }): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ ...profile, created_at: profile.created_at ?? new Date().toISOString() })

  if (error) throw new Error(error.message)
}

export async function findProfileByPhone(phone: string): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error || !data) return null
  return data as ProfileRow
}
