-- ============================================
-- SUPABASE REALTIME POLICIES FIX
-- Run this in Supabase SQL Editor to fix 401 errors
-- ============================================

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
USING (true);

-- Allow authenticated users to insert notes
CREATE POLICY "Allow authenticated users to insert notes"
ON notes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update their own notes
CREATE POLICY "Allow users to update their own notes"
ON notes FOR UPDATE
TO authenticated
USING (topper_id = auth.uid());

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access to notes"
ON notes
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Allow users to read their own data
CREATE POLICY "Allow users to read their own data"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow users to update their own data
CREATE POLICY "Allow users to update their own data"
ON users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow service role full access (for coin updates)
CREATE POLICY "Allow service role full access to users"
ON users
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public read for realtime (needed for subscriptions)
CREATE POLICY "Allow public read for realtime"
ON users FOR SELECT
USING (true);

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Allow users to read their own notifications
CREATE POLICY "Allow users to read their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow service role to insert notifications
CREATE POLICY "Allow service role to insert notifications"
ON notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow public read for realtime (needed for subscriptions)
CREATE POLICY "Allow public read notifications for realtime"
ON notifications FOR SELECT
USING (true);

-- ============================================
-- ENABLE REALTIME
-- ============================================

-- Enable realtime on tables
ALTER TABLE notes REPLICA IDENTITY FULL;
ALTER TABLE users REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;

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

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Supabase Realtime policies configured successfully!';
    RAISE NOTICE '✅ Tables: notes, users, notifications';
    RAISE NOTICE '✅ RLS enabled with public read access';
    RAISE NOTICE '✅ Realtime subscriptions should now work!';
END $$;
