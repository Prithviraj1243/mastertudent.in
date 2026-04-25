import { createClient } from '@supabase/supabase-js';

// ⚠️  HARDCODED — DO NOT change to process.env unless Render env vars are confirmed correct.
// These credentials are for Supabase project: snzsilepbuglkrjcxdim
// Confirmed working locally (Status 200 test passed April 25 2026)

const SUPABASE_URL      = 'https://snzsilepbuglkrjcxdim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenNpbGVwYnVnbGtyamN4ZGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTc2MzAsImV4cCI6MjA4MjMzMzYzMH0.P8jg0dg17cMn3oS3xX0AcoR2rC9vNV6h8y64S-PM4Fg';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenNpbGVwYnVnbGtyamN4ZGltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc1NzYzMCwiZXhwIjoyMDgyMzMzNjMwfQ.ViyUgUcMjyUWIpZD6nfhfdabYspxxUeSnrn1W7RFc_o';

console.log(`✅ [supabase.ts] Initialized with project: snzsilepbuglkrjcxdim`);

// Client for auth operations (uses anon key)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Admin client for all server-side DB + storage operations (uses service role key)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
