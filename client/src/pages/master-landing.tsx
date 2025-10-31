import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  Upload, 
  Users, 
  Award,
  Star,
  Download,
  TrendingUp,
  User,
  GraduationCap
} from 'lucide-react';
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function MasterLanding() {
  const { user, isAuthenticated } = useAuth();
  
  // Check for stored user profile
  const storedProfile = typeof window !== 'undefined' ? localStorage.getItem('userProfile') : null;
  const userProfile = storedProfile ? JSON.parse(storedProfile) : user;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Advanced Web3 Background Effects */}
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
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"
              style={{
                top: `${15 + i * 12}%`,
                width: '250px',
                left: '-250px',
                animation: `slideAcross 5s linear infinite ${i * 1}s`
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
      {/* Enhanced Header with Web3 Styling */}
      <header className="flex items-center justify-between p-6 relative z-10">
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
        
        {/* Enhanced User Profile */}
        {userProfile ? (
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 shadow-2xl">
            {userProfile.picture ? (
              <img 
                src={userProfile.picture} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border-2 border-cyan-400/50"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="text-left">
              <div className="text-sm font-medium text-white">
                {userProfile.firstName || userProfile.name?.split(' ')[0]} {userProfile.lastName || userProfile.name?.split(' ').slice(1).join(' ')}
              </div>
              {userProfile.class && (
                <div className="text-xs text-gray-300">
                  {userProfile.class} • {userProfile.school}
                </div>
              )}
            </div>
          </div>
        ) : (
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-6 py-2 rounded-full shadow-xl border border-cyan-400/30">
            Get Started
          </Button>
        )}
      </header>

      {/* Enhanced Hero Section */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-16">
          {/* Web3 Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-full mb-8">
            <Star className="w-4 h-4 text-orange-400 mr-2" />
            <span className="text-orange-400 text-sm font-medium">Premium Study Platform</span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Master Your Studies with
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              Top Student Notes
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Access premium study notes from top performers, upload your own materials to 
            earn, and join a <span className="text-orange-400 font-semibold">vibrant community</span> of academic excellence.
          </p>

          {/* Enhanced Action Button with Glow Effects */}
          <div className="flex justify-center mb-16">
            <Button 
              asChild
              className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-500 hover:via-red-500 hover:to-pink-500 text-white text-xl px-12 py-5 font-bold rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-orange-500/50 hover:shadow-2xl border border-orange-400/30 hover:border-orange-300/60"
              style={{
                boxShadow: '0 0 30px rgba(251, 146, 60, 0.4), 0 0 60px rgba(251, 146, 60, 0.2)',
                filter: 'drop-shadow(0 0 12px rgba(251, 146, 60, 0.5))'
              }}
            >
              <Link href="/purpose-selection">
                <GraduationCap className="mr-3 h-6 w-6" />
                🚀 Start Your Journey
              </Link>
            </Button>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-black/40 backdrop-blur-md border border-orange-400/30 rounded-xl p-6 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 shadow-2xl text-center">
              <div className="mb-4">
                <BookOpen className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-400 font-mono">10,000+</div>
              </div>
              <div className="text-gray-300 font-medium">Premium Notes</div>
              <div className="text-xs text-gray-500 mt-1">Curated & Verified</div>
            </div>
            
            <div className="bg-black/40 backdrop-blur-md border border-purple-400/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 shadow-2xl text-center">
              <div className="mb-4">
                <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-400 font-mono">5,000+</div>
              </div>
              <div className="text-gray-300 font-medium">Active Students</div>
              <div className="text-xs text-gray-500 mt-1">Growing Community</div>
            </div>
            
            <div className="bg-black/40 backdrop-blur-md border border-pink-400/30 rounded-xl p-6 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 shadow-2xl text-center">
              <div className="mb-4">
                <Star className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-pink-400 font-mono">500+</div>
              </div>
              <div className="text-gray-300 font-medium">Top Contributors</div>
              <div className="text-xs text-gray-500 mt-1">Elite Performers</div>
            </div>
          </div>
        </div>

        {/* Enhanced Why Choose Section */}
        <section className="text-center mb-16 relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            The complete <span className="text-orange-400">premium ecosystem</span> for academic success
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/40 backdrop-blur-md border border-orange-400/30 rounded-xl p-8 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <Award className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Quality Assured</h3>
              <p className="text-gray-300">
                All notes are <span className="text-orange-400">expertly reviewed</span> and come from verified top performers.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-purple-400/30 rounded-xl p-8 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Users className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Community Driven</h3>
              <p className="text-gray-300">
                Connect with <span className="text-purple-400">top students</span>, follow your favorite toppers, and get feedback on notes.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-pink-400/30 rounded-xl p-8 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Earn While Learning</h3>
              <p className="text-gray-300">
                Upload your study materials and <span className="text-pink-400">earn money</span> based on downloads and ratings.
              </p>
            </div>
          </div>
        </section>

        {/* Enhanced Pricing Section */}
        <section className="mb-16 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, Affordable Pricing
            </h2>
            <p className="text-xl text-gray-300">
              Choose the plan that <span className="text-orange-400">works best</span> for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Enhanced Monthly Plan */}
            <div className="bg-black/40 backdrop-blur-md border border-purple-400/30 rounded-xl p-8 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Monthly Plan</h3>
                <div className="text-5xl font-bold text-purple-400 mb-2">
                  ₹59
                  <span className="text-lg font-normal text-gray-300">/month</span>
                </div>
                <div className="text-sm text-gray-400">Perfect for trying out</div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Unlimited note downloads</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Access to all subjects</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Follow top performers</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Rate and review notes</span>
                </div>
              </div>
              
              <Button 
                asChild
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 text-lg font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 hover:shadow-2xl border border-indigo-400/30 hover:border-indigo-300/60"
                style={{
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.1)',
                  filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))'
                }}
              >
                <Link href="/purpose-selection">
                  Choose Monthly Plan
                </Link>
              </Button>
            </div>

            {/* Enhanced Yearly Plan - Most Popular */}
            <div className="bg-black/40 backdrop-blur-md border border-orange-400/40 rounded-xl p-8 hover:border-orange-400/60 transition-all duration-300 hover:scale-105 shadow-2xl relative">
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl animate-pulse">
                  🔥 MOST POPULAR
                </span>
              </div>
              
              <div className="text-center mb-8 pt-4">
                <h3 className="text-2xl font-bold text-white mb-4">Yearly Plan</h3>
                <div className="text-5xl font-bold text-orange-400 mb-2">
                  ₹499
                  <span className="text-lg font-normal text-gray-300">/year</span>
                </div>
                <div className="text-green-400 font-bold text-lg">
                  💰 Save ₹209 (30% off)
                </div>
                <div className="text-sm text-gray-400 mt-2">Best value for serious students</div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Everything in Monthly Plan</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">🚀 Priority support & faster downloads</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">⚡ Early access to new features</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">👑 Special topper perks & rewards</span>
                </div>
              </div>
              
              <Button 
                asChild
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-4 text-lg font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/50 hover:shadow-2xl border border-amber-400/30 hover:border-amber-300/60"
                style={{
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.1)',
                  filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))'
                }}
              >
                <Link href="/purpose-selection">
                  🚀 Choose Yearly Plan
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Enhanced Community Testimonials Section */}
        <section className="mb-16 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              💬 What Our Community Says
            </h2>
            <p className="text-xl text-gray-300 mb-4">
              Real stories from <span className="text-orange-400">students and toppers</span> who've transformed their learning
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-current" />
              ))}
              <span className="text-white ml-2 font-semibold">4.9/5 from 2,500+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Enhanced Testimonial 1 */}
            <div className="bg-black/40 backdrop-blur-md border border-purple-400/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div>
                  <div className="font-bold text-white">Priya M.</div>
                  <div className="text-sm text-purple-300">Engineering Student, IIT Delhi</div>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 italic leading-relaxed">
                "🚀 <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span> saved my semester! I found comprehensive Physics notes that helped me score <span className="text-purple-400 font-semibold">95% in my finals</span>."
              </p>
            </div>

            {/* Enhanced Testimonial 2 */}
            <div className="bg-black/40 backdrop-blur-md border border-green-400/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300 hover:scale-105 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <div className="font-bold text-white">Arjun K.</div>
                  <div className="text-sm text-green-300">Medical Student, AIIMS</div>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 italic leading-relaxed">
                "💰 As a topper, I've earned over <span className="text-green-400 font-semibold">₹15,000</span> by uploading my Chemistry notes. Great platform!"
              </p>
            </div>

            {/* Enhanced Testimonial 3 */}
            <div className="bg-black/40 backdrop-blur-md border border-orange-400/30 rounded-xl p-6 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <div>
                  <div className="font-bold text-white">Rahul S.</div>
                  <div className="text-sm text-orange-300">CS Student, NIT Trichy</div>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 italic leading-relaxed">
                "📚 The quality of notes here is incredible! Found detailed <span className="text-orange-400 font-semibold">algorithms</span> that my professors recommended."
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
