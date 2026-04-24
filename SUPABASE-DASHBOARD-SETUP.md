# Supabase Dashboard Setup Instructions

## 🎯 Complete Setup Guide for Supabase + Google Auth Integration

---

## Prerequisites

✅ Supabase project created: `snzsilepbuglkrjcxdim.supabase.co`  
✅ Google OAuth Client ID: `914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8`  
✅ Code updated with Supabase Auth integration

---

## Step 1: Run Database Schema in Supabase

### 1.1 Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/snzsilepbuglkrjcxdim
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### 1.2 Execute Schema

1. Open the file `supabase-schema.sql` from your project root
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **RUN** button (or press Ctrl/Cmd + Enter)
5. Wait for success message: "Success. No rows returned"

### 1.3 Verify Tables Created

1. Click on **Table Editor** in left sidebar
2. You should see these tables:
   - ✅ users
   - ✅ notes
   - ✅ subscriptions
   - ✅ downloads
   - ✅ transactions
   - ✅ feedback
   - ✅ user_activity

---

## Step 2: Enable Google OAuth in Supabase

### 2.1 Navigate to Authentication Settings

1. Click **Authentication** in left sidebar
2. Click **Providers** tab
3. Scroll down and find **Google**

### 2.2 Enable Google Provider

1. Toggle **Enable Sign in with Google** to ON
2. You'll see a form with these fields:
   - **Client ID (for OAuth)**
   - **Client Secret (for OAuth)**
   - **Authorized Client IDs** (optional)

### 2.3 Get Google Client Secret

⚠️ **IMPORTANT**: You need to get the Client Secret from Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8`
3. Click on it to open details
4. You'll see:
   - Client ID: `914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com`
   - Client secret: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx` (copy this!)

### 2.4 Enter Credentials in Supabase

1. **Client ID**: `914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com`
2. **Client Secret**: Paste the secret you copied from Google Console
3. Click **Save**

### 2.5 Copy Redirect URL

After saving, Supabase will show you the **Callback URL (Redirect URI)**:

```
https://snzsilepbuglkrjcxdim.supabase.co/auth/v1/callback
```

📋 **Copy this URL** - you'll need it for the next step!

---

## Step 3: Update Google Cloud Console

### 3.1 Add Supabase Redirect URI

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Scroll to **Authorized redirect URIs**
4. Click **+ ADD URI**
5. Add these URIs:

   ```
   https://snzsilepbuglkrjcxdim.supabase.co/auth/v1/callback
   http://localhost:5000/auth/callback
   ```

6. Click **SAVE**

### 3.2 Verify Authorized JavaScript Origins

Make sure these are in **Authorized JavaScript origins**:

```
http://localhost:5000
http://localhost:8000
https://your-production-domain.com (when you deploy)
```

---

## Step 4: Configure Row Level Security (RLS)

The schema already includes RLS policies, but let's verify:

### 4.1 Check RLS Status

1. Go to **Authentication** → **Policies**
2. Select the **users** table
3. You should see policies like:
   - ✅ "Users can read own data"
   - ✅ "Users can update own data"
   - ✅ "Allow insert for authenticated users"

### 4.2 Test RLS (Optional)

Run this in SQL Editor to test:

```sql
-- This should return your policies
SELECT * FROM pg_policies WHERE tablename = 'users';
```

---

## Step 5: Test the Integration

### 5.1 Start Your Development Server

```bash
npm run dev
```

### 5.2 Test Google Sign-In Flow

1. Go to: http://localhost:5000/login
2. Select your purpose (Download or Upload notes)
3. Click **"Continue with Google"** button
4. Should redirect to Google OAuth consent screen
5. Select your Google account
6. Should redirect back to `/auth/callback`
7. Should redirect to home page with you logged in

### 5.3 Verify in Supabase Dashboard

1. Go to **Authentication** → **Users**
2. You should see your new user!
3. Click on the user to see details
4. Note the **User UID** (this is used as ID in your app)

### 5.4 Verify in Database

Run this in SQL Editor:

```sql
-- Check auth.users table
SELECT id, email, created_at FROM auth.users;

-- Check your users table (should auto-sync via trigger)
SELECT id, email, first_name, last_name FROM users;
```

Both tables should have matching records!

---

## Step 6: Environment Variables Check

Make sure your `.env` file has:

