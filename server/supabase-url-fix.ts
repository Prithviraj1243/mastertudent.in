/**
 * supabase-url-fix.ts
 * Converts any Supabase DATABASE_URL (direct/IPv6) to the transaction pooler
 * URL (IPv4) that works on Render, Railway, Fly.io, etc.
 */
import { DATABASE_URL as CONFIG_DB_URL } from './config';

export function getFixedDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL || '';
  if (!raw) return raw;

  // Already using the pooler — nothing to do
  if (raw.includes('pooler.supabase.com') || raw.includes('pgbouncer=true')) {
    return raw;
  }

  // Detect direct Supabase connection URLs:
  // postgresql://postgres:PWD@db.REF.supabase.co:5432/postgres
  const directMatch = raw.match(
    /postgresql:\/\/([^:]+):([^@]+)@db\.([a-z0-9]+)\.supabase\.co(?::\d+)?\/(\w+)/
  );

  if (directMatch) {
    const [, user, password, ref, dbName] = directMatch;
    // Use SUPABASE_URL to detect region (default ap-south-1 for the project)
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const region = supabaseUrl.includes('ap-south-1') ? 'ap-south-1' : 'ap-south-1';

    // Transaction pooler (port 6543) — IPv4, works everywhere
    const poolerUrl = `postgresql://postgres.${ref}:${password}@aws-0-${region}.pooler.supabase.com:6543/${dbName}?pgbouncer=true`;
    console.log(`🔧 DB URL auto-fixed: direct → pooler (Render/IPv4 compatible)`);
    console.log(`   ref: ${ref} | region: ${region}`);
    return poolerUrl;
  }

  // Detect format with project ref already in user: postgres.REF:PWD@...
  // but pointing to wrong host — shouldn't normally happen
  if (raw.includes('.supabase.co:5432') && !raw.includes('pooler')) {
    // Try to extract ref from SUPABASE_URL
    const refMatch = (process.env.SUPABASE_URL || '').match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
    const ref = refMatch?.[1];

    // Extract password using simple regex
    const pwdMatch = raw.match(/postgres(?:\.[^:]+)?:([^@]+)@/);
    const password = pwdMatch?.[1];

    if (ref && password) {
      const poolerUrl = `postgresql://postgres.${ref}:${password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;
      console.log(`🔧 DB URL auto-fixed (fallback): → pooler for ref ${ref}`);
      return poolerUrl;
    }
  }

  return raw;
}

export function isPoolerUrl(url: string): boolean {
  return url.includes('pgbouncer=true') || url.includes(':6543/') || url.includes('pooler.supabase.com');
}
