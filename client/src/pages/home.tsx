import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useUserStats } from "@/hooks/useUserStats";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import ProfileCompletionPrompt from "@/components/profile-completion-prompt";
import ProfileCompletionPopup from "@/components/profile-completion-popup";
import MasterStudentChatbot from "@/components/master-student-chatbot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  TrendingUp, 
  Star, 
  Download, 
  Eye,
  Calendar,
  Award,
  Users,
  Upload,
  Search,
  Filter,
  Plus,
  FileText,
  Zap,
  Target,
  Coins,
  Crown,
  Sparkles,
  Rocket,
  Layers,
  FolderPlus,
  Trophy
} from "lucide-react";
import { Link } from "wouter";
import NoteCard from "@/components/notes/note-card";
import { useState, useEffect } from "react";

export default function Home() {
  const { user } = useAuth();
  const { stats, subjectStats, isLoading } = useUserStats();
  const { shouldShowPopup, completionPercentage, dismissPopup, completeProfile } = useProfileCompletion();
  
  // Check for stored user profile from new account creation
  const storedProfile = typeof window !== 'undefined' ? localStorage.getItem('userProfile') : null;
  const userProfile = storedProfile ? JSON.parse(storedProfile) : user;
  
  // State for current mode (browse or upload)
  const [currentMode, setCurrentMode] = useState<'browse' | 'upload' | 'dashboard'>('dashboard');
  
  // Check for stored user purpose from purpose selection
  useEffect(() => {
    const userPurpose = localStorage.getItem('userPurpose');
    if (userPurpose === 'download') {
      setCurrentMode('browse');
    } else if (userPurpose === 'upload') {
      setCurrentMode('upload');
    }
  }, []);

  // Fetch trending notes
  const { data: trendingNotesData } = useQuery({
    queryKey: ["/api/notes", { limit: 6 }],
    queryFn: async () => {
      const response = await fetch("/api/notes?limit=6");
      if (!response.ok) throw new Error("Failed to fetch notes");
      return response.json();
    },
  });

  const trendingNotes = trendingNotesData?.notes || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects - Matching Signup Page */}
      <div className="absolute inset-0">
        {/* CRAZY COOL Advanced Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${
                i % 8 === 0 ? 'w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 floating-orb' :
                i % 8 === 1 ? 'w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 particle-float' :
                i % 8 === 2 ? 'w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 wiggle' :
                i % 8 === 3 ? 'w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 animate-spin' :
                i % 8 === 4 ? 'w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 animate-ping' :
                i % 8 === 5 ? 'w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-500 animate-bounce' :
                i % 8 === 6 ? 'w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-500 animate-pulse' :
                'w-3 h-3 bg-gradient-to-r from-teal-400 to-cyan-500 floating-orb'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${3 + Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Morphing Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.2)_1px,transparent_1px)] bg-[size:60px_60px] morphing-gradient" />
        </div>

        {/* Dynamic Glowing Orbs with Advanced Animations */}
        <div className="absolute top-1/4 left-1/6 w-40 h-40 bg-gradient-to-r from-orange-400/30 to-red-500/30 rounded-full blur-2xl floating-orb"></div>
        <div className="absolute bottom-1/4 right-1/6 w-48 h-48 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-2xl particle-float"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-2xl wiggle"></div>
        <div className="absolute bottom-1/2 right-1/3 w-44 h-44 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full blur-2xl floating-orb" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full blur-2xl particle-float" style={{animationDelay: '3s'}}></div>

        {/* Holographic Scan Lines */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"
              style={{
                top: `${20 + i * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animation: 'hologramScan 4s linear infinite'
              }}
            />
          ))}
        </div>
      </div>
      
      <Header />
      <div className="relative z-10 flex">
        <Sidebar currentMode={currentMode} />
        <main className="flex-1 p-6 animate-slide-in-right" role="main">
          {/* Upload-Focused Hero Section */}
          <section className="mb-8" aria-labelledby="hero-heading">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 p-8 shadow-2xl">
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
              </div>
              
              <div className="relative z-10">
                <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg">
                      <Rocket className="h-12 w-12 text-white animate-bounce" />
                    </div>
                    <div>
                      <h1 id="hero-heading" className="text-4xl font-bold text-white mb-2 text-glow">
                        Share Knowledge, Earn Rewards! 🚀
                      </h1>
                      <p className="text-white/90 text-lg font-medium">
                        Upload your notes • Help students • Earn coins instantly
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-300 mr-2 animate-pulse" />
                        <span className="text-sm font-bold text-white">
                          {stats.totalEarnings > 0 ? "EARNING ACTIVE" : "START EARNING"}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-300">
                        ₹{stats.totalEarnings.toLocaleString()}
                      </div>
                      <div className="text-xs text-white/80">Total Earned</div>
                    </div>
                  </div>
                </header>
                
                <p className="text-white/90 mb-8 text-lg leading-relaxed">
                  🎯 Transform your study notes into income! Upload quality content, help fellow students, and earn real money. 
                  Join our community of knowledge creators earning while they share!
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    asChild
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-2 border-white/30 hover:border-white/50 text-lg px-8 py-4 font-bold shadow-xl smooth-transition hover:scale-110 hover-glow ripple bounce-in stagger-1"
                  >
                    <Link href="/upload">
                      <Upload className="mr-2 h-5 w-5 wiggle" />
                      🚀 Upload Notes Now
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white text-lg px-8 py-4 font-bold shadow-xl smooth-transition hover:scale-110 hover-glow ripple bounce-in stagger-2"
                  >
                    <Link href="/uploader-profile">
                      <Crown className="mr-2 h-5 w-5 floating-orb" />
                      💰 My Earnings
                    </Link>
                  </Button>
                  
                </div>
              </div>
            </div>
          </section>

          {/* Upload & Earning Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-slate-800/50 backdrop-blur-md border border-slate-600/50 shadow-xl">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-slate-600/50 rounded-2xl p-3 w-12 h-12 animate-pulse"></div>
                      <div className="bg-slate-600/50 h-4 w-12 rounded animate-pulse"></div>
                    </div>
                    <div className="bg-slate-600/50 h-8 w-16 rounded mb-1 animate-pulse"></div>
                    <div className="bg-slate-600/50 h-4 w-24 rounded mb-1 animate-pulse"></div>
                    <div className="bg-slate-600/50 h-3 w-20 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
            
            <Card className="bg-slate-800/60 backdrop-blur-md border border-green-500/30 hover:border-green-400/50 shadow-xl hover:shadow-2xl smooth-transition card-hover hover-lift slide-in-bottom stagger-1">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-3 shadow-lg floating-orb">
                    <Upload className="h-5 w-5 md:h-6 md:w-6 text-white wiggle" />
                  </div>
                  <div className="text-green-400 text-sm font-bold bounce-in">+15.2%</div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mb-1 text-glow">{stats.notesUploaded.toLocaleString()}</div>
                <div className="text-slate-300 font-medium text-sm md:text-base">Notes Uploaded</div>
                <div className="text-xs text-green-400 mt-1 font-medium particle-float">📈 Total Content</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/60 backdrop-blur-md border border-yellow-500/30 hover:border-yellow-400/50 shadow-xl hover:shadow-2xl smooth-transition card-hover hover-lift slide-in-bottom stagger-2">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-3 shadow-lg particle-float">
                    <Coins className="h-5 w-5 md:h-6 md:w-6 text-white floating-orb" />
                  </div>
                  <div className="text-yellow-400 text-sm font-bold bounce-in">+28.9%</div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mb-1 text-glow">₹{stats.totalEarnings.toLocaleString()}</div>
                <div className="text-slate-300 font-medium text-sm md:text-base">Total Earnings</div>
                <div className="text-xs text-yellow-400 mt-1 font-medium wiggle">💰 This Month: ₹{stats.monthlyEarnings}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/60 backdrop-blur-md border border-purple-500/30 hover:border-purple-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 shadow-lg">
                    <Download className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="text-purple-400 text-sm font-bold">+32.1%</div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{stats.totalDownloads.toLocaleString()}</div>
                <div className="text-slate-300 font-medium text-sm md:text-base">Downloads</div>
                <div className="text-xs text-purple-400 mt-1 font-medium">📊 Your Notes</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/60 backdrop-blur-md border border-blue-500/30 hover:border-blue-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-3 shadow-lg">
                    <Star className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="text-blue-400 text-sm font-bold">+5.7%</div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}</div>
                <div className="text-slate-300 font-medium text-sm md:text-base">Average Rating</div>
                <div className="text-xs text-blue-400 mt-1 font-medium">⭐ Your Content</div>
              </CardContent>
            </Card>
              </>
            )}
          </div>

          {/* Upload Center - Always Visible */}
          <section className="mb-8">
            <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-8 border border-green-500/30 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                  <Upload className="mr-3 h-6 w-6 md:h-8 md:w-8 text-green-400" />
                  Upload Center
                </h2>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 md:px-4 py-1 md:py-2 text-sm">
                  🚀 Earn Money
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Quick Upload */}
                <Card className="bg-slate-700/50 backdrop-blur-md border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-3 md:p-4 w-fit mx-auto mb-4">
                      <Plus className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Quick Upload</h3>
                    <p className="text-slate-300 mb-2 text-sm">Upload your notes instantly and start earning</p>
                    <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 justify-center">
                        <Coins className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-300">Earn 20 coins per verified upload!</span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500" asChild>
                      <Link href="/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Earn Coins
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Subject Management */}
                <Card className="bg-slate-700/50 backdrop-blur-md border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-3 md:p-4 w-fit mx-auto mb-4">
                      <Layers className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Manage Subjects</h3>
                    <p className="text-slate-300 mb-4 text-sm">Organize your content by subjects</p>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500" asChild>
                      <Link href="/my-notes">
                        <Layers className="mr-2 h-4 w-4" />
                        Manage Content
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Earnings Dashboard */}
                <Card className="bg-slate-700/50 backdrop-blur-md border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-3 md:p-4 w-fit mx-auto mb-4">
                      <Target className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Track Earnings</h3>
                    <p className="text-slate-300 mb-4 text-sm">Monitor your income and performance</p>
                    <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500" asChild>
                      <Link href="/analytics">
                        <Target className="mr-2 h-4 w-4" />
                        View Analytics
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Dynamic Content Based on Mode */}
          {currentMode === 'browse' && (
            <section className="mb-8">
              <div className="bg-study-card rounded-3xl p-8 border border-purple-500/30">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Search className="mr-3 h-8 w-8 text-purple-400" />
                  Browse & Download Notes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border border-purple-500/30">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Search by Subject</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Button className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/40">
                          📐 Mathematics
                        </Button>
                        <Button className="bg-blue-600/20 text-blue-300 hover:bg-blue-600/40">
                          🧪 Chemistry
                        </Button>
                        <Button className="bg-green-600/20 text-green-300 hover:bg-green-600/40">
                          ⚡ Physics
                        </Button>
                        <Button className="bg-orange-600/20 text-orange-300 hover:bg-orange-600/40">
                          🧬 Biology
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border border-purple-500/30">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Browse All Notes
                        </Button>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white" asChild>
                          <Link href="/categories">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter by Category
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}

          {currentMode === 'upload' && (
            <section className="mb-8">
              <div className="bg-study-card rounded-3xl p-8 border border-emerald-500/30">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Upload className="mr-3 h-8 w-8 text-emerald-400" />
                  Upload & Earn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border border-emerald-500/30">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Upload Options</h3>
                      <div className="space-y-3">
                        <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white" asChild>
                          <Link href="/upload">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload New Notes
                          </Link>
                        </Button>
                        <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white" asChild>
                          <Link href="/uploader-profile">
                            <Star className="mr-2 h-4 w-4" />
                            My Uploads
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border border-emerald-500/30">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Earning Stats</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Total Earnings:</span>
                          <span className="text-emerald-400 font-bold">₹2,450</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">This Month:</span>
                          <span className="text-green-400 font-bold">₹680</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Downloads:</span>
                          <span className="text-cyan-400 font-bold">156</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}

          {currentMode === 'dashboard' && (
            <section className="mb-8">
              <div className="bg-study-card rounded-3xl p-8 border border-orange-500/30">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Star className="mr-3 h-8 w-8 text-orange-400" />
                  My Dashboard
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-slate-800/50 border border-orange-500/30">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                      <div className="space-y-2 text-sm">
                        <div className="text-slate-300">Downloaded Chemistry Notes</div>
                        <div className="text-slate-300">Earned 50 coins</div>
                        <div className="text-slate-300">Followed 2 toppers</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border border-orange-500/30">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Quick Stats</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-300">Coins:</span>
                          <span className="text-yellow-400">{user?.coinBalance || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Downloads:</span>
                          <span className="text-green-400">{stats.totalDownloads}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Streak:</span>
                          <span className="text-orange-400">7 days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border border-orange-500/30">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Actions</h3>
                      <div className="space-y-2">
                        <Button className="w-full bg-orange-600/20 text-orange-300 hover:bg-orange-600/40" asChild>
                          <Link href="/coin-dashboard">
                            View Full Dashboard
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}

          {/* Subject Categories - Upload Focused */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">📚 Upload by Subject</h2>
              <div className="flex gap-2">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">
                  💰 High Demand
                </Badge>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500">
                  <Link href="/upload">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Add New Subject
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
              {[
                { name: "Mathematics", icon: "📐", demand: "🔥 High", color: "from-blue-500 to-cyan-500" },
                { name: "Physics", icon: "⚛️", demand: "⭐ Medium", color: "from-purple-500 to-pink-500" },
                { name: "Chemistry", icon: "🧪", demand: "📈 Rising", color: "from-green-500 to-emerald-500" },
                { name: "Biology", icon: "🧬", demand: "💎 Stable", color: "from-orange-500 to-red-500" },
                { name: "Computer Science", icon: "💻", demand: "🚀 Trending", color: "from-indigo-500 to-purple-500" },
                { name: "English", icon: "📚", demand: "📖 Steady", color: "from-pink-500 to-rose-500" }
              ].map((category, index) => {
                const subjectStat = subjectStats.find(s => s.subject === category.name);
                const earnings = subjectStat ? `₹${subjectStat.earnings}/month` : '₹0/month';
                const notesCount = subjectStat ? `${subjectStat.notesCount} notes` : '0 notes';
                
                return (
                <Link key={category.name} href={`/upload?subject=${encodeURIComponent(category.name)}`}>
                  <Card 
                    className="hover-lift cursor-pointer border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 bg-slate-800/60 backdrop-blur-md shadow-lg hover:shadow-xl group h-44 md:h-52 flex flex-col"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <CardContent className="p-4 md:p-6 text-center relative overflow-hidden flex-1 flex flex-col justify-between">
                      {/* Background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                      
                      <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex flex-col items-center">
                          <div className="text-3xl md:text-4xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                            {category.icon}
                          </div>
                          <div className="font-bold text-white text-sm mb-2 group-hover:text-orange-400 transition-colors leading-tight">
                            {category.name}
                          </div>
                          <div className="text-xs text-slate-300 mb-2 md:mb-3 font-medium">{earnings}</div>
                        </div>
                        <div className="space-y-2">
                          <Badge 
                            className={`text-xs bg-gradient-to-r ${category.color} text-white px-2 py-1`}
                          >
                            {category.demand}
                          </Badge>
                          <div className="text-xs text-green-400 font-semibold">Click to Upload</div>
                        </div>
                      </div>
                      
                      {/* Upload icon overlay */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={`bg-gradient-to-r ${category.color} p-2 rounded-full`}>
                          <Upload className="h-3 w-3 md:h-4 md:w-4 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                );
              })}
            </div>
          </div>

          {/* Trending This Week - Enhanced */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  🔥 Trending This Week
                </h2>
                <div className="flex gap-2">
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 animate-pulse">
                    📈 Hot
                  </Badge>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                    🚀 +2.3K views
                  </Badge>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                data-testid="button-view-all"
              >
                <Eye className="mr-2 h-4 w-4" />
                View All Notes
              </Button>
            </div>

            {/* Trending Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {trendingNotes.length > 0 ? trendingNotes.map((note: any, index: number) => {
                // Helper function to get subject color
                const getSubjectColor = (subject: string) => {
                  const colors: Record<string, string> = {
                    'Physics': 'from-blue-500 to-cyan-500',
                    'Chemistry': 'from-green-500 to-emerald-500',
                    'Mathematics': 'from-orange-500 to-red-500',
                    'Biology': 'from-teal-500 to-cyan-500',
                    'Computer Science': 'from-purple-500 to-pink-500',
                    'English': 'from-indigo-500 to-purple-500'
                  };
                  return colors[subject] || 'from-gray-500 to-slate-500';
                };

                // Helper function to get trending badge
                const getTrendingBadge = (index: number) => {
                  const badges = ['🏆 Top Rated', '🔥 Hot', '💎 Premium', '📈 Rising', '🎯 Targeted', '📚 Classic'];
                  return badges[index % badges.length];
                };

                return (
                  <div key={note.id} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-600/50 hover:border-slate-500/70 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-4 md:p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`bg-gradient-to-r ${getSubjectColor(note.subject)} rounded-xl p-3 shadow-lg`}>
                            <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
                          </div>
                          <div className="text-right">
                            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs mb-1">
                              {getTrendingBadge(index)}
                            </Badge>
                            <div className="text-xs text-green-400 font-semibold">+{Math.floor(Math.random() * 50 + 20)}% this week</div>
                          </div>
                        </div>

                        {/* Content */}
                        <h3 className="font-bold text-white text-base md:text-lg mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                          {note.title}
                        </h3>
                        <p className="text-sm text-slate-300 mb-3">by {note.topperName || 'Anonymous'}</p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-semibold text-white">{note.averageRating ? note.averageRating.toFixed(1) : '4.5'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-slate-300">{(note.downloadsCount || Math.floor(Math.random() * 2000 + 500)).toLocaleString()}</span>
                          </div>
                          <Badge className={`bg-gradient-to-r ${getSubjectColor(note.subject)} text-white text-xs`}>
                            {note.subject}
                          </Badge>
                        </div>

                        {/* Action Only */}
                        <div className="flex justify-end">
                          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm px-4 py-2" asChild>
                            <Link href={`/notes/${note.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              }) : (
                // Loading skeleton or empty state
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-600/50 shadow-xl">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-slate-600/50 rounded-xl p-3 w-12 h-12 animate-pulse"></div>
                          <div className="text-right">
                            <div className="bg-slate-600/50 h-4 w-16 rounded mb-1 animate-pulse"></div>
                            <div className="bg-slate-600/50 h-3 w-20 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="bg-slate-600/50 h-6 w-full rounded mb-2 animate-pulse"></div>
                        <div className="bg-slate-600/50 h-4 w-32 rounded mb-3 animate-pulse"></div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-slate-600/50 h-4 w-12 rounded animate-pulse"></div>
                          <div className="bg-slate-600/50 h-4 w-16 rounded animate-pulse"></div>
                          <div className="bg-slate-600/50 h-4 w-20 rounded animate-pulse"></div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-slate-600/50 h-8 w-24 rounded animate-pulse"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">⚡ Live Activity</h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">Real-time updates</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "🎯", text: "Arjun uploaded new Physics notes", time: "2 min ago", color: "from-blue-500 to-cyan-500" },
                { icon: "📚", text: "New Chemistry notes uploaded by Priya", time: "5 min ago", color: "from-green-500 to-emerald-500" },
                { icon: "⭐", text: "Rahul's DSA notes got 5-star rating", time: "8 min ago", color: "from-yellow-500 to-orange-500" },
                { icon: "🏆", text: "Sneha reached 1000+ downloads milestone", time: "12 min ago", color: "from-purple-500 to-pink-500" }
              ].map((activity, index) => (
                <Card key={index} className="bg-slate-800/60 backdrop-blur-md border border-slate-600/50 hover:border-slate-500/70 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`bg-gradient-to-r ${activity.color} rounded-full p-2 text-white text-lg`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium mb-1">{activity.text}</p>
                        <p className="text-xs text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                🏆 Top Performers This Month
              </h2>
              <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white" asChild>
                <Link href="/leaderboard">
                  <Trophy className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { rank: 1, name: "Arjun Sharma", notes: 23, rating: 4.9, badge: "👑 Champion", color: "from-yellow-500 to-orange-500" },
                { rank: 2, name: "Priya Patel", notes: 18, rating: 4.8, badge: "🥈 Runner-up", color: "from-gray-400 to-gray-600" },
                { rank: 3, name: "Rahul Kumar", notes: 15, rating: 4.7, badge: "🥉 Third Place", color: "from-orange-600 to-red-600" }
              ].map((performer, index) => (
                <Card key={index} className="bg-slate-800/60 backdrop-blur-md border border-yellow-500/30 hover:border-yellow-400/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className={`bg-gradient-to-r ${performer.color} rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <span className="text-lg md:text-2xl font-bold text-white">#{performer.rank}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">{performer.name}</h3>
                    <Badge className={`bg-gradient-to-r ${performer.color} text-white mb-3`}>
                      {performer.badge}
                    </Badge>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Notes:</span>
                        <span className="font-bold text-white">{performer.notes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-bold text-white">{performer.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>


        </main>
      </div>
      
      {/* Master Student Chatbot */}
      <MasterStudentChatbot />
      
      {/* Profile Completion Prompt */}
      <ProfileCompletionPrompt />
      
      {/* Profile Completion Popup */}
      <ProfileCompletionPopup 
        user={user}
        isOpen={shouldShowPopup}
        onClose={dismissPopup}
        onComplete={completeProfile}
      />
    </div>
  );
}
