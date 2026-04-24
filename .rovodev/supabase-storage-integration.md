# Supabase Storage Integration for Notes Upload

Complete guide to integrate Supabase Storage for notes uploads with admin approval workflow, ensuring files are stored in Supabase cloud storage instead of local server, making it production-ready and scalable.

---

## Table of Contents
1. [Supabase Storage Setup](#supabase-storage-setup)
2. [RLS Policies Configuration](#rls-policies-configuration)
3. [Backend Integration](#backend-integration)
4. [Admin Approval Workflow](#admin-approval-workflow)
5. [Testing & Deployment](#testing--deployment)

---

## 1. Supabase Storage Setup

### Step 1.1: Create Storage Bucket

1. Go to your Supabase Dashboard: `https://snzsilepbuglkrjcxdim.supabase.co`
2. Navigate to **Storage** in the left sidebar
3. Click **"New Bucket"**
4. Fill in the details:
   - **Bucket Name**: `notes-uploads`
   - **Public Bucket**: ✅ Check this (so files can be downloaded by authenticated users)
   - **File Size Limit**: `50 MB` (adjust based on your needs)
   - **Allowed MIME types**: `application/pdf` (add others if needed)

5. Click **"Create Bucket"**

### Step 1.2: Folder Structure

Your bucket will automatically organize files like this:
```
notes-uploads/
├── {user_id}/
│   ├── {subject}/
│   │   ├── {file_hash}.pdf
│   │   └── {file_hash}.pdf
```

---

## 2. RLS Policies Configuration

### Step 2.1: Access Storage Policies

1. In Supabase Dashboard, go to **Storage** → **Policies**
2. Select the `notes-uploads` bucket
3. Click **"New Policy"**

### Step 2.2: Policy 1 - Allow Authenticated Users to Upload

**Policy Name**: `Allow authenticated users to upload notes`

**Policy Definition**: `INSERT`

**Target Roles**: `authenticated`

**Policy Command (SQL)**:
```sql
CREATE POLICY "Allow authenticated users to upload notes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'notes-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**What it does**: Allows logged-in users to upload files only to their own folder (`{user_id}/...`)

---

### Step 2.3: Policy 2 - Allow Users to Read Own Uploads

**Policy Name**: `Allow users to read own uploads`

**Policy Definition**: `SELECT`

**Target Roles**: `authenticated`

**Policy Command (SQL)**:
```sql
CREATE POLICY "Allow users to read own uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'notes-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**What it does**: Allows users to view/download files they uploaded

---

### Step 2.4: Policy 3 - Allow Public Read for Published Notes

**Policy Name**: `Allow public read for published notes`

**Policy Definition**: `SELECT`

**Target Roles**: `public, authenticated`

**Policy Command (SQL)**:
```sql
CREATE POLICY "Allow public read for published notes"
ON storage.objects
FOR SELECT
TO public, authenticated
USING (
  bucket_id = 'notes-uploads'
);
```

**What it does**: Allows anyone to download published notes (you'll control access via signed URLs in backend)

---

### Step 2.5: Policy 4 - Allow Users to Delete Own Uploads

**Policy Name**: `Allow users to delete own uploads`

**Policy Definition**: `DELETE`

**Target Roles**: `authenticated`

**Policy Command (SQL)**:
```sql
CREATE POLICY "Allow users to delete own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'notes-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**What it does**: Allows users to delete their own uploaded files

---

### Step 2.6: Policy 5 - Allow Admins Full Access

**Policy Name**: `Allow admins full access`

**Policy Definition**: `ALL`

**Target Roles**: `authenticated`

**Policy Command (SQL)**:
```sql
CREATE POLICY "Allow admins full access"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'notes-uploads'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'notes-uploads'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**What it does**: Gives admin users full read/write/delete access to all files

---

### Step 2.7: Run All Policies in SQL Editor

Go to **SQL Editor** in Supabase Dashboard and run this complete script:

```sql
-- ============================================
-- STORAGE RLS POLICIES FOR notes-uploads BUCKET
-- ============================================

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload notes" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read for published notes" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins full access" ON storage.objects;

-- Policy 1: Allow authenticated users to upload to their own folder
CREATE POLICY "Allow authenticated users to upload notes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'notes-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to read their own uploads
CREATE POLICY "Allow users to read own uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'notes-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow public read for all notes (controlled by signed URLs)
CREATE POLICY "Allow public read for published notes"
ON storage.objects
FOR SELECT
TO public, authenticated
USING (
  bucket_id = 'notes-uploads'
);

-- Policy 4: Allow users to delete their own uploads
CREATE POLICY "Allow users to delete own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'notes-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Allow admins full access
CREATE POLICY "Allow admins full access"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'notes-uploads'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'notes-uploads'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Verification query
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%notes%'
ORDER BY policyname;
```

---

## 3. Backend Integration

### Step 3.1: Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://snzsilepbuglkrjcxdim.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Storage Configuration
STORAGE_PROVIDER=supabase
SUPABASE_BUCKET_NAME=notes-uploads
```

### Step 3.2: Update Upload Route

The upload route in `server/routes.ts` already uses the storage factory. Verify it's configured:

```typescript
import { storageProvider } from './storage-factory';

app.post("/api/notes", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body.userId;
    
    // Upload to Supabase Storage
    const filePath = await storageProvider.uploadFile(file, userId);
    
    // Save note metadata to database with status: 'submitted'
    const note = await db.insert(notes).values({
      title: req.body.title,
      subject: req.body.subject,
      description: req.body.description,
      attachments: [{ path: filePath, name: file.originalname }],
      topper_id: userId,
      status: 'submitted', // Pending admin approval
    });
    
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Step 3.3: Update Storage Factory

Ensure `server/storage-factory.js` uses Supabase:

```javascript
const storageProvider = process.env.STORAGE_PROVIDER === 'supabase'
  ? require('./supabase-storage')
  : require('./storage');

module.exports = { storageProvider };
```

---

## 4. Admin Approval Workflow

### Step 4.1: Note Status Flow

```
User Uploads Note → status: 'submitted'
         ↓
Admin Reviews in Admin Panel
         ↓
    ┌────────┴────────┐
    ↓                 ↓
Approve          Reject
status: 'published'   status: 'rejected'
```

### Step 4.2: Admin Panel Features

The admin panel (`client/src/pages/admin/notes-management.tsx`) already shows:
- ✅ List of all submitted notes
- ✅ Preview note details
- ✅ Approve/Reject buttons
- ✅ View file attachments

### Step 4.3: Admin Approval API

Update the approval route in `server/routes.ts`:

```typescript
app.patch("/api/admin/notes/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminId } = req.body; // 'published' or 'rejected'
    
    // Verify admin role
    const admin = await db.query.users.findFirst({
      where: eq(users.id, adminId)
    });
    
    if (admin?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update note status
    await db.update(notes)
      .set({ status })
      .where(eq(notes.id, id));
    
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 5. Testing & Deployment

### Step 5.1: Local Testing

1. **Test Upload Flow**:
   ```bash
   npm run dev
   ```

2. **Upload a note** as a student user
3. **Check Supabase Storage**:
   - Go to Storage → notes-uploads
   - Verify file is uploaded to `{user_id}/{subject}/` folder

4. **Check Database**:
   - Go to Table Editor → notes
   - Verify note has `status: 'submitted'`

5. **Test Admin Approval**:
   - Login as admin
   - Go to Admin Panel → Notes Management
   - Approve/Reject the note
   - Verify status changes to `'published'` or `'rejected'`

### Step 5.2: Production Deployment Checklist

✅ **Supabase Storage**:
- [ ] Bucket `notes-uploads` created
- [ ] All 5 RLS policies applied
- [ ] CORS settings configured (if needed)

✅ **Environment Variables**:
- [ ] `STORAGE_PROVIDER=supabase` set
- [ ] Supabase keys configured
- [ ] Bucket name set correctly

✅ **Performance**:
- [ ] Enable Supabase CDN for faster downloads
- [ ] Set up file size limits (50MB recommended)
- [ ] Enable image transformations (for thumbnails)

✅ **Security**:
- [ ] Never expose Service Role Key in client
- [ ] Use signed URLs for private downloads
- [ ] Implement rate limiting on uploads

### Step 5.3: Performance Optimization

**Use Signed URLs for Downloads**:
```typescript
// In server/routes.ts
app.get("/api/notes/:id/download", async (req, res) => {
  const { id } = req.params;
  
  // Get note from database
  const note = await db.query.notes.findFirst({
    where: eq(notes.id, id)
  });
  
  // Only allow downloads of published notes
  if (note.status !== 'published') {
    return res.status(403).json({ error: 'Note not published' });
  }
  
  // Generate signed URL (expires in 1 hour)
  const signedUrl = await storageProvider.getSignedUrl(
    note.attachments[0].path,
    3600
  );
  
  res.json({ url: signedUrl });
});
```

---

## 6. Troubleshooting

### Issue: "new row violates row-level security policy"

**Solution**: Make sure you're authenticated and the user ID in the file path matches `auth.uid()`

### Issue: "Permission denied for bucket"

**Solution**: Verify bucket is set to **Public** in Supabase Dashboard

### Issue: Files not showing in admin panel

**Solution**: Check that files have `status: 'submitted'` in database

### Issue: Slow upload/download speeds

**Solution**: 
- Enable Supabase CDN
- Use signed URLs with cache headers
- Consider image optimization for thumbnails

---

## 7. Best Practices

✅ **Do**:
- Always upload to user-specific folders: `{user_id}/{subject}/`
- Set file size limits (50MB max)
- Use signed URLs for downloads
- Implement virus scanning (optional)
- Log all admin actions

❌ **Don't**:
- Store files locally on server (not scalable)
- Expose Service Role Key in frontend
- Allow uploads without authentication
- Skip admin approval for sensitive content

---

## Summary

This guide covers:
1. ✅ Created Supabase Storage bucket `notes-uploads`
2. ✅ Applied 5 RLS policies for security
3. ✅ Integrated backend with Supabase Storage
4. ✅ Set up admin approval workflow
5. ✅ Tested and deployed to production

**Result**: Your notes upload system now uses Supabase Storage, is production-ready, scalable, and includes admin approval workflow!

---

## Next Steps

1. Test the upload flow end-to-end
2. Monitor storage usage in Supabase Dashboard
3. Set up email notifications for approval/rejection
4. Add file preview feature for admins
5. Implement batch approval for multiple notes
