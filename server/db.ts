import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";
import { getFixedDatabaseUrl, isPoolerUrl } from './supabase-url-fix';

let db: any;

if (process.env.USE_SQLITE === "1") {
  console.log('⚠️  Using mock in-memory database (USE_SQLITE=1)');
  db = makeMockDb();
} else if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set — using mock DB. Set it in environment.');
  db = makeMockDb();
} else {
  // Auto-fix IPv6 direct URL → IPv4 pooler URL
  const connectionString = getFixedDatabaseUrl();
  const pooler = isPoolerUrl(connectionString);

  console.log(`🔌 Connecting to PostgreSQL (${pooler ? 'transaction pooler' : 'direct'})...`);

  const sql = postgres(connectionString, {
    ssl: 'require',
    max: pooler ? 10 : 3,
    idle_timeout: 20,
    connect_timeout: 30,
    // pgBouncer transaction mode doesn't support prepared statements
    prepare: !pooler,
    onnotice: () => {},
    // Don't throw on connect — be lazy
    connection: { application_name: 'masterstudent' },
  });

  db = drizzle(sql, { schema });
  console.log('✅ PostgreSQL db client ready');
}

function makeMockDb(): any {
  return {
    query: {} as any,
    select: () => ({ from: () => ({ where: () => Promise.resolve([]), orderBy: () => ({ limit: () => Promise.resolve([]) }) }) }) as any,
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }) as any,
    update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }) as any,
    delete: () => ({ where: () => Promise.resolve({}) }) as any,
  };
}

export { db };
