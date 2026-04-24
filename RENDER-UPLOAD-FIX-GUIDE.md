# 🔧 Fix Upload Issue on Render - Simple Guide

## ❌ **The Problem**
Your notes upload works locally but fails on Render because:
1. **Render doesn't have persistent file storage** - Files in `uploads/` folder disappear
2. Multer tries to save files temporarily before uploading to Supabase
3. On Render, this temporary folder doesn't work properly

## ✅ **The Solution (Already Applied)**
I've already fixed your code! The changes made:
- Changed multer to use `/tmp/uploads` in production (Render)
- Added automatic directory creation
- Files are cleaned up after upload to Supabase

## 🚀 **What You Need to Do on Render**

### **Step 1: Set Environment Variables**
Go to your Render dashboard → Your service → Environment tab and verify these are set:

```
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET_NAME=notes
DATABASE_URL=your_postgres_url
```

**Important:** Make sure `SUPABASE_SERVICE_ROLE_KEY` is the **service role key** (not anon key)!

### **Step 2: Check Supabase Storage Bucket**
1. Go to Supabase Dashboard → Storage
2. Make sure you have a bucket named `notes`
3. Click on the bucket → Policies
4. Make sure these policies exist:

**Allow Authenticated Uploads:**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'notes');
```

**Allow Public Access:**
```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'notes');
```

### **Step 3: Deploy the Fix**
Since I've already modified your code:

1. **Commit the changes:**
   ```bash
   git add server/routes.ts
   git commit -m "Fix file upload for Render deployment"
   git push origin main
   ```

2. **Render will auto-deploy** (or manually trigger deployment)

3. **Wait for deployment to complete** (~2-3 minutes)

### **Step 4: Test Upload**
1. Go to: `https://mastertudent-in-1.onrender.com`
2. Login as a user
3. Try uploading a note with a file
4. Check Render logs for any errors
5. Check Supabase Storage → notes bucket to see if files appear

## 🔍 **Debugging Steps**

### **Check Render Logs:**
```bash
# In your Render dashboard → Logs tab
# Look for these messages:
✅ "📤 Uploading files to Supabase Storage..."
✅ "✅ Files uploaded to Supabase: 1"
❌ "❌ Upload failures:" (if this appears, there's an issue)
```

### **Common Issues & Fixes:**

**1. "ENOENT: no such file or directory"**
- ✅ Fixed! The code now creates `/tmp/uploads` automatically

**2. "Upload failures: Unauthorized"**
- ❌ Wrong Supabase key → Use **service_role** key, not anon key
- Check: Render Environment Variables

**3. "Bucket not found"**
- ❌ Bucket doesn't exist in Supabase
- Fix: Create bucket named `notes` in Supabase Storage

**4. "Files upload but don't show in admin"**
- ✅ This is normal - Admin needs to approve them first
- Check: Admin Panel → Notes Management

## 📝 **What Changed in the Code**

**Before (Local only):**
```typescript
const upload = multer({
  dest: "uploads/",  // ❌ Doesn't work on Render
  ...
});
```

**After (Works on Render):**
```typescript
const uploadDir = process.env.NODE_ENV === 'production' 
  ? '/tmp/uploads'   // ✅ Works on Render
  : 'uploads/';      // ✅ Works locally

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  ...
});
```

**File cleanup (already in your code):**
```typescript
// After uploading to Supabase, delete temp files
files.forEach(file => {
  try {
    fs.unlinkSync(file.path);  // Delete temp file
  } catch (err) {
    console.error('Error deleting temp file:', err);
  }
});
```

## 🎯 **Upload Flow**

1. User selects file → Frontend sends to `/api/notes`
2. Multer saves to `/tmp/uploads/xyz123` (temporary)
3. Server reads file and uploads to **Supabase Storage**
4. Server deletes temp file from `/tmp/uploads/`
5. Server saves note metadata to **PostgreSQL** with Supabase URL
6. Admin approves → Students can download

## ✅ **Success Checklist**

- [ ] Environment variables set on Render
- [ ] Supabase bucket `notes` exists
- [ ] Storage policies configured
- [ ] Code changes pushed to Git
- [ ] Render deployment successful
- [ ] Test upload works
- [ ] Files visible in Supabase Storage
- [ ] Notes appear in Admin Panel for approval

## 🆘 **Still Not Working?**

Send me the **Render logs** from when you try to upload. Look for:
- Any error messages with ❌
- The line that says "📤 Uploading files to Supabase Storage..."
- Any "Upload failures" messages

---

**Need help?** Share your Render logs and I'll debug it with you! 🚀
