// Points to the external Supabase project that holds the UniMarket schema.
// Publishable (anon) keys are safe to embed in client code.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://zfqibmjvtfpztcrjqojw.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmcWlibWp2dGZwenRjcmpxb2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTI3NDgsImV4cCI6MjA5NzA2ODc0OH0.Uthj88D5VLNifT4BSh2v2xUYITAq_Bvn4nGrt0gyP-A';

function createSupabaseClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});

// Temporary connectivity check — remove once the Supabase connection is confirmed live.
export async function testConnection() {
  const { data, error } = await supabase
    .from('universities')
    .select('name, short_name')
    .eq('is_active', true);

  if (error) {
    console.error('Supabase connection failed:', error.message);
    return false;
  }

  console.log('Supabase connected. Universities:', data);
  return true;
}
