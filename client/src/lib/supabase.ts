import { createClient } from '@supabase/supabase-js';

// Runtime config injected by server/vite.ts at request time.
// This works even when VITE_* env vars were not set during the build.
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
      GOOGLE_CLIENT_ID?: string;
    };
  }
}

// Priority: runtime config (from server) > build-time VITE_ env > hardcoded fallback
const supabaseUrl =
  window.__RUNTIME_CONFIG__?.SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  window.__RUNTIME_CONFIG__?.SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('SUPABASE_URL:', supabaseUrl || 'MISSING');
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'MISSING');
}

console.log('🔧 Supabase config source:', window.__RUNTIME_CONFIG__?.SUPABASE_URL ? 'runtime (server)' : 'build-time env');
console.log('🔧 Initializing Supabase client for:', supabaseUrl || 'MISSING');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-client-info': 'masterstudent-app',
    },
  },
});

supabase.realtime.setAuth(supabaseAnonKey);

console.log('✅ Supabase client initialized');

export default supabase;
