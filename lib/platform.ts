import { createClient } from '@supabase/supabase-js'
import config from './platform-public.json'
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || config.supabaseUrl
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || config.supabasePublishableKey
export function browserPlatform() { return createClient(supabaseUrl, supabaseKey, { auth: { storageKey: 'ra-observatory-auth' } }) }
export function userPlatform(token: string) { return createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }) }
export async function authenticate(request: Request) {
  const token = /^Bearer ([^\s]+)$/.exec(request.headers.get('authorization') || '')?.[1]
  if (!token) return null
  const db = userPlatform(token)
  const { data, error } = await db.auth.getUser(token)
  if (error || !data.user?.email_confirmed_at || data.user.is_anonymous) return null
  return { db, user: data.user }
}
