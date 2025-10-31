import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  Download, 
  Crown,
  Sparkles,
  ArrowRight,
  Gift
} from 'lucide-react';
import { Link, useLocation } from "wouter";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Update user status to premium
    localStorage.setItem('userStatus', 'premium');
    localStorage.removeItem('trialDownloads'); // Clear trial data
    
    // Confetti effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Create confetti effect (simplified version)
      // In a real app, you'd use a library like canvas-confetti
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 opacity-20">
          <Crown className="w-full h-full text-yellow-400 animate-spin" style={{animationDuration: '10s'}} />
        </div>
        <div className="absolute top-20 right-20 w-16 h-16 opacity-30">
          <Sparkles className="w-full h-full text-cyan-400 animate-pulse" style={{animationDuration: '2s'}} />
        </div>
        <div className="absolute bottom-20 left-20 w-24 h-24 opacity-15">
          <Gift className="w-full h-full text-pink-400 animate-bounce" style={{animationDuration: '3s'}} />
        </div>
        <div className="absolute bottom-10 right-10 w-18 h-18 opacity-25">
          <CheckCircle className="w-full h-full text-green-400 animate-ping" style={{animationDuration: '2s'}} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Success Particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-60 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-3xl w-full relative z-10">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>

        {/* Success Message */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Crown className="h-10 w-10 text-yellow-400" />
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Payment Successful!
              </h1>
              <div className="relative">
                <Crown className="h-10 w-10 text-yellow-400" />
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              </div>
            </div>
            
            <p className="text-2xl text-white mb-8">
              Welcome to <span className="font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span> Premium! 🎉
            </p>

            {/* Premium Benefits */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">Your Premium Benefits</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-700">Unlimited note downloads</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-700">Access to all subjects</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-700">Premium support</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-700">Ad-free experience</span>
                </div>
              </div>
            </div>

            {/* Welcome Bonus */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-6 w-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800">Welcome Bonus!</h3>
              </div>
              <p className="text-gray-700">
                As a new premium member, you get <span className="font-bold text-orange-600">100 bonus coins</span> to tip your favorite note creators!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
              >
                <Link href="/download-notes">
                  <Download className="mr-2 h-5 w-5" />
                  Start Downloading
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                variant="outline"
                asChild
                className="px-8 py-3 text-lg border-2 border-purple-200 hover:bg-purple-50"
              >
                <Link href="/profile">
                  View Profile
                </Link>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                A confirmation email has been sent to your registered email address.
                <br />
                Need help? Contact our support team anytime.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Floating Elements */}
        <div className="fixed top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-60"></div>
        <div className="fixed top-32 right-20 w-3 h-3 bg-pink-400 rounded-full animate-pulse opacity-50"></div>
        <div className="fixed bottom-20 left-20 w-5 h-5 bg-purple-400 rounded-full animate-ping opacity-40"></div>
        <div className="fixed bottom-32 right-10 w-3 h-3 bg-green-400 rounded-full animate-bounce opacity-60"></div>
      </div>
    </div>
  );
}
