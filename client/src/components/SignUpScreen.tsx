import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from 'framer-motion';
// Google OAuth now handled by Supabase - old package no longer needed
import { 
  GraduationCap, 
  User, 
  CheckCircle,
  Star,
  Shield,
  Zap,
} from 'lucide-react';

interface SignUpScreenProps {
  onComplete: () => void;
  selectedGoals?: string[];
}

export default function SignUpScreen({ onComplete: _onComplete }: SignUpScreenProps) {
  const [currentStep] = useState(0);

  // Handle Supabase Google Login
  const handleSupabaseGoogleLogin = async () => {
    try {
      // Import Supabase client
      const { supabase } = await import('@/lib/supabase');
      
      // Sign in with Google using Supabase - opens popup
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

      if (error) {
        console.error('Supabase OAuth error:', error);
        alert(`Google Sign-In Failed: ${error.message}`);
      }
      // Supabase will handle the redirect
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google Sign-In Error: Something went wrong');
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with industry-standard security',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Get immediate access to 10,000+ premium study materials',
      color: 'from-orange-400 to-red-500'
    },
    {
      icon: Star,
      title: 'Premium Features',
      description: 'Unlock AI-powered recommendations and personalized learning paths',
      color: 'from-purple-400 to-pink-500'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 3 === 0 ? 'w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500' :
                i % 3 === 1 ? 'w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500' :
                'w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500'
              }`}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: 0 
              }}
              animate={{ 
                y: [null, -200],
                x: [null, Math.random() * 100 - 50],
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0]
              }}
              transition={{ 
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4
              }}
            />
          ))}
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Glowing Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header 
          className="p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Master Student
            </span>
          </div>
        </motion.header>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-6xl">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Sign Up Form */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                    >
                      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
                        <CardContent className="p-8">
                          <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">
                              Welcome to Master Student
                            </h2>
                            <p className="text-slate-300">
                              Sign in to access your study materials
                            </p>
                          </div>

                          <div className="space-y-6">
                            {/* Google Sign In */}
                            <Button
                              type="button"
                              onClick={handleSupabaseGoogleLogin}
                              className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 flex items-center justify-center gap-3 h-12 text-base font-medium shadow-sm"
                            >
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                              Continue with Google
                            </Button>

                            {/* OR Divider */}
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-600"></div>
                              </div>
                              <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-800 text-slate-400">OR</span>
                              </div>
                            </div>

                            {/* Create New Account Button */}
                            <Button 
                              onClick={() => window.location.href = '/create-account'}
                              variant="outline"
                              className="w-full border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 font-semibold py-4 text-lg transition-all duration-300"
                            >
                              <User className="w-5 h-5 mr-3" />
                              Create a New Account
                            </Button>

                            {/* Sign Up Text */}
                            <div className="text-center">
                              <p className="text-sm text-slate-400">
                                Don't have an account?{' '}
                                <button 
                                  onClick={() => window.location.href = '/create-account'}
                                  className="text-orange-400 hover:text-orange-300 font-medium underline transition-colors"
                                >
                                  Sign up here
                                </button>
                              </p>
                            </div>

                            {/* Terms */}
                            <p className="text-xs text-slate-400 text-center">
                              By continuing, you agree to our{' '}
                              <a href="#" className="text-orange-400 hover:text-orange-300">Terms of Service</a>
                              {' '}and{' '}
                              <a href="#" className="text-orange-400 hover:text-orange-300">Privacy Policy</a>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Benefits Section */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                      className="space-y-8"
                    >
                      <div className="text-center lg:text-left">
                        <h3 className="text-4xl font-bold text-white mb-4">
                          Why Choose Master Student?
                        </h3>
                        <p className="text-xl text-slate-300">
                          Join the platform that's revolutionizing education in India
                        </p>
                      </div>

                      <div className="space-y-6">
                        {benefits.map((benefit, index) => (
                          <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
                          >
                            <Card className="bg-white border-gray-300 backdrop-blur-lg hover:scale-105 transition-transform duration-300 shadow-lg">
                              <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center`}>
                                    <benefit.icon className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-semibold text-black mb-2">
                                      {benefit.title}
                                    </h4>
                                    <p className="text-black text-sm">
                                      {benefit.description}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                    className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-16 h-16 text-white" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl font-bold text-white mb-4"
                  >
                    Welcome to Master Student!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-xl text-slate-300 mb-8"
                  >
                    Your account has been created successfully. Redirecting to your dashboard...
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-center space-x-2"
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
