import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error(
    'Supabase key:',
    import.meta.env.VITE_SUPABASE_ANON_KEY
      ? 'VITE_SUPABASE_ANON_KEY present'
      : import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        ? 'VITE_SUPABASE_PUBLISHABLE_KEY present'
        : 'Missing'
  );
  throw new Error('Missing Supabase environment variables');
}

console.log('🔧 Initializing Supabase client...');
console.log('📍 Supabase URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey, {
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

// Log connection status
supabase.realtime.setAuth(supabaseKey);

console.log('✅ Supabase client initialized');

export default supabase;
