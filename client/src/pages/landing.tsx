import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, GraduationCap, Star, Users, BookOpen, TrendingUp, Quote } from "lucide-react";
import logoImage from "/src/assets/logo.png";
import LoginForm from "@/components/auth/LoginForm";
import SplashScreen from "@/components/SplashScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import SignUpScreen from "@/components/SignUpScreen";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    // Check if we should skip splash screen
    const skipSplash = localStorage.getItem('skipSplash');
    if (skipSplash === 'true') {
      localStorage.removeItem('skipSplash'); // Clean up
      return false; // Skip splash screen
    }
    return true; // Show splash screen normally
  });
  const [showSignUp, setShowSignUp] = useState(() => {
    // If skipping splash, go directly to signup
    return localStorage.getItem('skipSplash') === 'true';
  });
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  // Show splash screen first (only if not skipping)
  if (showSplash) {
    return <SplashScreen onComplete={() => {
      setShowSplash(false);
      setShowSignUp(true); // Skip onboarding, go directly to signup
    }} />;
  }
  
  // Show sign up screen after splash (skip onboarding and this landing page)
  if (showSignUp) {
    return <SignUpScreen 
      selectedGoals={selectedGoals}
      onComplete={() => {
        // After successful signup, set direct authentication
        sessionStorage.setItem('directAuth', 'true');
        sessionStorage.setItem('userAuthenticated', 'true');
        
        // Redirect to home page
        window.location.href = "/";
      }} 
    />;
  }
  
  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm onSuccess={() => window.location.href = "/"} />
          <div className="text-center mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowLoginForm(false)}
            >
              ← Back to Landing Page
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-pulse ${
                i % 3 === 0 ? 'w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500' :
                i % 3 === 1 ? 'w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500' :
                'w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
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
      <header className="bg-black/30 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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
            
            <div className="flex items-center">
              <Button 
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-400 hover:to-red-500 shadow-lg border border-orange-400/30 hover:border-red-400/50 transition-all duration-300"
                onClick={() => setShowLoginForm(true)}
                data-testid="button-get-started"
              >
                🚀 Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            {/* Premium Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-full mb-8">
              <Star className="w-4 h-4 text-orange-400 mr-2" />
              <span className="text-orange-400 text-sm font-medium">Premium Study Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Crack your goal with</span>
              <span className="block bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                India's top students notes
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Access premium study notes from top performers, upload your own materials to earn, 
              and join a <span className="text-orange-400 font-semibold">vibrant community</span> of academic excellence.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-400 hover:to-red-500 text-lg px-8 py-4 font-bold shadow-2xl border border-orange-400/50 hover:border-red-400/50 transition-all duration-300 hover:scale-105"
              onClick={() => setShowLoginForm(true)}
              data-testid="button-browse-notes"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              📚 Browse Premium Notes
            </Button>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 text-lg px-8 py-4 font-bold shadow-2xl border border-purple-400/50 hover:border-pink-400/50 transition-all duration-300 hover:scale-105"
              onClick={() => setShowLoginForm(true)}
              data-testid="button-become-topper"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              💰 Become a Topper
            </Button>
          </div>
          
          {/* Floating Elements - Removed */}
          
          {/* Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-black/40 backdrop-blur-md border border-orange-400/30 rounded-xl p-6 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 shadow-2xl">
              <div className="flex items-center mb-4">
                <BookOpen className="w-8 h-8 text-orange-400 mr-3" />
                <div className="text-3xl font-bold text-orange-400 font-mono">10,000+</div>
              </div>
              <div className="text-gray-300 font-medium">Premium Notes</div>
              <div className="text-xs text-gray-500 mt-1">Curated & Verified</div>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-purple-400/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 shadow-2xl">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-purple-400 mr-3" />
                <div className="text-3xl font-bold text-purple-400 font-mono">5,000+</div>
              </div>
              <div className="text-gray-300 font-medium">Active Students</div>
              <div className="text-xs text-gray-500 mt-1">Growing Community</div>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-pink-400/30 rounded-xl p-6 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 shadow-2xl">
              <div className="flex items-center mb-4">
                <Star className="w-8 h-8 text-pink-400 mr-3" />
                <div className="text-3xl font-bold text-pink-400 font-mono">500+</div>
              </div>
              <div className="text-gray-300 font-medium">Top Contributors</div>
              <div className="text-xs text-gray-500 mt-1">Elite Performers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span>?
            </h2>
            <p className="text-xl text-gray-300">
              The complete <span className="text-orange-400">premium ecosystem</span> for academic success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/40 backdrop-blur-md border border-orange-400/30 rounded-xl p-8 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 text-center" data-testid="card-feature-quality">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <Star className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Premium Quality</h3>
              <p className="text-gray-300">
                All notes are <span className="text-orange-400">expertly reviewed</span> and come from verified top performers.
              </p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-md border border-purple-400/30 rounded-xl p-8 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 text-center" data-testid="card-feature-community">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Users className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Vibrant Community</h3>
              <p className="text-gray-300">
                Connect with <span className="text-purple-400">top students</span>, follow your favorite toppers, and get feedback on notes.
              </p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-md border border-pink-400/30 rounded-xl p-8 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 text-center" data-testid="card-feature-earnings">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Earn from Knowledge</h3>
              <p className="text-gray-300">
                Upload your study materials and <span className="text-pink-400">earn money</span> based on downloads and ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Affordable Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that works best for you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="relative" data-testid="card-pricing-monthly">
              <CardHeader>
                <CardTitle className="text-2xl">Monthly Plan</CardTitle>
                <div className="text-4xl font-bold text-primary">
                  ₹59
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited note downloads</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Access to all subjects</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Follow toppers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Rate and review notes</span>
                </div>
                <Button 
                  className="w-full mt-6" 
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-monthly-plan"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
            
            <Card className="relative border-primary border-2" data-testid="card-pricing-yearly">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  MOST POPULAR
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Yearly Plan</CardTitle>
                <div className="text-4xl font-bold text-primary">
                  ₹499
                  <span className="text-lg font-normal text-muted-foreground">/year</span>
                </div>
                <p className="text-sm text-green-600 font-medium">Save ₹209 (30% off)</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Everything in Monthly</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Early access to new features</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Special topper perks</span>
                </div>
                <Button 
                  className="w-full mt-6" 
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-yearly-plan"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-muted-foreground">
              Real stories from students and toppers who've transformed their learning
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Student Testimonials */}
            <Card className="hover-study-card animate-fade-in" data-testid="testimonial-student-1">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Quote className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground mb-4 italic">
                      "<span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span> saved my semester! I found comprehensive Physics notes that helped me score 95% in my finals. The ₹59/month subscription paid for itself with just one good grade."
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">P</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Priya M.</div>
                        <div className="text-sm text-muted-foreground">Engineering Student, IIT Delhi</div>
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-study-card animate-fade-in" style={{animationDelay: '0.2s'}} data-testid="testimonial-topper-1">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Quote className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground mb-4 italic">
                      "As a topper, I've earned over ₹15,000 by uploading my Chemistry notes. It's amazing how my study materials can help others while generating income for me!"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Arjun K.</div>
                        <div className="text-sm text-muted-foreground">Medical Student, AIIMS</div>
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-study-card animate-fade-in" style={{animationDelay: '0.4s'}} data-testid="testimonial-student-2">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Quote className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground mb-4 italic">
                      "The quality of notes here is incredible! I found detailed Computer Science algorithms that my professors recommended. Much better value than expensive textbooks."
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">R</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Rahul S.</div>
                        <div className="text-sm text-muted-foreground">CS Student, NIT Trichy</div>
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-study-card animate-fade-in" style={{animationDelay: '0.6s'}} data-testid="testimonial-topper-2">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Quote className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground mb-4 italic">
                      "I upload my Mathematics notes after every semester. Students love the step-by-step solutions, and I've built a steady income stream. Win-win for everyone!"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">S</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Sneha D.</div>
                        <div className="text-sm text-muted-foreground">Math Honors, St. Xavier's</div>
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-study-card animate-fade-in" style={{animationDelay: '0.8s'}} data-testid="testimonial-student-3">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Quote className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground mb-4 italic">
                      "Found amazing Biology diagrams and explanations that made complex topics simple. The yearly plan at ₹499 is such good value - saved me thousands on coaching!"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">M</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Meera T.</div>
                        <div className="text-sm text-muted-foreground">Pre-Med Student, DU</div>
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-study-card animate-fade-in" style={{animationDelay: '1s'}} data-testid="testimonial-topper-3">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Quote className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground mb-4 italic">
                      "My Economics notes have been downloaded 500+ times! The platform makes it so easy to share knowledge and earn. Already made ₹8,000 this semester."
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">V</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Vikash P.</div>
                        <div className="text-sm text-muted-foreground">Economics Honors, LSR</div>
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/80 border-2 border-green-300/50 rounded-xl p-6 hover-study-card animate-fade-in">
                <div className="text-3xl font-bold text-green-600 mb-2">4.8/5</div>
                <div className="text-green-700 font-medium">Average Rating</div>
                <div className="text-sm text-muted-foreground mt-1">Based on 2,500+ reviews</div>
              </div>
              <div className="bg-white/80 border-2 border-blue-300/50 rounded-xl p-6 hover-study-card animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
                <div className="text-blue-700 font-medium">Happy Students</div>
                <div className="text-sm text-muted-foreground mt-1">And growing every day</div>
              </div>
              <div className="bg-white/80 border-2 border-purple-300/50 rounded-xl p-6 hover-study-card animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="text-3xl font-bold text-purple-600 mb-2">₹2L+</div>
                <div className="text-purple-700 font-medium">Earned by Toppers</div>
                <div className="text-sm text-muted-foreground mt-1">Total earnings this year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Master Your Studies?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who are already excelling with <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span>
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setShowLoginForm(true)}
            data-testid="button-join-now"
          >
            Join Now - It's Free to Start
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br from-orange-500 via-red-500 to-orange-600">
                <GraduationCap className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                  MasterStudent
                </span>
                <div className="text-xs text-orange-300 font-medium tracking-wider uppercase">
                  ⚡ Learn • Share • Excel
                </div>
              </div>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span>. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
