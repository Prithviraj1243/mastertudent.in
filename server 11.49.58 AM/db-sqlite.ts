import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';

// Create SQLite database
const sqlite = new Database('database.db');

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    firstName TEXT,
    lastName TEXT,
    role TEXT DEFAULT 'student',
    profileImageUrl TEXT,
    coinBalance INTEGER DEFAULT 0,
    freeDownloadsLeft INTEGER DEFAULT 3,
    lastFreeDownloadReset TEXT DEFAULT CURRENT_TIMESTAMP,
    reputation INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    totalEarned INTEGER DEFAULT 0,
    totalSpent INTEGER DEFAULT 0,
    onboardingCompleted BOOLEAN DEFAULT false,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT,
    description TEXT,
    attachments TEXT, -- JSON array as string
    status TEXT DEFAULT 'draft',
    type TEXT DEFAULT 'notes',
    version INTEGER DEFAULT 1,
    slug TEXT UNIQUE,
    topperId TEXT NOT NULL REFERENCES users(id),
    reviewerId TEXT REFERENCES users(id),
    publishedAt TEXT,
    featured BOOLEAN DEFAULT false,
    downloadsCount INTEGER DEFAULT 0,
    viewsCount INTEGER DEFAULT 0,
    likesCount INTEGER DEFAULT 0,
    price INTEGER DEFAULT 5,
    isPremium BOOLEAN DEFAULT false,
    tags TEXT, -- JSON array as string
    difficulty TEXT,
    estimatedTime INTEGER,
    thumbnailUrl TEXT,
    categoryId TEXT,
    classGrade TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    userId TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    amount INTEGER DEFAULT 0,
    coinChange INTEGER DEFAULT 0,
    noteId TEXT REFERENCES notes(id),
    description TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export const db = drizzle(sqlite);
export { sqlite };
