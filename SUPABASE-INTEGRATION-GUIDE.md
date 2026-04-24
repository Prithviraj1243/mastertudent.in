# Complete Supabase Integration Guide
## Database + Google Auth with Supabase

---

## 🎯 Current Situation

Your project has:
- ✅ Supabase credentials configured
- ✅ Supabase client setup (server & client)
- ❌ **Problem**: Using custom Google OAuth (not Supabase Auth)
- ❌ **Problem**: Mixed database (SQLite mode enabled but have Supabase DB)

---

## 🚀 Solution: Two Integration Approaches

### **Approach A: Full Supabase (RECOMMENDED)**
✅ Simplest & most maintainable
✅ Supabase handles auth, database, sessions
✅ Built-in security (RLS, JWT)
✅ No server-side session management needed

### **Approach B: Hybrid (Current Approach)**
⚠️ More complex
⚠️ Manual session management
⚠️ You handle auth, Supabase just stores data

---

## 📋 Full Supabase Integration (Approach A)

### Step 1: Configure Supabase Dashboard

1. **Go to Supabase Dashboard**
   - URL: https://snzsilepbuglkrjcxdim.supabase.co
   
2. **Enable Google OAuth**
   - Navigate: `Authentication` → `Providers` → `Google`
   - Toggle: Enable Google
   
3. **Add Google Credentials**
   - Client ID: `914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com`
   - Client Secret: Get from Google Cloud Console
   
4. **Note the Redirect URL**
   - Supabase provides: `https://snzsilepbuglkrjcxdim.supabase.co/auth/v1/callback`

---

### Step 2: Update Google Cloud Console

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com
   - Navigate: `APIs & Services` → `Credentials`
   
2. **Edit OAuth 2.0 Client**
   - Click your Client ID: `914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8`
   
3. **Add Authorized Redirect URIs**
   ```
   https://snzsilepbuglkrjcxdim.supabase.co/auth/v1/callback
   http://localhost:5000/auth/callback
   ```
   
4. **Save Changes**

---

### Step 3: Update Database Schema in Supabase

1. **Create Users Table**
```sql
-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  role TEXT DEFAULT 'student',
  coin_balance INTEGER DEFAULT 0,
  free_downloads_left INTEGER DEFAULT 3,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);
```

2. **Create Notes Table**
```sql
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  class_grade TEXT,
  description TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  topper_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft',
  category_id UUID,
  price INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published notes
CREATE POLICY "Anyone can read published notes" ON notes
  FOR SELECT USING (status = 'published');

-- Policy: Users can create their own notes
CREATE POLICY "Users can create notes" ON notes
  FOR INSERT WITH CHECK (auth.uid()::text = topper_id::text);
```

3. **Sync Auth Users to Users Table (Trigger)**
```sql
-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, profile_image_url, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### Step 4: Update Client-Side Code

**File: `client/src/components/auth/LoginForm.tsx`**

Replace the Google login section with Supabase Auth:

```tsx
// Import Supabase client
import { supabase } from '@/lib/supabase';

// Replace handleGoogleSuccess function with this:
const handleGoogleSignIn = async () => {
  if (!selectedRole) {
    toast({
      title: "Please Select Purpose",
      description: "Choose whether you want to download or upload notes",
      variant: "destructive",
    });
    return;
  }

  try {
    setIsLoading(true);
    
    // Sign in with Google using Supabase
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

    if (error) throw error;

    // Supabase will redirect to Google OAuth
    toast({
      title: "Redirecting to Google...",
      description: "Please complete the sign-in process",
    });

  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    toast({
      title: "Sign-In Failed",
      description: error.message || "Failed to sign in with Google",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

// Update the Google button:
<Button
  type="button"
  variant="outline"
  className="w-full"
  onClick={handleGoogleSignIn}
  disabled={!selectedRole || isLoading}
>
  {isLoading ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : (
    <img
      src="https://www.google.com/favicon.ico"
      alt="Google"
      className="mr-2 h-4 w-4"
    />
  )}
  Continue with Google
</Button>
```

---

### Step 5: Create Auth Callback Handler

**File: `client/src/pages/auth-callback.tsx`**

Update or create this file:

```tsx
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // User is authenticated
          toast({
            title: "Sign-In Successful!",
            description: "Welcome to MasterStudent",
          });

          // Redirect to home or dashboard
          setLocation('/');
        } else {
          throw new Error('No session found');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to complete sign-in",
          variant: "destructive",
        });
        setLocation('/login');
      }
    };

    handleCallback();
  }, [setLocation, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Completing sign-in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}
