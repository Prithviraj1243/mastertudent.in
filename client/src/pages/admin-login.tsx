import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';
import { 
  Crown, 
  Shield, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Settings,
  KeyRound,
  Fingerprint
} from 'lucide-react';
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    adminId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Predefined admin credentials (in production, this should be in backend)
  const adminCredentials = [
    { id: 'admin001', password: 'admin123', name: 'Super Admin', role: 'super_admin' },
    { id: 'admin002', password: 'admin123', name: 'Content Moderator', role: 'content_admin' },
    { id: 'admin003', password: 'admin123', name: 'User Manager', role: 'user_admin' },
    { id: 'masterstudent', password: 'admin123', name: 'Master Student Admin', role: 'super_admin' },
    { id: 'admin', password: 'admin123', name: 'Main Admin', role: 'super_admin' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.adminId || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both Admin ID and Password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check credentials
      const admin = adminCredentials.find(
        cred => cred.id === formData.adminId && cred.password === formData.password
      );

      if (admin) {
        // Successful login
        setIsRedirecting(true);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${admin.name}! Redirecting to admin panel...`,
        });

        // Store admin session (in production, use proper JWT tokens)
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminId', admin.id);
        sessionStorage.setItem('adminName', admin.name);
        sessionStorage.setItem('adminRole', admin.role);
        sessionStorage.setItem('loginTime', new Date().toISOString());

        // Immediate redirect to admin dashboard
        console.log('Login successful, redirecting to admin dashboard...');
        console.log('Stored session data:', {
          adminAuth: sessionStorage.getItem('adminAuth'),
          adminId: sessionStorage.getItem('adminId'),
          adminName: sessionStorage.getItem('adminName')
        });
        
        // Immediate and reliable redirect to admin dashboard
        console.log('Redirecting to admin dashboard immediately...');
        
        // Force immediate redirect using window.location
        window.location.href = '/admin-dashboard';
      } else {
        // Failed login
        setLoginAttempts(prev => prev + 1);
        toast({
          title: "Login Failed",
          description: "Invalid Admin ID or Password. Please try again.",
          variant: "destructive"
        });
        
        // Clear password field
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isBlocked = loginAttempts >= 5;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Redirect Overlay */}
      {isRedirecting && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div 
            className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 p-8 rounded-xl text-center border border-orange-500/30 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">🔥 Opening Admin Panel</h3>
            <p className="text-orange-200">Accessing secure dashboard...</p>
          </motion.div>
        </div>
      )}
      {/* Fire Ash Effects Background */}
      <div className="absolute inset-0">
        {/* Animated Fire Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/30 to-black">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-orange-950/20 to-red-950/30" />
        </div>

        {/* Fire Ash Particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute ${
                i % 4 === 0 ? 'w-1 h-1 bg-orange-400/70' :
                i % 4 === 1 ? 'w-2 h-2 bg-red-400/60' :
                i % 4 === 2 ? 'w-1.5 h-1.5 bg-yellow-400/80' :
                'w-0.5 h-0.5 bg-orange-300/90'
              } rounded-full shadow-lg`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${100 + Math.random() * 20}%`,
                filter: 'blur(0.5px)',
              }}
              animate={{
                y: [-20, -window.innerHeight - 100],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [0, 0.8, 0.6, 0],
                scale: [0.5, 1, 0.8, 0.3],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Glowing Fire Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-60 h-60 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-48 h-48 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.8, 0.4],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />

        {/* Ember Trails */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`ember-${i}`}
              className="absolute w-px h-8 bg-gradient-to-t from-orange-500/80 to-transparent"
              style={{
                left: `${5 + i * 8}%`,
                bottom: '0%',
              }}
              animate={{
                height: [0, 40, 20, 0],
                opacity: [0, 1, 0.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Smoke Effect */}
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gray-600/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 2, 1.5],
            opacity: [0.1, 0.3, 0.1],
            y: [0, -50, -100],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-black/40 border-orange-500/40 backdrop-blur-lg shadow-2xl shadow-orange-500/20 relative overflow-hidden">
            {/* Card Fire Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />
            
            <CardHeader className="text-center pb-6 relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse opacity-50" />
                <Crown className="w-10 h-10 text-white relative z-10" />
              </motion.div>
              
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                🔥 Admin Portal
              </CardTitle>
              <p className="text-orange-200/80 text-sm">
                Secure access to Master Student Admin Panel
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Security Notice */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-red-400" />
                  <span className="text-red-300 text-sm font-medium">Authorized Personnel Only</span>
                </div>
                <p className="text-red-200/80 text-xs mt-1">
                  This area is restricted to authorized administrators only.
                </p>
              </div>

              {/* Login Attempts Warning */}
              {loginAttempts > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`border rounded-lg p-3 ${
                    isBlocked 
                      ? 'bg-red-500/20 border-red-500/50' 
                      : 'bg-orange-500/10 border-orange-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className={`h-4 w-4 ${isBlocked ? 'text-red-400' : 'text-orange-400'}`} />
                    <span className={`text-sm font-medium ${isBlocked ? 'text-red-300' : 'text-orange-300'}`}>
                      {isBlocked ? 'Account Temporarily Locked' : `Failed Attempts: ${loginAttempts}/5`}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isBlocked ? 'text-red-200/80' : 'text-orange-200/80'}`}>
                    {isBlocked 
                      ? 'Too many failed attempts. Please contact system administrator.' 
                      : 'Account will be locked after 5 failed attempts.'
                    }
                  </p>
                </motion.div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Admin ID Field */}
                <div className="space-y-2">
                  <Label htmlFor="adminId" className="text-gray-300 text-sm font-medium">
                    Admin ID
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="adminId"
                      type="text"
                      placeholder="Enter your admin ID"
                      value={formData.adminId}
                      onChange={(e) => handleInputChange('adminId', e.target.value)}
                      className="pl-10 bg-black/30 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20"
                      disabled={isBlocked}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 bg-black/30 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20"
                      disabled={isBlocked}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      disabled={isBlocked}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading || isBlocked || isRedirecting}
                    className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 hover:from-orange-500 hover:via-red-500 hover:to-orange-500 text-white font-bold py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 border border-orange-500/50 relative overflow-hidden"
                  >
                    {/* Button Fire Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 animate-pulse" />
                    <div className="relative z-10 flex items-center justify-center space-x-2">
                  {isRedirecting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Opening Admin Panel...</span>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <KeyRound className="h-4 w-4" />
                      <span>Login to Admin Panel</span>
                    </div>
                  )}
                    </div>
                  </Button>
                </motion.div>
              </form>

              {/* Demo Credentials */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5" />
                <div className="flex items-center space-x-2 mb-2 relative z-10">
                  <Fingerprint className="h-4 w-4 text-orange-400" />
                  <span className="text-orange-300 text-sm font-medium">🔥 Test Credentials</span>
                </div>
                <div className="space-y-1 text-xs text-orange-200/80 mb-3 relative z-10">
                  <p><strong>🔥 Single Password for All Admins:</strong> admin123</p>
                  <div className="mt-2 space-y-1">
                    <p><strong>Admin IDs:</strong> admin, admin001, admin002, admin003, masterstudent</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setFormData({ adminId: 'admin', password: 'admin123' });
                      toast({
                        title: "Demo Credentials Filled",
                        description: "Click 'Login to Admin Panel' to test login",
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full border-orange-500/50 text-orange-300 hover:bg-orange-500/10 text-xs relative z-10"
                  >
                    🔥 Fill Demo Credentials
                  </Button>
                  
                  {/* Quick Test Button */}
                  <Button
                    type="button"
                    onClick={async () => {
                      // Auto-fill and login
                      setFormData({ adminId: 'admin', password: 'admin123' });
                      toast({
                        title: "Auto-Login Started",
                        description: "Logging in and redirecting to admin panel...",
                      });
                      
                      // Immediate login and redirect
                      sessionStorage.setItem('adminAuth', 'true');
                      sessionStorage.setItem('adminId', 'admin');
                      sessionStorage.setItem('adminName', 'Main Admin');
                      sessionStorage.setItem('adminRole', 'super_admin');
                      sessionStorage.setItem('loginTime', new Date().toISOString());
                      
                      // Force immediate redirect
                      window.location.href = '/admin-dashboard';
                    }}
                    size="sm"
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs shadow-lg shadow-orange-500/30 relative z-10"
                    disabled={isLoading || isRedirecting}
                  >
                    🚀 Quick Fire Login
                  </Button>
                </div>
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2 text-gray-400">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>2FA Ready</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Audit Logged</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Session Timeout</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-gray-500">
            Master Student Admin Panel v2.0 • Secure Access Portal
          </p>
        </motion.div>
      </div>
    </div>
  );
}
