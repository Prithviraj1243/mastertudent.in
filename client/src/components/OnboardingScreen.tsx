import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle,
  Star,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Zap,
  Target,
  Brain,
  Trophy,
  Lightbulb,
  Clock,
  Rocket,
  User,
  Search,
  GraduationCap
} from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (selectedGoals: string[]) => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goals = [
    { id: 'jee', name: 'JEE Mains', category: 'Engineering', icon: Rocket },
    { id: 'neet', name: 'NEET UG', category: 'Medical', icon: Brain },
    { id: 'upsc', name: 'UPSC CSE', category: 'Civil Services', icon: Star },
    { id: 'gate', name: 'GATE', category: 'Engineering', icon: Zap },
    { id: 'cat', name: 'CAT', category: 'Management', icon: TrendingUp },
    { id: 'banking', name: 'Banking', category: 'Finance', icon: Target }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Fast Learning',
      description: 'AI-powered learning technology that adapts to your pace and style',
      color: 'from-orange-400 to-red-500'
    },
    {
      icon: Target,
      title: 'Personalized Experience',
      description: 'Customized learning paths that focus on your strengths and improve weaknesses',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Users,
      title: 'Top Community',
      description: 'Connect with India\'s brightest minds and learn from the best',
      color: 'from-cyan-400 to-blue-500'
    }
  ];

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const nextStep = () => {
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Pass selected goals to parent component
      const goalNames = selectedGoals.map(goalId => {
        const goal = goals.find(g => g.id === goalId);
        return goal ? goal.name : goalId;
      });
      onComplete(goalNames);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 4 === 0 ? 'w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500' :
                i % 4 === 1 ? 'w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500' :
                i % 4 === 2 ? 'w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500' :
                'w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500'
              }`}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: 0 
              }}
              animate={{ 
                y: [null, -200],
                x: [null, Math.random() * 200 - 100],
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0]
              }}
              transition={{ 
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5
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
          className="absolute top-1/6 left-1/6 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/6 right-1/6 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
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
                  key="step0"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  {/* Hero Section */}
                  <motion.h1 
                    className="text-5xl md:text-7xl font-bold text-white mb-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    Crack your goal with
                    <br />
                    <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                      India's top educators
                    </span>
                  </motion.h1>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
                    {/* Registration Card */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                    >
                      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-lg">
                        <CardContent className="p-8">
                          <h3 className="text-xl font-semibold text-white mb-6">
                            Register with your Email ID / phone number
                          </h3>
                          
                          <div className="space-y-4">
                            <input
                              type="text"
                              placeholder="Enter your phone number/email id"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            
                            <Button 
                              onClick={nextStep}
                              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold py-3"
                            >
                              Continue <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                            
                            <div className="text-center text-slate-400 text-sm">OR</div>
                            
                            <Button 
                              onClick={() => window.location.href = '/create-account'}
                              variant="outline"
                              className="w-full bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30 hover:text-purple-200"
                            >
                              <User className="w-5 h-5 mr-2" />
                              Create New Account (Recommended)
                            </Button>
                            
                            <Button 
                              variant="outline"
                              className="w-full bg-white text-slate-900 border-slate-300 hover:bg-slate-100"
                            >
                              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                              Sign in with Google
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Features */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      className="space-y-6"
                    >
                      {features.map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                        >
                          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-lg hover:scale-105 transition-transform duration-300">
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                                  <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-white mb-2">
                                    {feature.title}
                                  </h4>
                                  <p className="text-slate-300 text-sm">
                                    {feature.description}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <motion.h2 
                    className="text-4xl md:text-5xl font-bold text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Select your goal / exam
                  </motion.h2>
                  <motion.p 
                    className="text-slate-300 text-lg mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    100+ exams available for your preparation
                  </motion.p>

                  {/* Search Bar */}
                  <motion.div 
                    className="max-w-md mx-auto mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search your exam (e.g., JEE, NEET, UPSC)"
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-12"
                      />
                    </div>
                  </motion.div>

                  {/* Goal Selection */}
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    {goals.map((goal, index) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all duration-300 ${
                            selectedGoals.includes(goal.id)
                              ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50 scale-105'
                              : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600 hover:scale-105'
                          } backdrop-blur-lg`}
                          onClick={() => handleGoalToggle(goal.id)}
                        >
                          <CardContent className="p-6 text-center">
                            <goal.icon className={`w-8 h-8 mx-auto mb-3 ${
                              selectedGoals.includes(goal.id) ? 'text-orange-400' : 'text-slate-400'
                            }`} />
                            <h3 className={`font-semibold mb-1 ${
                              selectedGoals.includes(goal.id) ? 'text-white' : 'text-slate-200'
                            }`}>
                              {goal.name}
                            </h3>
                            <p className={`text-sm ${
                              selectedGoals.includes(goal.id) ? 'text-orange-300' : 'text-slate-400'
                            }`}>
                              {goal.category}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                  >
                    <Button 
                      onClick={nextStep}
                      disabled={selectedGoals.length === 0}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold px-8 py-3 disabled:opacity-50"
                    >
                      Continue with Selected Goal
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <motion.footer 
          className="p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <p className="text-slate-400 text-sm">
            2024 Master Student. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-2 text-slate-500 text-sm">
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Help</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
