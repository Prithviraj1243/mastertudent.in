import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BecomeAdmin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    userEmail: '',
    adminPromotionId: '',
    adminPromotionPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Try to get user email from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('userEmail');
    const storedAuth = sessionStorage.getItem('authUser');
    
    if (storedEmail) {
      setFormData(prev => ({ ...prev, userEmail: storedEmail }));
    } else if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.email) {
          setFormData(prev => ({ ...prev, userEmail: authData.email }));
        }
      } catch (e) {
        console.error('Failed to parse auth data:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Submitting admin promotion request...', { 
        userEmail: formData.userEmail,
        hasId: !!formData.adminPromotionId,
        hasPassword: !!formData.adminPromotionPassword
      });

      const response = await fetch('/api/admin/promote-to-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);

      console.log('Raw response:', response);

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.ok && data.success) {
        setSuccess(true);
        
        // Store user data in sessionStorage
        if (data.user) {
          sessionStorage.setItem('authUser', JSON.stringify(data.user));
          sessionStorage.setItem('userEmail', data.user.email);
        }

        toast({
          title: '✅ Admin Access Granted!',
          description: data.message || 'You are now an admin!',
        });

        // Redirect to admin dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/admin';
        }, 2000);
      } else {
        const errorMessage = data.message || 'Invalid credentials. Please try again.';
        setError(errorMessage);
        console.error('Promotion failed:', errorMessage);
        
        toast({
          title: 'Access Denied',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Admin promotion error:', error);
      const errorMessage = error.message || 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="w-full max-w-md border-green-500/50 bg-slate-800/90 backdrop-blur">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Admin Access Granted!</h2>
              <p className="text-slate-300">
                You now have full administrator privileges.
                <br />
                Redirecting to admin dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md border-purple-500/50 bg-slate-800/90 backdrop-blur">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-white">
            Become Admin
          </CardTitle>
          <CardDescription className="text-center text-slate-300">
            Enter your Admin Promotion credentials to gain administrator access
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Email */}
            <div className="space-y-2">
              <Label htmlFor="userEmail" className="text-slate-200">
                Your Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="Enter your registered email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Admin Promotion ID */}
            <div className="space-y-2">
              <Label htmlFor="adminPromotionId" className="text-slate-200">
                Admin Promotion ID
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="adminPromotionId"
                  type="text"
                  placeholder="Enter Admin Promotion ID"
                  value={formData.adminPromotionId}
                  onChange={(e) => setFormData({ ...formData, adminPromotionId: e.target.value })}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Admin Promotion Password */}
            <div className="space-y-2">
              <Label htmlFor="adminPromotionPassword" className="text-slate-200">
                Admin Promotion Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="adminPromotionPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Admin Promotion Password"
                  value={formData.adminPromotionPassword}
                  onChange={(e) => setFormData({ ...formData, adminPromotionPassword: e.target.value })}
                  className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Info Alert */}
            <Alert className="bg-blue-500/10 border-blue-500/50">
              <Shield className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-slate-300">
                These credentials are set by the system administrator. Contact your admin if you need access.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Request Admin Access
                </>
              )}
            </Button>

            {/* Back to Home */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50"
              onClick={() => setLocation('/')}
            >
              Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
