# 🚀 Quick Start: Supabase Integration

## ⏱️ 5-Minute Setup Guide

### What's Already Done ✅

- ✅ Code updated to use Supabase Auth
- ✅ Environment variables configured
- ✅ Database schema SQL file created
- ✅ Login form uses Supabase OAuth
- ✅ Auth callback handler ready
- ✅ User sync endpoint created

### What YOU Need to Do (15 minutes)

---

## Step 1: Get Google Client Secret (2 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on OAuth Client ID: `914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8`
3. Copy the **Client Secret** (looks like `GOCSPX-xxxxxxxxxxxxx`)

---

## Step 2: Run Database Schema (3 minutes)

1. Go to: https://supabase.com/dashboard/project/snzsilepbuglkrjcxdim/sql/new
2. Copy entire contents from `supabase-schema.sql` file
3. Paste and click **RUN**
4. Wait for "Success" message

---

## Step 3: Enable Google OAuth in Supabase (5 minutes)

1. Go to: https://supabase.com/dashboard/project/snzsilepbuglkrjcxdim/auth/providers
2. Find **Google** provider
3. Toggle **Enable** to ON
4. Enter:
   - **Client ID**: `914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com`
   - **Client Secret**: (paste from Step 1)
5. Click **Save**
6. **COPY** the redirect URL shown: `https://snzsilepbuglkrjcxdim.supabase.co/auth/v1/callback`

---

## Step 4: Update Google Cloud Console (3 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth Client ID
3. Under **Authorized redirect URIs**, click **+ ADD URI**
4. Add these two URIs:
   ```
   https://snzsilepbuglkrjcxdim.supabase.co/auth/v1/callback
   http://localhost:5000/auth/callback
   ```
5. Click **SAVE**

---

## Step 5: Test It! (2 minutes)

```bash
# Start your server
npm run dev
```

1. Open: http://localhost:5000/login
2. Select purpose (Download/Upload)
3. Click **"Continue with Google"**
4. Sign in with Google
5. You should be redirected back and logged in! 🎉

---

## Verify Setup

### Check in Supabase Dashboard

1. **Authentication → Users**: See your new user
2. **Table Editor → users**: See your synced user data

### Check in Browser Console

```javascript
// Open browser console and run:
const { data } = await supabase.auth.getSession();
console.log('Logged in as:', data.session?.user?.email);
```

---

## 🐛 Quick Troubleshooting

### "redirect_uri_mismatch"
- Make sure you added the EXACT redirect URI in Google Console
- No trailing slashes!

### User not showing in database
- Check trigger was created: Go to SQL Editor and search for "on_auth_user_created"
- Re-run the schema if needed

### "Authentication Error"
- Check browser console for specific error
- Verify Supabase keys in `.env` file
- Clear browser cache and try again

---

## 📚 Full Documentation

- **Complete Guide**: See `SUPABASE-INTEGRATION-GUIDE.md`
- **Dashboard Setup**: See `SUPABASE-DASHBOARD-SETUP.md`
- **Completion Report**: See `INTEGRATION-COMPLETE.md`

---

## Next Steps After Setup

1. ✅ Test sign out functionality
2. ✅ Test on different browsers
3. ✅ Remove old `@react-oauth/google` package:
   ```bash
   npm uninstall @react-oauth/google
   ```
4. ✅ Deploy to production (update redirect URIs)

---

**Need help?** Check the troubleshooting section in `SUPABASE-DASHBOARD-SETUP.md`

**Estimated time**: 15 minutes total
