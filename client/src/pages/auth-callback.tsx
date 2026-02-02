import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔍 AUTH CALLBACK STARTED');
      console.log('📍 Current URL:', window.location.href);
      
      try {
        // Import Supabase client
        const { supabase } = await import('@/lib/supabase');
        
        console.log('🔄 Handling OAuth callback with PKCE flow...');
        
        // Supabase automatically handles the OAuth callback with PKCE
        // Just get the session after the redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📦 Session data:', session);
        console.log('❌ Session error:', error);

        if (session && session.user) {
          const googleUser = session.user;
          
          // Create user object for sessionStorage
          const userData = {
            id: googleUser.id,
            email: googleUser.email || '',
            firstName: googleUser.user_metadata?.given_name || googleUser.email?.split('@')[0] || 'User',
            lastName: googleUser.user_metadata?.family_name || '',
            role: 'student',
            profileImageUrl: googleUser.user_metadata?.avatar_url || googleUser.user_metadata?.picture || '',
            onboardingCompleted: false,
          };

          // Set authentication in sessionStorage FIRST
          console.log('✅ Setting sessionStorage with user data:', userData);
          sessionStorage.setItem('directAuth', 'true');
          sessionStorage.setItem('userEmail', googleUser.email || '');
          sessionStorage.setItem('userName', googleUser.user_metadata?.full_name || googleUser.email || '');
          sessionStorage.setItem('authUser', JSON.stringify(userData));
          console.log('💾 SessionStorage set successfully');
          
          // Try to sync with backend (but don't block on failure)
          try {
            const res = await fetch("/api/auth/sync-supabase-user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ 
                email: googleUser.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                profileImageUrl: userData.profileImageUrl,
                role: 'student',
                supabaseUserId: googleUser.id,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              // Update with server data if available
              if (data.user) {
                userData.id = data.user.id;
                sessionStorage.setItem('authUser', JSON.stringify(userData));
              }
            }
          } catch (error) {
            console.warn('Backend sync failed, continuing with session data:', error);
          }
          
          // Get the pending role from localStorage
          const pendingRole = localStorage.getItem('pendingUserRole');
          if (pendingRole) {
            userData.role = pendingRole;
            localStorage.removeItem('pendingUserRole');
          }
          
          // Redirect to home page
          console.log('🚀 Redirecting to home');
          setLocation('/');
        } else {
          // No session, redirect to home
          setLocation('/');
        }
      } catch (error) {
        console.error('Callback error:', error);
        alert('Authentication error');
        setLocation('/');
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
        <h2 className="text-xl text-white mb-2">Completing Sign-In</h2>
        <p className="text-slate-400">Please wait...</p>
      </div>
    </div>
  );
}
