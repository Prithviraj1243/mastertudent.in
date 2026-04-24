-- ============================================
-- SUPABASE REALTIME POLICIES FIX (WORKING VERSION)
-- Run this in Supabase SQL Editor
-- ============================================

-- First, drop existing policies if they exist (prevents errors)
DROP POLICY IF EXISTS "Allow public read access to notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated users to insert notes" ON notes;
DROP POLICY IF EXISTS "Allow users to update their own notes" ON notes;
DROP POLICY IF EXISTS "Allow service role full access to notes" ON notes;

DROP POLICY IF EXISTS "Allow users to read their own data" ON users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON users;
DROP POLICY IF EXISTS "Allow service role full access to users" ON users;
DROP POLICY IF EXISTS "Allow public read for realtime" ON users;

DROP POLICY IF EXISTS "Allow users to read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow service role to insert notifications" ON notifications;
DROP POLICY IF EXISTS "Allow public read notifications for realtime" ON notifications;

-- Enable Row Level Security on all tables
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTES TABLE POLICIES
-- ============================================

-- Allow everyone to read all notes (for real-time subscriptions)
CREATE POLICY "Allow public read access to notes"
ON notes FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to insert notes
CREATE POLICY "Allow authenticated users to insert notes"
ON notes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update notes
CREATE POLICY "Allow users to update their own notes"
ON notes FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Allow public read for realtime (needed for subscriptions)
CREATE POLICY "Allow public read for realtime"
ON users FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to update their own data
CREATE POLICY "Allow users to update their own data"
ON users FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Allow public read for realtime (needed for subscriptions)
CREATE POLICY "Allow public read notifications for realtime"
ON notifications FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to insert notifications
CREATE POLICY "Allow users to insert notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- ENABLE REALTIME
-- ============================================

-- Enable realtime on tables (may already be done)
ALTER TABLE notes REPLICA IDENTITY FULL;
ALTER TABLE users REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- ============================================
-- ADD TABLES TO REALTIME PUBLICATION
-- ============================================

-- Remove tables from publication first (if they exist)
-- PostgreSQL doesn't support IF EXISTS for DROP TABLE in ALTER PUBLICATION
-- So we use a DO block to catch and ignore errors
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE notes;
    EXCEPTION
        WHEN undefined_table OR undefined_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE users;
    EXCEPTION
        WHEN undefined_table OR undefined_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE notifications;
    EXCEPTION
        WHEN undefined_table OR undefined_object THEN NULL;
    END;
END $$;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant select on tables for realtime
GRANT SELECT ON notes TO anon;
GRANT SELECT ON users TO anon;
GRANT SELECT ON notifications TO anon;

GRANT SELECT ON notes TO authenticated;
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON notifications TO authenticated;

GRANT ALL ON notes TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON notifications TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 
    '✅ Supabase Realtime configured successfully!' as status,
    'Notes: ' || (SELECT count(*) FROM notes)::text as notes_count,
    'Users: ' || (SELECT count(*) FROM users)::text as users_count;
