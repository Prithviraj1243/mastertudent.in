import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle,
  ArrowLeft,
  Users,
  School,
  FileText,
  Award
} from 'lucide-react';
import { Link, useLocation } from "wouter";

interface FormData {
  name: string;
  email: string;
  gender: 'male' | 'female' | '';
  school: string;
  class: string;
  competitiveExam: string;
  bio: string;
}

export default function CreateAccount() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    gender: '',
    school: '',
    class: '',
    competitiveExam: '',
    bio: ''
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const classOptions = [
    'Class 9', 'Class 10', 'Class 11', 'Class 12', 
    'Undergraduate', 'Graduate', 'Post Graduate', 'Other'
  ];

  const competitiveExamOptions = [
    'Not Preparing', 'JEE Main', 'JEE Advanced', 'NEET', 'GATE', 
    'CLAT', 'CAT', 'UPSC', 'SSC', 'Banking Exams', 'NDA', 
    'AFCAT', 'CDS', 'IBPS', 'SBI PO', 'Railway Exams', 
    'State PSC', 'AIIMS', 'JIPMER', 'BITSAT', 'VITEEE', 
    'COMEDK', 'MHT CET', 'KCET', 'EAMCET', 'Other'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate account creation
    setTimeout(() => {
      // Store user data in localStorage
      const userData = {
        id: Date.now(),
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        gender: formData.gender,
        school: formData.school,
        class: formData.class,
        competitiveExam: formData.competitiveExam,
        bio: formData.bio,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
        onboardingCompleted: true,
        role: 'student',
        createdAt: new Date().toISOString()
      };

      // Set authentication
      sessionStorage.setItem('directAuth', 'true');
      sessionStorage.setItem('authUser', JSON.stringify(userData));
      localStorage.setItem('userProfile', JSON.stringify(userData));

      setCurrentStep(1);
      
      // Redirect to home page after success animation
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }, 2000);
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.email.trim() && 
           formData.email.includes('@') &&
           formData.gender &&
           formData.school.trim() &&
           formData.class &&
           formData.competitiveExam;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects - Matching Signup Page */}
      <div className="absolute inset-0">
        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 4 === 0 ? 'w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500' :
                i % 4 === 1 ? 'w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500' :
                i % 4 === 2 ? 'w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500' :
                'w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-500'
              }`}
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                y: [null, -200, -400],
                x: [null, Math.random() * 100 - 50, Math.random() * 200 - 100],
                opacity: [0, 1, 0.5, 0],
                scale: [0, 1.5, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Hexagons */}
          <motion.div
            className="absolute top-20 left-10 w-16 h-16 border-2 border-cyan-400/30"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Rotating Squares */}
          <motion.div
            className="absolute top-1/3 right-20 w-12 h-12 border border-purple-400/40 bg-purple-400/10"
            animate={{
              rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360],
              scale: [1, 0.8, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Pulsing Circles */}
          <motion.div
            className="absolute bottom-1/3 left-1/4 w-20 h-20 rounded-full border-2 border-pink-400/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.6, 0.2],
              borderWidth: [2, 4, 2]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br from-orange-500 via-red-500 to-orange-600">
              <GraduationCap className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                MasterStudent
              </span>
              <div className="text-xs text-orange-300 font-medium tracking-wider uppercase">
                ⚡ Learn • Share • Excel
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 flex items-center justify-center min-h-[80vh]">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                {/* Welcome Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3 mb-6">
                    <Sparkles className="h-5 w-5 text-purple-300 animate-pulse" />
                    <span className="text-purple-200 font-medium">Join <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span></span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    Create Your
                    <br />
                    <span className="text-white">
                      Student Profile
                    </span>
                  </h1>
                  
                  <p className="text-lg text-gray-300 max-w-xl mx-auto">
                    Tell us about yourself and join thousands of students in the learning revolution
                  </p>
                </div>

                {/* Enhanced Form Card with Web3 Effects */}
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Card className="bg-black/20 backdrop-blur-xl border border-cyan-400/20 shadow-2xl hover:border-cyan-400/40 transition-all duration-500 relative overflow-hidden">
                    {/* Card Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
                    
                    {/* Scanning Line Effect */}
                    <motion.div
                      className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                      animate={{
                        x: ["-100%", "100%"]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "linear"
                      }}
                    />
                    
                    <CardContent className="p-8 relative z-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name Input */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="block text-sm font-medium text-white mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            className="pl-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400"
                          />
                        </div>
                      </motion.div>

                      {/* Email Input */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-white mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            className="pl-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400"
                          />
                        </div>
                      </motion.div>

                      {/* Gender Selection */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="block text-sm font-medium text-white mb-3">
                          Gender *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleInputChange('gender', 'male')}
                            className={`h-12 ${
                              formData.gender === 'male'
                                ? 'bg-blue-500/30 border-blue-400 text-blue-300'
                                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                            }`}
                          >
                            👨 Male
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleInputChange('gender', 'female')}
                            className={`h-12 ${
                              formData.gender === 'female'
                                ? 'bg-pink-500/30 border-pink-400 text-pink-300'
                                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                            }`}
                          >
                            👩 Female
                          </Button>
                        </div>
                      </motion.div>

                      {/* School Input */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label className="block text-sm font-medium text-white mb-2">
                          School/College *
                        </label>
                        <div className="relative">
                          <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            placeholder="Enter your school or college name"
                            value={formData.school}
                            onChange={(e) => handleInputChange('school', e.target.value)}
                            required
                            className="pl-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400"
                          />
                        </div>
                      </motion.div>

                      {/* Class Selection */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <label className="block text-sm font-medium text-white mb-2">
                          Class/Level *
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                          <select
                            value={formData.class}
                            onChange={(e) => handleInputChange('class', e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 appearance-none"
                          >
                            <option value="" className="bg-gray-800 text-white">Select your class</option>
                            {classOptions.map((cls: string) => (
                              <option key={cls} value={cls} className="bg-gray-800 text-white">{cls}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>

                      {/* Competitive Exam Selection */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <label className="block text-sm font-medium text-white mb-2">
                          Competitive Exam Preparation *
                        </label>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                          <select
                            value={formData.competitiveExam}
                            onChange={(e) => handleInputChange('competitiveExam', e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 appearance-none"
                          >
                            <option value="" className="bg-gray-800 text-white">Select exam you're preparing for</option>
                            {competitiveExamOptions.map((exam: string) => (
                              <option key={exam} value={exam} className="bg-gray-800 text-white">{exam}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>

                      {/* Bio Input */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <label className="block text-sm font-medium text-white mb-2">
                          Bio (Optional)
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                          <textarea
                            placeholder="Tell us about yourself, your interests, goals..."
                            value={formData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            rows={3}
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 resize-vertical"
                          />
                        </div>
                      </motion.div>

                      {/* Submit Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="pt-4"
                      >
                        <Button
                          type="submit"
                          disabled={!isFormValid() || isLoading}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Creating Account...
                            </>
                          ) : (
                            <>
                              Create Account
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </motion.div>

                      {/* Terms */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-xs text-gray-400 text-center"
                      >
                        By creating an account, you agree to our{' '}
                        <a href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
                      </motion.p>
                    </form>
                    </CardContent>
                  </Card>
                </motion.div>
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
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
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
                  Welcome to <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span>! 🎉
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl text-gray-300 mb-8"
                >
                  Your account has been created successfully. 
                  <br />
                  Redirecting to your dashboard...
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
                      className="w-3 h-3 bg-purple-400 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
