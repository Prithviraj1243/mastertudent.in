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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Master Your Studies with
            <span className="text-primary"> Top Student Notes</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Access premium study notes from top performers, upload your own materials to earn, 
            and join a community of academic excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-browse-notes"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Notes
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-become-topper"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Become a Topper
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose MasterStudent?
            </h2>
            <p className="text-xl text-muted-foreground">
              The complete ecosystem for academic success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center" data-testid="card-feature-quality">
              <CardHeader>
                <Star className="h-12 w-12 text-secondary mx-auto mb-4" />
                <CardTitle>Premium Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All notes are reviewed by our expert team and come from verified top performers.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center" data-testid="card-feature-community">
              <CardHeader>
                <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
                <CardTitle>Vibrant Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with top students, follow your favorite toppers, and get feedback on notes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center" data-testid="card-feature-earnings">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-secondary mx-auto mb-4" />
                <CardTitle>Earn from Knowledge</CardTitle>
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
