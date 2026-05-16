# 🚀 Quick Test Guide - Admin Panel

## Test the Complete Flow (5 minutes)

### Step 1: Start the Server
```bash
npm start
```

### Step 2: Create Test User (if needed)
1. Go to: `http://localhost:5000`
2. Sign up with Google or email
3. Note down the user email

### Step 3: Upload a Note as User
1. Navigate to `/upload-notes`
2. Fill in the form:
   - Title: "Test Physics Notes"
   - Subject: Physics
   - Topic: "Mechanics"
   - Description: "Test content for admin review"
   - Upload a PDF file
3. Click "Upload"
4. **✅ Check:** You should get +20 coins immediately!

### Step 4: Access Admin Panel
1. Navigate to: `/admin` or `/admin/notes`
2. Login with admin credentials:
   - Username: `admin`
   - Password: `admin123`

### Step 5: Review the Note
1. **✅ Check:** Your uploaded note appears in "Pending Review"
2. Click **"View"** to see details
3. Review the attachments and content

### Step 6: Approve the Note
1. Click **"Approve & Award 20 Coins"**
2. **✅ Check:** Success message appears
3. **✅ Check:** User gets +20 more coins (40 total!)
4. **✅ Check:** Note status changes to "approved"

### Step 7: Verify Real-Time Updates
1. Open admin panel in one browser tab
2. Upload another note from a different tab
3. **✅ Check:** New note appears instantly in admin panel
4. **✅ Check:** Toast notification shows "New Note Submitted"

### Step 8: Test Rejection (Optional)
1. Upload another test note
2. In admin panel, click **"View"** then **"Reject"**
3. Enter reason: "Test rejection"
4. **✅ Check:** User gets notification with reason
5. **✅ Check:** Note status changes to "rejected"

## ✅ Success Criteria

All of these should work:
- [x] User gets 20 coins on upload
- [x] Note appears in admin panel
- [x] Real-time updates work
- [x] Approve button awards 20 coins
- [x] Total = 40 coins for approved notes
- [x] Reject sends notification
- [x] Search and filters work
- [x] Stats update automatically

## 🎉 You're Done!

Your admin panel is **fully functional** and integrated with Supabase!
