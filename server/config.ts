/**
 * server/config.ts
 * 
 * Sets process.env fallbacks for all critical env vars.
 * Must be imported FIRST in server/index.ts (after dotenv).
 * 
 * These hardcoded values match the committed .env file,
 * so the app works on Render even without any env vars configured.
 */

// ── Helper ────────────────────────────────────────────────────────────────────
function setEnv(key: string, fallback: string): void {
  if (!process.env[key]) {
    process.env[key] = fallback;
    console.log(`📌 [config] Set fallback: ${key}`);
  }
}

// ── Supabase ──────────────────────────────────────────────────────────────────
setEnv('SUPABASE_URL',              'https://snzsilepbuglkrjcxdim.supabase.co');
setEnv('VITE_SUPABASE_URL',         'https://snzsilepbuglkrjcxdim.supabase.co');
setEnv('SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenNpbGVwYnVnbGtyamN4ZGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTc2MzAsImV4cCI6MjA4MjMzMzYzMH0.P8jg0dg17cMn3oS3xX0AcoR2rC9vNV6h8y64S-PM4Fg');
setEnv('VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenNpbGVwYnVnbGtyamN4ZGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTc2MzAsImV4cCI6MjA4MjMzMzYzMH0.P8jg0dg17cMn3oS3xX0AcoR2rC9vNV6h8y64S-PM4Fg');
setEnv('VITE_SUPABASE_PUBLISHABLE_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenNpbGVwYnVnbGtyamN4ZGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTc2MzAsImV4cCI6MjA4MjMzMzYzMH0.P8jg0dg17cMn3oS3xX0AcoR2rC9vNV6h8y64S-PM4Fg');
setEnv('SUPABASE_SERVICE_ROLE_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenNpbGVwYnVnbGtyamN4ZGltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc1NzYzMCwiZXhwIjoyMDgyMzMzNjMwfQ.ViyUgUcMjyUWIpZD6nfhfdabYspxxUeSnrn1W7RFc_o');
setEnv('SUPABASE_BUCKET_NAME', 'notes');

// ── Database (IPv4 Supabase pooler — works on Render) ─────────────────────────
setEnv('DATABASE_URL',
  'postgresql://postgres.snzsilepbuglkrjcxdim:prashant098675@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true');

// ── Session ───────────────────────────────────────────────────────────────────
setEnv('SESSION_SECRET', 'masterstudent_session_secret_2025_render');

// ── Admin ─────────────────────────────────────────────────────────────────────
setEnv('ADMIN_JWT_SECRET',          'admin_jwt_secret_masterstudent_2025');
setEnv('ADMIN_SECRET_KEY',          'admin_secret_key_masterstudent_2025');
setEnv('ADMIN_USERNAME',            'admin');
setEnv('ADMIN_PASSWORD',            'admin123');
setEnv('ADMIN_PROMOTION_ID',        'MASTER_ADMIN_2025');
setEnv('ADMIN_PROMOTION_PASSWORD',  'SecureAdmin@2025');

// ── Google OAuth ──────────────────────────────────────────────────────────────
setEnv('GOOGLE_CLIENT_ID',
  '914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com');
setEnv('VITE_GOOGLE_CLIENT_ID',
  '914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com');

// ── Storage ───────────────────────────────────────────────────────────────────
setEnv('STORAGE_PROVIDER', 'supabase');
setEnv('USE_SQLITE', '0');

// ── Exports (for use in other modules) ────────────────────────────────────────
export const SUPABASE_URL             = process.env.SUPABASE_URL!;
export const SUPABASE_ANON_KEY        = process.env.SUPABASE_ANON_KEY!;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const DATABASE_URL             = process.env.DATABASE_URL!;
export const SESSION_SECRET           = process.env.SESSION_SECRET!;
export const GOOGLE_CLIENT_ID         = process.env.GOOGLE_CLIENT_ID!;
export const SUPABASE_BUCKET_NAME     = process.env.SUPABASE_BUCKET_NAME!;

export const supabaseAdminHeaders = () => ({
  'apikey':        SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type':  'application/json',
});

console.log(`✅ [config] Supabase project: ${SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1]}`);
