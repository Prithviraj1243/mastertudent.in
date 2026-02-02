# 🔐 Google OAuth Not Working - Complete Fix Guide

## Issue

When clicking "Continue with Google" button, the page doesn't redirect or shows an error.

---

## Root Cause

The Google OAuth redirect URL is not configured in your Supabase Dashboard. Supabase needs to know which URLs are allowed to receive OAuth callbacks.

---

## ✅ Step-by-Step Fix

### Step 1: Configure Supabase Redirect URLs

1. **Go to Supabase Dashboard**:
   ```
   https://snzsilepbuglkrjcxdim.supabase.co
   ```

2. **Navigate to Authentication**:
   - Click "Authentication" in left sidebar
   - Click "URL Configuration"

3. **Add Redirect URLs** (click "+ Add URL" for each):
   ```
   http://localhost:8000/auth/callback
   http://localhost:5173/auth/callback
   https://yourdomain.com/auth/callback
   ```

4. **Add Site URLs**:
   ```
   http://localhost:8000
   http://localhost:5173
   https://yourdomain.com
   ```

5. **Click "Save"**

---

### Step 2: Enable Google Provider

1. Still in **Authentication** → **Providers**
2. Find **Google** in the list
3. Toggle it **ON** (enabled)
4. You may need to add Google OAuth credentials:
   - **Client ID**: (From Google Cloud Console)
   - **Client Secret**: (From Google Cloud Console)
5. Click **Save**

---

### Step 3: Test Google OAuth

1. **Restart your server**:
   ```bash
   npm run dev
   ```

2. **Open browser**: http://localhost:8000

3. **Login Page**:
   - Select role (Student or Topper)
   - Click "Continue with Google"

4. **Expected Flow**:
   - Redirects to Google sign-in page ✅
   - User signs in with Google ✅
   - Redirects back to `/auth/callback` ✅
   - User logged in and redirected to home ✅

---

## 🔍 Common Errors & Solutions

### Error: "Invalid redirect URL"

**Cause**: Redirect URL not added to Supabase dashboard

**Solution**: 
1. Add all redirect URLs in Supabase Authentication → URL Configuration
2. Make sure URLs match exactly (including protocol: http/https)

---

### Error: "Google provider not enabled"

**Cause**: Google OAuth provider not enabled in Supabase

**Solution**:
1. Go to Authentication → Providers
2. Enable Google provider
3. Add Google OAuth credentials (if required)

---

### Error: "Authorization failed" or blank page

**Cause**: Google OAuth credentials missing or incorrect

**Solution**:
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - https://snzsilepbuglkrjcxdim.supabase.co/auth/v1/callback
4. Copy Client ID and Client Secret to Supabase

---

### Error: "Session not found" after redirect

**Cause**: Cookie/session storage issue

**Solution**:
1. Clear browser cookies and localStorage
2. Make sure third-party cookies are enabled
3. Try in incognito mode

---

## 🎯 Current Implementation Details

### LoginForm.tsx (Line 42-51)
```tsx
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});
```

### Auth Callback Page (auth-callback.tsx)
```tsx
// Handles OAuth redirect
const { data: { session }, error } = await supabase.auth.getSession();

if (session && session.user) {
  // User logged in successfully
  // Sync with backend
  // Redirect to home
}
```

### App.tsx Route
```tsx
<Route path="/auth/callback" component={AuthCallback} />
```

---

## 📊 OAuth Flow Diagram

```
┌─────────────────┐
│   User Clicks   │
│ "Continue with  │
│     Google"     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase Auth  │
│ Redirects to    │
│     Google      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google Sign-In │
│      Page       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Signs In   │
│  with Google    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Google Redirects│
│  back to:       │
│ /auth/callback  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AuthCallback.tsx│
│ Gets session    │
│ Syncs with DB   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redirect to     │
│   Home Page     │
└─────────────────┘
```

---

## 🧪 Testing Checklist

After configuration:

- [ ] Restart server
- [ ] Open login page
- [ ] Select role (Student/Topper)
- [ ] Click "Continue with Google"
- [ ] Verify redirect to Google sign-in
- [ ] Sign in with Google account
- [ ] Verify redirect back to app
- [ ] Verify user is logged in
- [ ] Check sessionStorage has user data
- [ ] Verify user appears in database

---

## 🔐 Alternative: Use Server-Side Google OAuth

If Supabase OAuth doesn't work, you can use the existing server-side Google OAuth:

### Backend Already Has:
- `POST /api/auth/google` (Line 305 in replitAuth.ts)
- Google OAuth2Client configured
- JWT verification

### Frontend Would Need:
1. Load Google Sign-In script
2. Get Google credential
3. Send to backend API
4. Backend verifies and creates session

This is more complex but doesn't depend on Supabase OAuth configuration.

---

## 📚 Useful Links

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Google OAuth Setup**: https://support.google.com/cloud/answer/6158849
- **Supabase OAuth Guide**: https://supabase.com/docs/guides/auth/social-login/auth-google

---

## 🎯 Summary

**Problem**: Google OAuth redirect not working

**Root Cause**: Redirect URLs not configured in Supabase

**Solution**:
1. Add redirect URLs to Supabase Authentication settings
2. Enable Google provider
3. Test the flow

**Expected Result**: Google OAuth works seamlessly!

---

## 💡 Pro Tips

1. **Always use HTTPS in production** - OAuth providers require it
2. **Test in incognito mode** - Avoids cookie/cache issues
3. **Check browser console** - Shows detailed error messages
4. **Enable third-party cookies** - Required for OAuth flows
5. **Use exact URL matches** - Even trailing slashes matter

---

## ✅ After Fix

Once configured correctly:
- ✅ Google sign-in works instantly
- ✅ No database SSL errors (bypassed during OAuth)
- ✅ User profile auto-filled from Google
- ✅ Seamless authentication experience