```env
# Database - Use Supabase PostgreSQL
USE_SQLITE=0

# Supabase Configuration
SUPABASE_URL=https://snzsilepbuglkrjcxdim.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://snzsilepbuglkrjcxdim.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URL
DATABASE_URL=postgresql://postgres:prithvi098675@db.snzsilepbuglkrjcxdim.supabase.co:5432/postgres

# Google OAuth
GOOGLE_CLIENT_ID=914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com
```

---

## Step 7: Troubleshooting Common Issues

### Issue 1: "redirect_uri_mismatch" Error

**Problem**: Google OAuth shows this error

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Verify the exact redirect URI is added:
   ```
   https://snzsilepbuglkrjcxdim.supabase.co/auth/v1/callback
   ```
3. No trailing slashes, exact match required
4. Wait 5 minutes for Google to propagate changes

### Issue 2: User Not Created in Database

**Problem**: User shows in auth.users but not in public.users table

**Solution**:
1. Check if trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. If missing, run the trigger creation from `supabase-schema.sql`
3. Manually insert test:
   ```sql
   INSERT INTO users (id, email, first_name) 
   VALUES (auth.uid(), 'test@example.com', 'Test');
   ```

### Issue 3: "Invalid JWT" or Session Errors

**Problem**: Can't maintain session, keeps logging out

**Solution**:
1. Check browser console for errors
2. Verify Supabase URL and keys in `.env`
3. Clear browser cache and localStorage
4. Make sure `localStorage` and `sessionStorage` work in browser
5. Check if `PKCE` flow is enabled in Supabase client config

### Issue 4: CORS Errors

**Problem**: Browser blocks requests to Supabase

**Solution**:
1. Go to Supabase Dashboard → Settings → API
2. Check **CORS Settings**
3. Add your development domain: `http://localhost:5000`
4. Supabase usually allows all origins by default for anon key

### Issue 5: Can't Get Client Secret from Google

**Problem**: Don't see client secret in Google Console

**Solution**:
1. You may need to create a NEW OAuth 2.0 Client ID
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Add authorized URIs as shown in Step 3
5. Download JSON and save the client secret securely

---

## Step 8: Security Best Practices

### 8.1 Enable Email Confirmation (Optional)

1. Go to **Authentication** → **Email Templates**
2. Enable **Confirm signup** email
3. Customize the email template

### 8.2 Set Up Session Limits

1. Go to **Authentication** → **Settings**
2. Set **JWT expiry limit**: 3600 (1 hour)
3. Enable **Refresh Token Rotation**

### 8.3 Add Additional OAuth Providers (Optional)

You can easily add more providers:
- GitHub
- Facebook
- Twitter
- Microsoft
- Apple

Just follow the same process as Google!

---

## Step 9: Monitor Authentication

### 9.1 View Auth Logs

1. Go to **Logs** → **Auth Logs**
2. You'll see all sign-in attempts, errors, and events
3. Filter by:
   - Event type (login, signup, logout)
   - Status (success, error)
   - Time range

### 9.2 Check User Growth

1. Go to **Authentication** → **Users**
2. See total user count
3. Export users as CSV if needed

---

## 🎉 Integration Complete!

You now have:

✅ **Supabase Database** with proper schema and RLS  
✅ **Google OAuth** fully integrated with Supabase Auth  
✅ **Automatic user syncing** between auth.users and public.users  
✅ **Session management** handled by Supabase  
✅ **Secure authentication** with JWT tokens  

---

## Quick Reference Commands

### Check Supabase Connection
```bash
# In your project
npm run dev

# Open browser console and run:
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data);
```

### Manual User Sync
```sql
-- If user didn't sync automatically
INSERT INTO public.users (id, email, first_name, last_name, profile_image_url)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'given_name',
  raw_user_meta_data->>'family_name',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id = 'USER_UUID_HERE'
ON CONFLICT (id) DO NOTHING;
```

### Reset User Password (via email)
```typescript
// In your app
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  { redirectTo: 'http://localhost:5000/reset-password' }
);
```

---

## Next Steps

1. ✅ Complete the setup steps above
2. 🧪 Test sign-in with your Google account
3. 📱 Test on mobile (responsive design)
4. 🚀 Deploy to production (update redirect URIs)
5. 📊 Monitor user growth in Supabase Dashboard

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Project Support: Check your project documentation

---

**Last Updated**: December 2025  
**Integration Status**: ✅ Ready to Deploy
