import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, GraduationCap, Star, Users, BookOpen, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-primary-foreground text-sm" />
              </div>
              <span className="text-xl font-bold text-foreground">MasterStudent</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-orange-500/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Master Your Studies with</span>
              <span className="block text-white hero-gradient-text animate-pulse-slow"> Top Student Notes</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto animate-slide-up">
              Access premium study notes from top performers, upload your own materials to earn, 
              and join a community of academic excellence.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-bounce-in">
            <Button 
              size="lg" 
              className="button-glow bg-white text-blue-600 hover:bg-white/90 hover-scale"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-browse-notes"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Notes
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 hover-scale"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-become-topper"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Become a Topper
            </Button>
          </div>
          
          {/* Floating Elements - Removed */}
          
          {/* Stats Preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="glass-effect rounded-lg p-6 hover-lift">
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-white/80">Quality Notes</div>
            </div>
            <div className="glass-effect rounded-lg p-6 hover-lift" style={{animationDelay: '0.1s'}}>
              <div className="text-3xl font-bold text-white mb-2">5,000+</div>
              <div className="text-white/80">Active Students</div>
            </div>
            <div className="glass-effect rounded-lg p-6 hover-lift" style={{animationDelay: '0.2s'}}>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-white/80">Top Contributors</div>
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
