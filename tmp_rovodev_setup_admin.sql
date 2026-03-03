-- Run this SQL in Supabase SQL Editor to set up admin login
-- This creates the admin tables and admin account

-- 1. Create admin_accounts table
CREATE TABLE IF NOT EXISTS admin_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- 2. Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_account_id TEXT REFERENCES admin_accounts(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Insert default admin account
-- Username: admin
-- Password: admin123
INSERT INTO admin_accounts (id, username, password, email, full_name, is_active)
VALUES (
  gen_random_uuid()::text,
  'admin',
  '$2b$10$HWm9U5youDqXuipSZCbJGum3KxRgF7x2STrIh13X2wpYFLFHTeDpW',
  'admin@masterstudent.com',
  'System Administrator',
  true
)
ON CONFLICT (username) DO UPDATE
SET password = '$2b$10$HWm9U5youDqXuipSZCbJGum3KxRgF7x2STrIh13X2wpYFLFHTeDpW',
    is_active = true;

-- 4. Verify the admin account was created
SELECT id, username, email, full_name, is_active, created_at 
FROM admin_accounts 
WHERE username = 'admin';

-- ✅ Admin account ready!
-- Login credentials:
--   Username: admin
--   Password: admin123
