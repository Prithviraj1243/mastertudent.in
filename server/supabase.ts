import { createClient } from '@supabase/supabase-js';

// Hardcoded correct values — these are the source of truth
// config.ts also sets process.env but this file may be loaded before config.ts
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  'https://snzsilepbuglkrjcxdim.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenNpbGVwYnVnbGtyamN4ZGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTc2MzAsImV4cCI6MjA4MjMzMzYzMH0.P8jg0dg17cMn3oS3xX0AcoR2rC9vNV6h8y64S-PM4Fg';

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenNpbGVwYnVnbGtyamN4ZGltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc1NzYzMCwiZXhwIjoyMDgyMzMzNjMwfQ.ViyUgUcMjyUWIpZD6nfhfdabYspxxUeSnrn1W7RFc_o';

console.log(`🔧 [supabase.ts] URL: ${SUPABASE_URL} | Key: ${SUPABASE_SERVICE_KEY ? 'present' : 'MISSING'}`);

// Client for auth operations (uses anon key)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Admin client for all server-side operations (uses service role key)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
