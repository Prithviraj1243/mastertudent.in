# 🔍 Google OAuth Debugging Guide

## Issue Fixed

**Problem**: Google OAuth button click doesn't redirect to Google sign-in page

**Root Cause**: `setIsLoading(false)` in finally block was preventing the redirect

**Solution**: Removed finally block and only reset loading state on error

---

## ✅ What Was Fixed

### Before (Buggy Code):
```tsx
const handleGoogleSignIn = async () => {
  try {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({...});
    if (error) throw error;
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);  // ❌ This prevents redirect!
  }
};
```

### After (Fixed Code):
```tsx
const handleGoogleSignIn = async () => {
  try {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({...});
    
    if (error) {
      setIsLoading(false);  // ✅ Only reset on error
      throw error;
    }
    
    // If success, redirect happens automatically
    // Don't reset loading state!
    
  } catch (error) {
    setIsLoading(false);  // ✅ Reset on error
    // Show error toast
  }
};
```

---

## 🧪 How to Test

### 1. Open Browser Console
```
F12 → Console tab
```

### 2. Open Your App
```
http://localhost:8000
```

### 3. Click "Continue with Google"

You should see these console logs:
```
🚀 Starting Supabase Google OAuth flow...
📍 Current origin: http://localhost:8000
🔄 Redirect URL: http://localhost:8000/auth/callback
💾 Stored role in localStorage: student
📦 OAuth response data: {provider: 'google', url: 'https://...'}
❌ OAuth response error: null
✅ OAuth initiated, waiting for redirect...
```

### 4. Expected Flow
```
1. Loading spinner appears ✅
2. Browser redirects to Google sign-in ✅
3. User signs in with Google ✅
4. Browser redirects to /auth/callback ✅
5. User logged in and redirected to home ✅
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Failed to sign in with Google"

**Console Error**: 
```
OAuth Error: {message: 'Invalid redirect URL'}
```

**Solution**: Add redirect URLs in Supabase Dashboard
1. Go to: https://snzsilepbuglkrjcxdim.supabase.co
2. Authentication → URL Configuration
3. Add: `http://localhost:8000/auth/callback`
4. Save

---

### Issue 2: Button Click Does Nothing

**Console Shows**: No logs at all

**Possible Causes**:
1. JavaScript error preventing execution
2. Button disabled
3. Event listener not attached

**Debug Steps**:
```javascript
// In browser console, test directly:
const { supabase } = await import('/src/lib/supabase.ts');
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
console.log('Data:', data, 'Error:', error);
```

---

### Issue 3: "Provider not enabled"

**Console Error**:
```
OAuth Error: {message: 'Provider google is disabled'}
```

**Solution**: Enable Google provider in Supabase
1. Go to: https://snzsilepbuglkrjcxdim.supabase.co
2. Authentication → Providers
3. Find "Google" and toggle ON
4. Add Google OAuth credentials (if required)
5. Save

---

### Issue 4: Redirect Happens But Returns to Login

**Symptoms**: Redirects to Google, signs in, redirects back, but still on login page

**Cause**: auth-callback.tsx not handling session properly

**Solution**: Check auth-callback.tsx logs
```
🔍 AUTH CALLBACK STARTED
📍 Current URL: http://localhost:8000/auth/callback?code=...
🔄 Handling OAuth callback with PKCE flow...
📦 Session data: {access_token: '...', user: {...}}
✅ Setting sessionStorage with user data
💾 SessionStorage set successfully
🚀 Redirecting to home
```

If no logs appear, route might not be configured.

---

### Issue 5: "Network Error" or CORS Issue

**Console Error**:
```
Access to fetch at 'https://snzsilepbuglkrjcxdim.supabase.co' has been blocked by CORS
```

**Solution**: Check Supabase CORS settings
1. Supabase Dashboard → Settings → API
2. Add allowed origins:
   - `http://localhost:8000`
   - `http://localhost:5173`
3. Save

---

## 📊 OAuth Flow Diagram

```
┌─────────────────────┐
│  User Clicks Button │
│  "Continue with     │
│      Google"        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   setIsLoading(true)│
│   Store role in     │
│   localStorage      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ supabase.auth       │
│ .signInWithOAuth()  │
└──────────┬──────────┘
           │
           ├─── Error? ──→ Reset loading, show toast ❌
           │
           ▼ Success
┌─────────────────────┐
│ Browser redirects   │
│ to Google OAuth     │
│ (DON'T reset loading│
│  - we're leaving!)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Google Sign-In    │
│       Page          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Google redirects to │
│  /auth/callback     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ AuthCallback.tsx    │
│ handles session     │
│ syncs with backend  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  User logged in &   │
│  redirected to home │
└─────────────────────┘
```

---

## 🎯 Testing Checklist

After the fix, test these scenarios:

- [ ] Click Google button (with role selected)
- [ ] Verify console logs appear
- [ ] Verify redirect to Google happens
- [ ] Sign in with Google account
- [ ] Verify redirect back to /auth/callback
- [ ] Verify user logged in (check sessionStorage)
- [ ] Verify redirect to home page
- [ ] Check user appears in database
- [ ] Test with "student" role
- [ ] Test with "topper" role
- [ ] Test error handling (disable Google provider)
- [ ] Test without selecting role (should show error)

---

## 🔧 Debug Commands

### Check Supabase Connection
```javascript
// In browser console
const { supabase } = await import('/src/lib/supabase.ts');
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data, 'Error:', error);
```

### Check Supabase Configuration
```javascript
// In browser console
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### Check localStorage
```javascript
// In browser console
console.log('Pending Role:', localStorage.getItem('pendingUserRole'));
console.log('Auth User:', sessionStorage.getItem('authUser'));
```

### Test OAuth Manually
```javascript
// In browser console
const { createClient } = await import('@supabase/supabase-js');
const client = createClient(
  'https://snzsilepbuglkrjcxdim.supabase.co',
  'your-anon-key'
);

const { data, error } = await client.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});

console.log('Result:', { data, error });
```

---

## 📚 Additional Resources

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth/social-login/auth-google
- **OAuth PKCE Flow**: https://supabase.com/docs/guides/auth/auth-deep-dive/auth-flows
- **Debugging Supabase**: https://supabase.com/docs/guides/auth/debugging

---

## ✅ Expected Result

After implementing the fix:

1. ✅ Google OAuth button works
2. ✅ Redirects to Google sign-in
3. ✅ User can sign in with Google
4. ✅ Redirects back to app
5. ✅ User logged in successfully
6. ✅ No more "loading forever" bug
7. ✅ Proper error handling if OAuth fails

---

## 🎉 Summary

**What Changed**:
- Removed `finally` block that was resetting loading state
- Only reset `isLoading` on error
- Added detailed console logging
- Improved error messages

**Why It Works**:
- When OAuth succeeds, browser redirects immediately
- We don't need to reset loading state before redirect
- If OAuth fails, we properly handle error and reset state

**Testing**:
- Open browser console
- Click "Continue with Google"
- Watch console logs
- Verify redirect works!
