import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

let db: any;

// Use postgres-js for reliable connection
if (process.env.USE_SQLITE === "1") {
  // In-memory mode (mock db for testing)
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
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  console.log('🔌 Connecting to PostgreSQL database...');
  
  const connectionString = process.env.DATABASE_URL;
  const isPooler = connectionString?.includes('pgbouncer=true') || connectionString?.includes(':6543/');
  
  const sql = postgres(connectionString, {
    ssl: 'require',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 15,
    // pgBouncer transaction pooler doesn't support prepared statements
    prepare: !isPooler,
    // Suppress connection error logs — we handle errors at the storage layer
    onnotice: () => {},
  });
  
  db = drizzle(sql, { schema });
  console.log(`✅ PostgreSQL database connected (${isPooler ? 'pooler' : 'direct'})`);
}

export { db };
