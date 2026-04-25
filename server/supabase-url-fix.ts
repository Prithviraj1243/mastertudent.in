/**
 * supabase-url-fix.ts
 * Converts any Supabase DATABASE_URL (direct/IPv6) to the IPv4 pooler URL.
 * Works on Render, Railway, Fly.io — anywhere IPv6 is blocked.
 */

// The guaranteed-correct pooler URL (from config.ts which sets process.env)
const POOLER_FALLBACK =
  'postgresql://postgres.snzsilepbuglkrjcxdim:prashant098675@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

export function getFixedDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL || POOLER_FALLBACK;

  // Already using the pooler — nothing to do
  if (raw.includes('pooler.supabase.com') || raw.includes('pgbouncer=true')) {
    return raw;
  }

  // Detect direct Supabase URL: postgresql://postgres:PWD@db.REF.supabase.co:5432/postgres
  const directMatch = raw.match(
    /postgresql:\/\/([^:]+):([^@]+)@db\.([a-z0-9]+)\.supabase\.co(?::\d+)?\/(\w+)/
  );

  if (directMatch) {
    const [, , password, ref, dbName] = directMatch;
    const poolerUrl = `postgresql://postgres.${ref}:${password}@aws-0-ap-south-1.pooler.supabase.com:6543/${dbName}?pgbouncer=true`;
    console.log(`🔧 DB URL auto-fixed: direct(IPv6) → pooler(IPv4) for ref ${ref}`);
    return poolerUrl;
  }

  // Unknown format — return as-is but warn
  if (raw.includes('.supabase.co') && !raw.includes('pooler')) {
    console.warn('⚠️  Supabase direct URL detected but could not auto-fix — using pooler fallback');
    return POOLER_FALLBACK;
  }

  return raw;
}

export function isPoolerUrl(url: string): boolean {
  return url.includes('pgbouncer=true') || url.includes(':6543/') || url.includes('pooler.supabase.com');
}
