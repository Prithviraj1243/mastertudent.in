import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

let db: any;

if (process.env.USE_SQLITE === "1") {
  console.log('⚠️  Using mock in-memory database (USE_SQLITE=1)');
  db = {
    query: {} as any,
    select: () => ({ from: () => ({ where: () => [] }) }) as any,
    insert: () => ({ values: () => ({ returning: () => [{}] }) }) as any,
    update: () => ({ set: () => ({ where: () => ({ returning: () => [{}] }) }) }) as any,
    delete: () => ({ where: () => ({}) }) as any,
  } as any;
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }

  console.log('🔌 Connecting to PostgreSQL database...');

  let connectionString = process.env.DATABASE_URL;

  // ── Auto-fix common Supabase URL issues ─────────────────────────────────
  // 1. If using the DIRECT connection URL (db.xxx.supabase.co:5432), switch
  //    to the SESSION POOLER (aws-0-xxx.pooler.supabase.com:5432) which is
  //    IPv4-only and works on Render/Railway/Fly.io
  if (connectionString.includes('.supabase.co:5432') && !connectionString.includes('pooler.supabase.com')) {
    const ref = connectionString.match(/db\.([^.]+)\.supabase\.co/)?.[1];
    if (ref) {
      // Extract user & password from original URL
      const orig = new URL(connectionString);
      const sessionPoolerUrl = `postgresql://postgres.${ref}:${orig.password}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`;
      console.log(`⚠️  Auto-switched from direct (IPv6) → session pooler (IPv4) URL for Render compatibility`);
      connectionString = sessionPoolerUrl;
    }
  }

  const isPooler = connectionString.includes('pgbouncer=true') || connectionString.includes(':6543/');

  try {
    const sql = postgres(connectionString, {
      ssl: 'require',
      max: isPooler ? 10 : 3,
      idle_timeout: 20,
      connect_timeout: 20,
      prepare: !isPooler,
      onnotice: () => {},
    });

    db = drizzle(sql, { schema });
    console.log(`✅ PostgreSQL database connected (${isPooler ? 'pooler/pgbouncer' : 'session pooler/direct'})`);
  } catch (err: any) {
    console.error('❌ Database connection failed:', err.message);
    console.warn('⚠️  Server will start WITHOUT database — check DATABASE_URL in environment');
    // Provide a stub so the server doesn't crash — API routes will return 503
    db = {
      query: {} as any,
      select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }) as any,
      insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }) as any,
      update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }) as any,
      delete: () => ({ where: () => Promise.resolve({}) }) as any,
    } as any;
  }
}

export { db };
