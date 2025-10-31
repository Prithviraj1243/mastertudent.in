import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import ProfileAutoFill from "@/components/profile-auto-fill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Sparkles,
  Phone,
  MapPin,
  School,
  Target,
  CheckCircle,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";

export default function ProfileUpdate() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-pulse ${
                i % 4 === 0 ? 'w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500' :
                i % 4 === 1 ? 'w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500' :
                i % 4 === 2 ? 'w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500' :
                'w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500'
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
      
      <Header />
      <div className="relative z-10 flex">
        <Sidebar />
        <main className="flex-1 p-6" role="main">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              asChild
              variant="ghost" 
              className="bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600 hover:border-slate-500 text-white hover:text-white shadow-sm transition-all duration-300"
            >
              <Link href="/profile">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
          </div>

          {/* Hero Section */}
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 p-8 shadow-2xl">
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg">
                      <Sparkles className="h-12 w-12 text-white animate-bounce" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-2">
                        Smart Profile Setup 🚀
                      </h1>
                      <p className="text-white/90 text-lg font-medium">
                        Auto-fill your details • Save time • Get personalized experience
                      </p>
                    </div>
                  </div>
                  
                  {/* Features Badge */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Phone className="w-5 h-5 text-yellow-300 mr-2 animate-pulse" />
                        <span className="text-sm font-bold text-white">
                          PHONE-BASED AUTO-FILL
                        </span>
                      </div>
                      <div className="text-xs text-white/80">Smart Detection</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-white/90 mb-8 text-lg leading-relaxed mt-6">
                  🎯 Let our AI-powered system automatically detect your location, nearby schools, and suggest relevant preferences based on your phone number. Complete your profile in seconds!
                </p>
              </div>
            </div>
          </section>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/60 backdrop-blur-md border border-blue-500/30 hover:border-blue-400/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-3 shadow-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Auto</Badge>
                </div>
                <div className="text-xl font-bold text-white mb-1">Location Detection</div>
                <div className="text-slate-300 font-medium text-sm">City, State & Pincode</div>
                <div className="text-xs text-blue-400 mt-1 font-medium">📍 Based on Phone Number</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/60 backdrop-blur-md border border-purple-500/30 hover:border-purple-400/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 shadow-lg">
                    <School className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Smart</Badge>
                </div>
                <div className="text-xl font-bold text-white mb-1">School Suggestions</div>
                <div className="text-slate-300 font-medium text-sm">Nearby Institutions</div>
                <div className="text-xs text-purple-400 mt-1 font-medium">🏫 Local Database</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/60 backdrop-blur-md border border-green-500/30 hover:border-green-400/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-3 shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">AI</Badge>
                </div>
                <div className="text-xl font-bold text-white mb-1">Interest Matching</div>
                <div className="text-slate-300 font-medium text-sm">Subject Preferences</div>
                <div className="text-xs text-green-400 mt-1 font-medium">🎯 Personalized</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/60 backdrop-blur-md border border-orange-500/30 hover:border-orange-400/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-3 shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Live</Badge>
                </div>
                <div className="text-xl font-bold text-white mb-1">Career Goals</div>
                <div className="text-slate-300 font-medium text-sm">Future Planning</div>
                <div className="text-xs text-orange-400 mt-1 font-medium">🚀 Trending Paths</div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-600/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <CheckCircle className="h-6 w-6 text-green-400" />
                How Auto-Fill Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">1. Enter Phone</h4>
                  <p className="text-slate-300 text-sm">Provide your phone number for smart detection</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">2. AI Analysis</h4>
                  <p className="text-slate-300 text-sm">Our AI analyzes location and demographic patterns</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">3. Data Fetch</h4>
                  <p className="text-slate-300 text-sm">Automatically populate location and preferences</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">4. Review & Save</h4>
                  <p className="text-slate-300 text-sm">Review suggestions and save your profile</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Auto-Fill Component */}
          <ProfileAutoFill />
        </main>
      </div>
    </div>
  );
}
