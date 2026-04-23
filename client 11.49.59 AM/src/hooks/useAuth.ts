import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  profileImageUrl?: string;
  onboardingCompleted?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Supabase session found:', session.user.email);
          setSupabaseUser(session.user);
          
          // Sync Supabase user with backend session
          try {
            const syncResponse = await fetch('/api/auth/sync-supabase-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                email: session.user.email,
                firstName: session.user.user_metadata?.given_name || session.user.email?.split('@')[0],
                lastName: session.user.user_metadata?.family_name || '',
                profileImageUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
                role: 'student',
                supabaseUserId: session.user.id,
              }),
            });

            if (syncResponse.ok) {
              const syncData = await syncResponse.json();
              console.log('Backend session synced:', syncData.user);
              
              const authUser: AuthUser = {
                id: syncData.user.id,
                email: syncData.user.email,
                firstName: session.user.user_metadata?.given_name || session.user.email?.split('@')[0],
                lastName: session.user.user_metadata?.family_name || '',
                profileImageUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
                role: syncData.user.role || 'student',
                onboardingCompleted: true,
              };
              setUser(authUser);
              sessionStorage.setItem('authUser', JSON.stringify(authUser));
            } else {
              console.error('Failed to sync with backend');
            }
          } catch (syncError) {
            console.error('Error syncing with backend:', syncError);
            // Fallback to local user data
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              firstName: session.user.user_metadata?.given_name || session.user.email?.split('@')[0],
              lastName: session.user.user_metadata?.family_name || '',
              profileImageUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
              role: 'student',
              onboardingCompleted: true,
            };
            setUser(authUser);
            sessionStorage.setItem('authUser', JSON.stringify(authUser));
          }
        } else {
          console.log('No Supabase session found');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setSupabaseUser(session.user);
        
        // Sync with backend on sign in
        try {
          const syncResponse = await fetch('/api/auth/sync-supabase-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              email: session.user.email,
              firstName: session.user.user_metadata?.given_name || session.user.email?.split('@')[0],
              lastName: session.user.user_metadata?.family_name || '',
              profileImageUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
              role: 'student',
              supabaseUserId: session.user.id,
            }),
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            const authUser: AuthUser = {
              id: syncData.user.id,
              email: syncData.user.email,
              firstName: session.user.user_metadata?.given_name || session.user.email?.split('@')[0],
              lastName: session.user.user_metadata?.family_name || '',
              profileImageUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
              role: syncData.user.role || 'student',
              onboardingCompleted: true,
            };
            setUser(authUser);
            sessionStorage.setItem('authUser', JSON.stringify(authUser));
          }
        } catch (syncError) {
          console.error('Error syncing on sign in:', syncError);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSupabaseUser(null);
        sessionStorage.removeItem('authUser');
        sessionStorage.removeItem('directAuth');
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('userName');
        
        // Clear backend session
        try {
          await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Error clearing backend session:', error);
        }
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
      sessionStorage.clear();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refetch = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setSupabaseUser(session.user);
      const storedUser = sessionStorage.getItem('authUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  };

  return {
    user,
    supabaseUser,
    isLoading: loading,
    isAuthenticated: !!user && !!supabaseUser,
    signOut,
    refetch,
  };
}
