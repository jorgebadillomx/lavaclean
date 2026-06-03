import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function setSupabaseSession(accessToken: string): void {
  supabase.auth.setSession({ access_token: accessToken, refresh_token: '' });
}

export type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
