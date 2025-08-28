import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, GraduationCap, Star, Users, BookOpen, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100 border-b border-orange-300/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-300/30 via-pink-300/30 to-purple-300/30 animate-trading-pulse"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-xl animate-glow-pulse border-2 border-white/20">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-lg blur-sm opacity-75"></div>
                  <div className="relative bg-white rounded-lg p-1 transform hover:rotate-12 transition-transform duration-300">
                    <div className="text-sm font-black bg-gradient-to-br from-orange-500 to-pink-500 bg-clip-text text-transparent">
                      MS
                    </div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">MasterStudent</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                className="bg-gradient-to-r from-green-400 to-emerald-400 text-white hover:from-green-300 hover:to-emerald-300 border-2 border-green-300/50 hover:border-emerald-300 animate-interactive-hover shadow-lg" 
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                🔐 Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 text-white hover:from-orange-300 hover:via-pink-300 hover:to-purple-300 border-2 border-orange-300/50 hover:border-yellow-300 animate-interactive-hover shadow-lg"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-get-started"
              >
                🚀 Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-200/30 via-pink-200/30 to-purple-200/30 animate-morphingGlow"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gray-800">Master Your Studies with</span>
              <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-pulse-slow"> Top Student Notes</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto animate-slide-up">
              Access premium study notes from top performers, upload your own materials to earn, 
              and join a community of academic excellence.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-bounce-in">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 text-white hover:from-orange-300 hover:via-pink-300 hover:to-purple-300 hover-trading-card animate-interactive-hover border-2 border-orange-300/50 hover:border-yellow-300 shadow-xl"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-browse-notes"
            >
              <BookOpen className="mr-2 h-5 w-5 animate-glow-pulse" />
              📈 Browse Notes
            </Button>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 text-white hover:from-green-300 hover:via-emerald-300 hover:to-teal-300 hover-trading-card animate-interactive-hover border-2 border-green-300/50 hover:border-teal-300 shadow-xl"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-become-topper"
            >
              <TrendingUp className="mr-2 h-5 w-5 animate-glow-pulse" />
              💰 Become a Topper
            </Button>
          </div>
          
          {/* Floating Elements - Removed */}
          
          {/* Stats Preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/80 border-2 border-orange-200 rounded-xl p-6 hover-trading-card animate-interactive-hover shadow-xl">
              <div className="text-3xl font-bold text-orange-600 mb-2 animate-number-counter">10,000+</div>
              <div className="text-orange-700 font-medium">Quality Notes</div>
            </div>
            <div className="bg-white/80 border-2 border-green-200 rounded-xl p-6 hover-trading-card animate-interactive-hover shadow-xl" style={{animationDelay: '0.1s'}}>
              <div className="text-3xl font-bold text-green-600 mb-2 animate-number-counter">5,000+</div>
              <div className="text-green-700 font-medium">Active Students</div>
            </div>
            <div className="bg-white/80 border-2 border-purple-200 rounded-xl p-6 hover-trading-card animate-interactive-hover shadow-xl" style={{animationDelay: '0.2s'}}>
              <div className="text-3xl font-bold text-purple-600 mb-2 animate-number-counter">500+</div>
              <div className="text-purple-700 font-medium">Top Contributors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose MasterStudent?
            </h2>
            <p className="text-xl text-muted-foreground">
              The complete ecosystem for academic success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center card-enhanced hover-lift animate-slide-up" data-testid="card-feature-quality">
              <CardHeader>
                <div className="relative mb-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center hover-scale">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">Premium Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All notes are reviewed by our expert team and come from verified top performers.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-enhanced hover-lift animate-slide-up" data-testid="card-feature-community" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <div className="relative mb-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center hover-scale">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">Vibrant Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with top students, follow your favorite toppers, and get feedback on notes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-enhanced hover-lift animate-slide-up" data-testid="card-feature-earnings" style={{animationDelay: '0.4s'}}>
              <CardHeader>
                <div className="relative mb-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center hover-scale">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">Earn from Knowledge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload your study materials and earn money based on downloads and ratings.
                </p>
              </CardContent>
            </Card>
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
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Best Value
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

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Master Your Studies?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who are already excelling with MasterStudent
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = '/api/login'}
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
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-primary-foreground text-sm" />
              </div>
              <span className="text-xl font-bold text-foreground">MasterStudent</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 MasterStudent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
