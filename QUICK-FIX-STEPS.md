# 🚀 QUICK FIX - 3 Simple Steps

## Your Problem
- ❌ Admin login fails on Render
- ❌ Notes upload says "Please log in" on Render
- ✅ Everything works on localhost

## The Fix (3 Steps - 5 Minutes)

### **STEP 1: Create Admin Account in Database**

1. Go to https://supabase.com/dashboard
2. Select your project → **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Create admin tables and account
CREATE TABLE IF NOT EXISTS admin_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_account_id TEXT REFERENCES admin_accounts(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO admin_accounts (username, password, email, full_name, is_active)
VALUES (
  'admin',
  '$2b$10$HWm9U5youDqXuipSZCbJGum3KxRgF7x2STrIh13X2wpYFLFHTeDpW',
  'admin@masterstudent.com',
  'System Administrator',
  true
)
ON CONFLICT (username) DO UPDATE
SET password = '$2b$10$HWm9U5youDqXuipSZCbJGum3KxRgF7x2STrIh13X2wpYFLFHTeDpW';
```

4. Click **RUN**
5. Should see: "Success. No rows returned"

---

### **STEP 2: Set Environment Variables on Render**

1. Go to https://dashboard.render.com
2. Click your **masterstudent** service
3. Go to **Environment** tab
4. Add/Update these variables:

```bash
VITE_SUPABASE_URL=https://snzsilepbuglkrjcxdim.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuenNpbGVwYnVnbGtyamN4ZGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTc2MzAsImV4cCI6MjA4MjMzMzYzMH0.P8jg0dg17cMn3oS3xX0AcoR2rC9vNV6h8y64S-PM4Fg
SESSION_SECRET=a_random_secret_key_min_32_characters_long_change_this
```

5. Click **Save Changes**

---

### **STEP 3: Configure Supabase URLs**

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL:** Add your Render URL
   ```
   https://your-app.onrender.com
   ```
3. **Redirect URLs:** Add these
   ```
   https://your-app.onrender.com/**
   http://localhost:5000/**
   ```
4. Click **Save**

---

## 🎯 Test It!

### Test 1: User Login & Upload (On Render)
1. Go to your deployed site
2. Click **Sign in with Google**
3. After login, go to **Upload Notes**
4. Fill form and upload a file
5. ✅ Should work!

### Test 2: Admin Login (On Render)
1. Go to `/admin-login`
2. Username: `admin`
3. Password: `admin123`
4. ✅ Should login and show dashboard!

---

## 🔧 Still Not Working?

### If user login fails:
- Clear browser cache and cookies
- Check browser console for errors
- Make sure you set `VITE_SUPABASE_URL` (with VITE_ prefix!)

### If admin login fails:
- Run this SQL to check admin exists:
  ```sql
  SELECT * FROM admin_accounts WHERE username = 'admin';
  ```
- Make sure `SESSION_SECRET` is set on Render
- Check Render logs for errors

---

## 📝 Important Notes

- **Admin credentials:** `admin` / `admin123` (change in production!)
- **User login:** Must use Google OAuth (not email/password)
- **Session secret:** Must be 32+ characters
- **VITE_ prefix:** Required for frontend environment variables

---

## ✅ Success Checklist

- [ ] SQL script ran successfully in Supabase
- [ ] All environment variables set on Render
- [ ] Supabase URLs configured
- [ ] Redeployed on Render
- [ ] User can login with Google
- [ ] User can upload notes
- [ ] Admin can login

---

**Need more help?** Check `RENDER-AUTH-FIX.md` for detailed troubleshooting!
