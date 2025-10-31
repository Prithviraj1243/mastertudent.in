import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Exported bindings assigned conditionally to avoid ESM export-in-block error
// eslint-disable-next-line import/no-mutable-exports
export let db: any;
// eslint-disable-next-line import/no-mutable-exports
export let pool: any;

if (process.env.USE_SQLITE === '1') {
  db = {} as any; // placeholder; in dev mode storage bypasses db
} else {
  neonConfig.webSocketConstructor = ws;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}