```

---

### Step 6: Update useAuth Hook

**File: `client/src/hooks/useAuth.ts`**

Update to use Supabase Auth:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}
```

---

### Step 7: Update Server Routes (Optional)

If you want to keep server-side verification:

**File: `server/routes.ts`**

Add Supabase JWT verification:

```typescript
import { supabase } from './supabase';

// Middleware to verify Supabase JWT
async function verifySupabaseAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}

// Use this middleware for protected routes
app.get('/api/protected-route', verifySupabaseAuth, async (req: any, res) => {
  res.json({ message: 'Authenticated!', user: req.user });
});
```

---

### Step 8: Update Environment Variables

**File: `.env`**

```env
# Remove or set to 0 (use Supabase, not SQLite)
USE_SQLITE=0

# Keep Supabase configuration
SUPABASE_URL=https://snzsilepbuglkrjcxdim.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://snzsilepbuglkrjcxdim.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URL (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:prithvi098675@db.snzsilepbuglkrjcxdim.supabase.co:5432/postgres

# Google OAuth (still needed by Supabase)
GOOGLE_CLIENT_ID=914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<get-from-google-cloud-console>
```

---

## 🔧 Testing the Integration

### Test 1: Google Sign-In
```bash
# Start your dev server
npm run dev

# Navigate to login page
# Click "Continue with Google"
# Should redirect to Google OAuth
# After auth, redirect back to /auth/callback
# Then redirect to home page
```

### Test 2: Check Database
```sql
-- Run in Supabase SQL Editor
SELECT * FROM auth.users;
SELECT * FROM users;

-- Should see matched records
```

### Test 3: API Calls with Auth
```typescript
// In your React components
const { data, error } = await supabase
  .from('notes')
  .select('*')
  .eq('status', 'published');
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch"
**Solution**: Add exact redirect URI in Google Cloud Console:
```
https://snzsilepbuglkrjcxdim.supabase.co/auth/v1/callback
```

### Issue 2: User not created in users table
**Solution**: Check if trigger is created:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Issue 3: "Invalid JWT"
**Solution**: Make sure you're passing the token correctly:
```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Pass in API calls
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Issue 4: CORS errors
**Solution**: Supabase handles CORS automatically. If issues persist, check:
1. Supabase Dashboard → Settings → API → URL Configuration
2. Make sure your domain is allowed

---

## 📊 Benefits of Full Supabase Integration

✅ **Automatic Session Management**: No need to manage sessions manually
✅ **Built-in Security**: Row Level Security (RLS) protects data
✅ **Real-time Subscriptions**: Get live updates (bonus feature!)
✅ **Email/Password Auth**: Easy to add later
✅ **Password Reset**: Built-in forgot password flow
✅ **Social Auth**: Add more providers (GitHub, Facebook, etc.)
✅ **JWT Tokens**: Secure, industry-standard authentication
✅ **Refresh Tokens**: Auto-refresh sessions

---

## 🎯 Migration Checklist

- [ ] Enable Google OAuth in Supabase Dashboard
- [ ] Add redirect URIs in Google Cloud Console
- [ ] Create database tables in Supabase
- [ ] Set up auth trigger for user profiles
- [ ] Update LoginForm.tsx with Supabase Auth
- [ ] Create/update auth-callback.tsx
- [ ] Update useAuth.ts hook
- [ ] Update .env (set USE_SQLITE=0)
- [ ] Test Google sign-in flow
- [ ] Verify user creation in database
- [ ] Update protected routes
- [ ] Remove old authentication code

---

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

---

## 🤝 Need Help?

If you encounter any issues during integration:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check browser console for errors
3. Verify environment variables are loaded
4. Test API endpoints with Postman/Thunder Client

---

**Created**: December 2025  
**Status**: Ready for implementation
