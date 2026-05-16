import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Download, 
  Upload, 
  BookOpen,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';
import { Link, useLocation } from "wouter";
import SubscriptionModal from "@/components/subscription-modal";
import { useToast } from "@/hooks/use-toast";

export default function PurposeSelection() {
  const [selectedPurpose, setSelectedPurpose] = useState<'download' | 'upload' | null>(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handlePurposeSelect = (purpose: 'download' | 'upload') => {
    if (purpose === 'download') {
      // Show subscription modal for download
      setSubscriptionModalOpen(true);
    } else {
      // For upload, proceed with original flow
      setSelectedPurpose(purpose);
      
      // Add a slight delay for animation effect
      setTimeout(() => {
        // Store user's selected purpose for later use
        localStorage.setItem('userPurpose', purpose);
        
        // Redirect to home page
        setLocation('/home');
      }, 800);
    }
  };

  const handleSubscribe = (plan: string) => {
    // Navigate to subscription page with selected plan
    setLocation(`/subscribe?plan=${plan}&returnTo=/download-notes`);
    setSubscriptionModalOpen(false);
  };

  const handleStartTrial = () => {
    // Store trial status and redirect to download notes
    localStorage.setItem('userStatus', 'trial');
    localStorage.setItem('trialDownloads', '0');
    localStorage.setItem('userPurpose', 'download');
    
    toast({
      title: "Trial Started!",
      description: "You now have 3 free downloads. Enjoy exploring our notes!",
    });
    
    setSubscriptionModalOpen(false);
    setLocation('/download-notes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects - Matching Signup Page */}
      <div className="absolute inset-0">
        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${
                i % 4 === 0 ? 'w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 animate-bounce' :
                i % 4 === 1 ? 'w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 animate-pulse' :
                i % 4 === 2 ? 'w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 animate-ping' :
                'w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 animate-spin'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Rotating Hexagons */}
          <div
            className="absolute top-16 left-8 w-16 h-16 border-2 border-cyan-400/30 animate-spin"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              animationDuration: '8s'
            }}
          />
          
          {/* Pulsing Squares */}
          <div className="absolute top-1/3 right-16 w-12 h-12 border border-purple-400/40 bg-purple-400/10 animate-pulse transform rotate-45"></div>
          
          {/* Bouncing Circles */}
          <div className="absolute bottom-1/3 left-1/4 w-20 h-20 rounded-full border-2 border-pink-400/30 animate-bounce" style={{animationDuration: '3s'}}></div>
          
          {/* Floating Diamonds */}
          <div className="absolute top-2/3 right-1/3 w-8 h-8 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 transform rotate-45 animate-pulse" style={{animationDelay: '1s'}}></div>
          
          {/* Spinning Triangles */}
          <div 
            className="absolute bottom-20 right-12 w-10 h-10 border-2 border-yellow-400/30 animate-spin"
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              animationDuration: '6s'
            }}
          />
        </div>

        {/* Data Streams */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"
              style={{
                top: `${20 + i * 15}%`,
                width: '200px',
                left: '-200px',
                animation: `slideRight 4s linear infinite ${i * 0.8}s`
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
      <main className="relative z-10 container mx-auto px-6 py-12 flex items-center justify-center min-h-[80vh]">
        <div className="max-w-4xl w-full">
          {/* Welcome Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3 mb-6">
              <Sparkles className="h-5 w-5 text-purple-300 animate-pulse" />
              <span className="text-purple-200 font-medium">Welcome to <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span></span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Choose Your
              <br />
              <span className="text-white">
                Purpose
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Select what you want to do and join thousands of students in the learning revolution
            </p>
          </div>

          {/* Purpose Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Enhanced Download Notes Card */}
            <div 
              className={`group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                selectedPurpose === 'download' 
                  ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-400 scale-105' 
                  : 'bg-black/20 hover:bg-black/30 border-cyan-400/20 hover:border-cyan-400/40'
              } backdrop-blur-xl border-2 rounded-xl shadow-2xl relative overflow-hidden`}
              onClick={() => handlePurposeSelect('download')}
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5 animate-pulse"></div>
              
              {/* Scanning Line Effect */}
              <div 
                className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                style={{
                  animation: 'slideRight 3s linear infinite'
                }}
              />
              
              <Card className="bg-transparent border-0 relative z-10">
              <CardContent className="p-8 text-center">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto group-hover:animate-bounce">
                    <Download className="h-10 w-10 text-white" />
                  </div>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                  For Downloading Notes
                </h3>

                {/* Description */}
                <p className="text-gray-300 mb-6 text-lg">
                  Access premium study materials from top students and boost your academic performance
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center gap-3 text-gray-200">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>10,000+ Quality Notes</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-gray-200">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-200"></div>
                    <span>All Subjects & Exams</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-gray-200">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
                    <span>Instant Downloads</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg group-hover:animate-pulse">
                  <Download className="mr-2 h-5 w-5" />
                  Start Downloading
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
              </Card>
            </div>

            {/* Enhanced Upload Notes Card */}
            <div 
              className={`group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                selectedPurpose === 'upload' 
                  ? 'bg-gradient-to-br from-green-600/30 to-teal-600/30 border-green-400 scale-105' 
                  : 'bg-black/20 hover:bg-black/30 border-green-400/20 hover:border-green-400/40'
              } backdrop-blur-xl border-2 rounded-xl shadow-2xl relative overflow-hidden`}
              onClick={() => handlePurposeSelect('upload')}
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-teal-500/5 to-cyan-500/5 animate-pulse"></div>
              
              {/* Scanning Line Effect */}
              <div 
                className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                style={{
                  animation: 'slideRight 3s linear infinite 1.5s'
                }}
              />
              
              <Card className="bg-transparent border-0 relative z-10">
              <CardContent className="p-8 text-center">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto group-hover:animate-bounce">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl mx-auto opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors">
                  For Uploading Notes
                </h3>

                {/* Description */}
                <p className="text-gray-300 mb-6 text-lg">
                  Share your notes and earn coins for each download while helping fellow students
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center gap-3 text-gray-200">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Earn ₹50-500 per Download</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-gray-200">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-200"></div>
                    <span>70% Revenue Share</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-gray-200">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
                    <span>Build Your Reputation</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 text-lg group-hover:animate-pulse">
                  <Upload className="mr-2 h-5 w-5" />
                  Start Earning
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-6 w-6 text-purple-400" />
                <span className="text-3xl font-bold text-white">5,000+</span>
              </div>
              <p className="text-gray-300">Active Students</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="h-6 w-6 text-pink-400" />
                <span className="text-3xl font-bold text-white">10,000+</span>
              </div>
              <p className="text-gray-300">Quality Notes</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-6 w-6 text-green-400" />
                <span className="text-3xl font-bold text-white">₹50L+</span>
              </div>
              <p className="text-gray-300">Earned by Students</p>
            </div>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {selectedPurpose && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-white text-xl font-medium">
              {selectedPurpose === 'upload' ? 'Taking you to MasterStudent Dashboard...' : 'Processing...'}
            </p>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSubscribe={handleSubscribe}
        onStartTrial={handleStartTrial}
        noteTitle="Premium Study Materials"
      />
    </div>
  );
}
