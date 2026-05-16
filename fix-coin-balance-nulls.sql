-- Fix: Set coin_balance and total_earned to 0 where they are NULL
-- Run this in your Supabase SQL editor to prevent the "always shows 20 coins" bug.

-- 1. Fix any NULL coin_balance rows
UPDATE users
SET coin_balance = 0
WHERE coin_balance IS NULL;

-- 2. Fix any NULL total_earned rows
UPDATE users
SET total_earned = 0
WHERE total_earned IS NULL;

-- 3. Set column defaults so future rows are always 0, not NULL
ALTER TABLE users ALTER COLUMN coin_balance SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN total_earned SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN total_spent SET DEFAULT 0;

-- 4. Add NOT NULL constraints (optional but recommended)
-- ALTER TABLE users ALTER COLUMN coin_balance SET NOT NULL;
-- ALTER TABLE users ALTER COLUMN total_earned SET NOT NULL;

-- Verify: check if any user still has NULL
SELECT id, email, coin_balance, total_earned
FROM users
WHERE coin_balance IS NULL OR total_earned IS NULL;
