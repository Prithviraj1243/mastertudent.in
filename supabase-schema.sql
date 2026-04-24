-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- Dashboard: https://snzsilepbuglkrjcxdim.supabase.co
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'topper', 'admin')),
  coin_balance INTEGER DEFAULT 0,
  free_downloads_left INTEGER DEFAULT 3,
  last_free_download_reset DATE DEFAULT CURRENT_DATE,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  onboarding_completed BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  class_grade TEXT,
  description TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  topper_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'published', 'rejected')),
  category_id UUID,
  price INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policies for notes table
CREATE POLICY "Anyone can read published notes" ON notes
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can create notes" ON notes
  FOR INSERT WITH CHECK (auth.uid()::text = topper_id::text);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid()::text = topper_id::text);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid()::text = topper_id::text);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  renewal_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  gateway TEXT CHECK (gateway IN ('stripe', 'dodo', 'razorpay')),
  gateway_customer_id TEXT,
  gateway_sub_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid()::text = student_id::text);

-- ============================================
-- DOWNLOADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, note_id)
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own downloads" ON downloads
  FOR SELECT USING (auth.uid()::text = student_id::text);

CREATE POLICY "Users can insert downloads" ON downloads
  FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);

-- ============================================
-- TRANSACTIONS TABLE (Coin History)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_change INTEGER NOT NULL,
  related_note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- ============================================
-- FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, student_id)
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feedback" ON feedback FOR SELECT USING (true);
CREATE POLICY "Users can create feedback" ON feedback 
  FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);

-- ============================================
-- USER ACTIVITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activity" ON user_activity
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- ============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    profile_image_url,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_topper_id ON notes(topper_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes(subject);
CREATE INDEX IF NOT EXISTS idx_downloads_student_id ON downloads(student_id);
CREATE INDEX IF NOT EXISTS idx_downloads_note_id ON downloads(note_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_student_id ON subscriptions(student_id);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Enable Google OAuth in Supabase Dashboard';
  RAISE NOTICE '2. Update Google Cloud Console redirect URIs';
  RAISE NOTICE '3. Test authentication flow';
END $$;
