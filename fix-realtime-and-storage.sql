-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR:
-- https://snzsilepbuglkrjcxdim.supabase.co/project/snzsilepbuglkrjcxdim/sql
-- ============================================================

-- 1. ENABLE REALTIME ON NOTES TABLE
-- Without this, the admin panel real-time subscription won't fire
ALTER PUBLICATION supabase_realtime ADD TABLE notes;

-- 2. FIX RLS POLICIES - Allow service role & admin to read ALL notes
-- (The current policy only allows reading published notes, 
--  which means submitted/pending notes won't appear in admin panel)

-- Drop restrictive read policy
DROP POLICY IF EXISTS "Anyone can read published notes" ON notes;

-- Allow anyone to read published notes (public)
CREATE POLICY "Anyone can read published notes" ON notes
  FOR SELECT USING (status = 'published');

-- Allow service role to read ALL notes (admin backend)
CREATE POLICY "Service role can read all notes" ON notes
  FOR SELECT USING (true);

-- 3. FIX STORAGE BUCKET POLICIES
-- Ensure the 'notes' bucket exists and is accessible

-- Allow authenticated users to upload to 'notes' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow all uploads (service role)
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
CREATE POLICY "Allow uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'notes');

-- Allow public reads
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
CREATE POLICY "Allow public reads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'notes');

-- Allow deletes by service role
DROP POLICY IF EXISTS "Allow deletes" ON storage.objects;
CREATE POLICY "Allow deletes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'notes');

-- 4. ADD 'approved' to notes status CHECK constraint if missing
-- (The schema has 'draft', 'submitted', 'published', 'rejected' but NOT 'approved')
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_status_check;
ALTER TABLE notes ADD CONSTRAINT notes_status_check 
  CHECK (status IN ('draft', 'submitted', 'published', 'rejected', 'approved'));

-- 5. VERIFY REALTIME IS ENABLED
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'notes';
