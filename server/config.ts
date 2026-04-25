/**
 * server/config.ts
 * Central config with hardcoded fallbacks for Render deployments
 * where environment variables may not be set in the dashboard.
 * 
 * These values match what is in the committed .env file.
 */

// ── Supabase ──────────────────────────────────────────────────────────────────
export const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://snzsilepbuglkrjcxdim.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenNpbGVwYnVnbGtyamN4ZGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTc2MzAsImV4cCI6MjA4MjMzMzYzMH0.P8jg0dg17cMn3oS3xX0AcoR2rC9vNV6h8y64S-PM4Fg";

export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenNpbGVwYnVnbGtyamN4ZGltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc1NzYzMCwiZXhwIjoyMDgyMzMzNjMwfQ.ViyUgUcMjyUWIpZD6nfhfdabYspxxUeSnrn1W7RFc_o";

// ── Database ──────────────────────────────────────────────────────────────────
export const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres.snzsilepbuglkrjcxdim:prashant098675@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

// ── Session ───────────────────────────────────────────────────────────────────
export const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "masterstudent_session_secret_2025_secure";

// ── Admin ─────────────────────────────────────────────────────────────────────
export const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  "admin_jwt_secret_change_in_production";

export const ADMIN_PROMOTION_ID =
  process.env.ADMIN_PROMOTION_ID || "MASTER_ADMIN_2025";

export const ADMIN_PROMOTION_PASSWORD =
  process.env.ADMIN_PROMOTION_PASSWORD || "SecureAdmin@2025";

// ── Google OAuth ──────────────────────────────────────────────────────────────
export const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  process.env.VITE_GOOGLE_CLIENT_ID ||
  "914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com";

// ── Storage ───────────────────────────────────────────────────────────────────
export const SUPABASE_BUCKET_NAME =
  process.env.SUPABASE_BUCKET_NAME || "notes";

// ── Convenience: Supabase REST headers using service role ─────────────────────
export const supabaseAdminHeaders = () => ({
  'apikey': SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
});

export const supabaseCountHeaders = () => ({
  ...supabaseAdminHeaders(),
  'Prefer': 'count=exact',
});

console.log(`🔑 Config loaded — Supabase project: ${SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] || 'unknown'}`);
