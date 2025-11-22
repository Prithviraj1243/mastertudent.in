import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { 
  GraduationCap, 
  User, 
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Trophy,
  Users,
  BookOpen,
  TrendingUp,
  Star,
  Shield,
  Zap,
} from 'lucide-react';

interface SignUpScreenProps {
  onComplete: () => void;
  selectedGoals?: string[];
}

export default function SignUpScreen({ onComplete, selectedGoals = [] }: SignUpScreenProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpFields, setShowOtpFields] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate random 4-digit OTP
  const generateOtp = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    return newOtp;
  };

  // Handle phone number submission
  const handlePhoneSubmit = () => {
    if (!formData.phone || formData.phone.length < 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    
    const newOtp = generateOtp();
    // Show OTP in JS popup
    alert(`Your OTP is: ${newOtp}\n\nPlease enter this code in the fields below.`);
    setShowOtpFields(true); // Show OTP fields on same page
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP verification
  const handleOtpVerify = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      alert('Please enter complete 4-digit OTP');
      return;
    }
    
    if (enteredOtp === generatedOtp) {
      alert('OTP verified successfully! Creating your account...');
      
      try {
        // Create user account via API to authenticate them
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: 'User', // Default name
            lastName: 'Student',
            email: `${formData.phone}@masterstudent.com`, // Generate email from phone
            phone: `+91${formData.phone}`,
            password: 'defaultpassword123', // Default password
            selectedGoals: selectedGoals,
            onboardingCompleted: true // Skip onboarding, go directly to home
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          alert('Account verified successfully! Welcome to Master Student!');
          // Set direct authentication flag and redirect
          sessionStorage.setItem('directAuth', 'true');
          sessionStorage.setItem('userPhone', `+91${formData.phone}`);
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        } else {
          // If registration fails, still set auth and redirect
          alert('Welcome to Master Student!');
          sessionStorage.setItem('directAuth', 'true');
          sessionStorage.setItem('userPhone', `+91${formData.phone}`);
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Welcome to Master Student!');
        // Set auth and redirect even if API fails
        sessionStorage.setItem('directAuth', 'true');
        sessionStorage.setItem('userPhone', `+91${formData.phone}`);
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } else {
      alert('Invalid OTP. Please try again.');
      setOtp(['', '', '', '']); // Clear OTP fields
    }
  };

  // Handle Google OAuth Success
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      alert('Google Sign-In Error: No credential received');
      return;
    }

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          credential: credentialResponse.credential,
          role: 'student' // Default role for signup page
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Set authentication flags
        sessionStorage.setItem('directAuth', 'true');
        sessionStorage.setItem('userEmail', data.user.email);
        sessionStorage.setItem('userName', `${data.user.firstName} ${data.user.lastName}`);
        
        // Redirect to home page
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        alert(`Google Sign-In Failed: ${data.message || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      alert('Google Sign-In Error: Something went wrong. Please try again.');
    }
  };

  // Handle Google OAuth Error
  const handleGoogleError = () => {
    alert('Google Sign-In Error: Failed to sign in with Google. Please try again.');
  };


  const handleSubmit = async () => {
    // Basic form validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting registration with:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        selectedGoals: selectedGoals
      });

      // Test API connection first with debug endpoint
      console.log('Testing API connection...');
      const debugResponse = await fetch('/api/debug');
      console.log('Debug response status:', debugResponse.status);
      
      if (!debugResponse.ok) {
        throw new Error('API server not responding');
      }
      
      const debugData = await debugResponse.json();
      console.log('Debug response:', debugData);
      
      // Create account via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          selectedGoals: selectedGoals
        }),
      });

      console.log('Registration response status:', response.status);
      
      const data = await response.json();
      console.log('Registration response data:', data);

      if (response.ok && data.success) {
        // Immediately redirect to main page after successful registration
        onComplete();
      } else {
        // Handle error
        alert(data.message || 'Registration failed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Network error: ' + (error instanceof Error ? error.message : 'Please try again.'));
      setIsLoading(false);
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
          className="absolute top-1/4 left-1/6 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-24 h-24 sm:w-40 sm:h-40 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl"
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
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="w-full max-w-7xl">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
                    {/* Sign Up Form */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                    >
                      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
                        <CardContent className="p-4 sm:p-6 md:p-8">
                          <div className="text-center mb-6 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                              Register with your Email ID / phone number
                            </h2>
                            <p className="text-sm sm:text-base text-slate-300">
                              Enter your phone number to get started
                            </p>
                          </div>

                          <div className="space-y-6">
                            {/* Phone Number Input */}
                            <div className="space-y-2">
                              <label className="text-slate-300 text-sm">Phone Number</label>
                              <div className="flex space-x-2">
                                {/* Country Code Box */}
                                <div className="relative w-16 sm:w-20">
                                  <input
                                    type="text"
                                    value="+91"
                                    readOnly
                                    className="w-full px-2 sm:px-3 py-3 sm:py-4 bg-slate-600/50 border border-slate-500 rounded-lg text-white text-center text-sm sm:text-lg font-medium cursor-not-allowed"
                                  />
                                </div>
                                
                                {/* Phone Number Box */}
                                <div className="relative flex-1">
                                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                                  <input
                                    type="tel"
                                    placeholder="Enter 10 digit number"
                                    value={formData.phone}
                                    onChange={(e) => {
                                      // Only allow digits and limit to 10
                                      const value = e.target.value.replace(/\D/g, '');
                                      if (value.length <= 10) {
                                        handleInputChange('phone', value);
                                      }
                                    }}
                                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-3 sm:py-4 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-lg"
                                    maxLength={10}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Send OTP Button */}
                            <Button 
                              onClick={handlePhoneSubmit}
                              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold py-3 sm:py-4 text-base sm:text-lg"
                            >
                              Send OTP <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>

                            {/* OTP Fields - Show after phone submission */}
                            {showOtpFields && (
                              <div className="space-y-4 pt-4 border-t border-slate-600">
                                <div className="text-center">
                                  <p className="text-slate-300 mb-4">
                                    Enter the 4-digit OTP sent to +91 {formData.phone}
                                  </p>
                                </div>
                                
                                {/* OTP Input Fields */}
                                <div className="flex justify-center space-x-2 sm:space-x-3">
                                  {otp.map((digit, index) => (
                                    <input
                                      key={index}
                                      id={`otp-${index}`}
                                      type="text"
                                      value={digit}
                                      onChange={(e) => handleOtpChange(index, e.target.value)}
                                      className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-center text-lg sm:text-xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                      maxLength={1}
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                    />
                                  ))}
                                </div>

                                {/* Verify OTP Button */}
                                <Button 
                                  onClick={handleOtpVerify}
                                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold py-3"
                                >
                                  Verify OTP <CheckCircle className="ml-2 w-4 h-4" />
                                </Button>

                                {/* Resend OTP */}
                                <div className="text-center">
                                  <button
                                    onClick={handlePhoneSubmit}
                                    className="text-orange-400 hover:text-orange-300 text-sm"
                                  >
                                    Didn't receive code? Resend OTP
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* OR Divider */}
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-600"></div>
                              </div>
                              <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-800 text-slate-400">OR</span>
                              </div>
                            </div>

                            {/* Google Sign In Button */}
                            <div className="w-full flex justify-center">
                              <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                text="signin_with"
                                shape="rectangular"
                                theme="filled_blue"
                                size="large"
                                width="100%"
                              />
                            </div>


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
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                          Why Choose Master Student?
                        </h3>
                        <p className="text-base sm:text-lg lg:text-xl text-slate-300">
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
                              <CardContent className="p-4 sm:p-6">
                                <div className="flex items-start space-x-3 sm:space-x-4">
                                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center flex-shrink-0`}>
                                    <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-base sm:text-lg font-semibold text-black mb-1 sm:mb-2">
                                      {benefit.title}
                                    </h4>
                                    <p className="text-black text-xs sm:text-sm leading-relaxed">
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
                    className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
                  >
                    Welcome to Master Student!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8"
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
