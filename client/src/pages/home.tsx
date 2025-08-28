import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
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
  Users
} from "lucide-react";
import { Link } from "wouter";
import NoteCard from "@/components/notes/note-card";

export default function Home() {
  const { user } = useAuth();

  // Fetch trending notes
  const { data: trendingNotes } = useQuery({
    queryKey: ["/api/notes", { limit: 6 }],
    queryFn: async () => {
      const response = await fetch("/api/notes?limit=6");
      if (!response.ok) throw new Error("Failed to fetch notes");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-trading-dark relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-purple-600/20 to-cyan-600/20 animate-trading-pulse"></div>
      </div>
      
      <Header />
      <div className="relative z-10 flex">
        <Sidebar />
        <main className="flex-1 p-6 animate-slide-in-right">
          {/* Trading Hub Hero Section */}
          <div className="mb-8">
            <div className="bg-trading-card rounded-3xl p-8 border border-slate-600/30 relative overflow-hidden hover-glow-intense">
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl animate-glow-pulse">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent animate-scale-in">
                      Welcome to TradePulse Hub, {(user as any)?.firstName || 'Trader'}! ⚡
                    </h1>
                    <p className="text-slate-300 text-lg font-medium">
                      Your learning exchange is live • Portfolio active
                    </p>
                  </div>
                </div>
                
                <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                  🎯 Welcome to the ultimate education trading platform. Buy, sell, and exchange knowledge with real-time coin rewards. 
                  Join thousands of student traders earning while they learn!
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 hover-trading-card animate-interactive-hover text-lg px-8 py-4 font-bold shadow-2xl border-2 border-pink-400/50 hover:border-yellow-400"
                    asChild
                  >
                    <Link href="/catalog" data-testid="button-browse-all">
                      <BookOpen className="mr-2 h-5 w-5 text-white animate-glow-pulse" />
                      <span className="text-white font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">📈 Browse Notes</span>
                    </Link>
                  </Button>
                  {((user as any)?.role === 'topper' || (user as any)?.role === 'admin') && (
                    <Button 
                      className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 hover-trading-card animate-interactive-hover text-lg px-8 py-4 font-bold border-2 border-emerald-400/50 hover:border-cyan-400"
                      asChild
                    >
                      <Link href="/upload" data-testid="button-upload">
                        <TrendingUp className="mr-2 h-5 w-5 text-white animate-glow-pulse" />
                        💰 Start Trading
                      </Link>
                    </Button>
                  )}
                  <Button 
                    className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white hover:from-orange-500 hover:via-red-500 hover:to-pink-500 hover-trading-card animate-interactive-hover text-lg px-8 py-4 font-bold border-2 border-orange-400/50 hover:border-pink-400"
                    asChild
                  >
                    <Link href="/coin-dashboard" data-testid="button-portfolio">
                      <Star className="mr-2 h-5 w-5 text-white animate-glow-pulse" />
                      💎 View Portfolio
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Live Trading Badge */}
              <div className="absolute top-4 right-4 bg-trading-card rounded-2xl p-4 border border-green-500/30 animate-glow-pulse">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-ping mr-2"></div>
                    <span className="text-xs font-bold text-green-300">LIVE TRADING</span>
                  </div>
                  <div className="text-sm font-bold text-green-400 animate-value-up">+24.5%</div>
                  <div className="text-xs text-slate-400">Portfolio Growth</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-trading-card border-2 border-pink-500/50 hover-trading-card group animate-slide-in-right animate-interactive-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-2xl p-3 animate-glow-pulse">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-cyan-400 text-sm font-bold animate-value-up">+15.2%</div>
                </div>
                <div className="text-2xl font-bold text-cyan-300 mb-1 animate-number-counter">10,847</div>
                <div className="text-pink-200 font-medium">Active Assets</div>
                <div className="text-xs text-purple-300 mt-1">📈 Market Volume</div>
              </CardContent>
            </Card>
            
            <Card className="bg-trading-card border-2 border-emerald-500/50 hover-trading-card group animate-slide-in-right animate-interactive-hover" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl p-3 animate-glow-pulse">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-yellow-400 text-sm font-bold animate-value-up">+8.9%</div>
                </div>
                <div className="text-2xl font-bold text-emerald-300 mb-1 animate-number-counter">5,234</div>
                <div className="text-teal-200 font-medium">Active Traders</div>
                <div className="text-xs text-cyan-300 mt-1">💼 Online Now</div>
              </CardContent>
            </Card>
            
            <Card className="bg-trading-card border border-purple-500/30 hover-trading-card group animate-slide-in-right" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 animate-glow-pulse">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-green-400 text-sm font-bold animate-value-up">+32.1%</div>
                </div>
                <div className="text-2xl font-bold text-white mb-1 animate-number-counter">52,941</div>
                <div className="text-slate-300 font-medium">Total Trades</div>
                <div className="text-xs text-slate-400 mt-1">📊 This Month</div>
              </CardContent>
            </Card>
            
            <Card className="bg-trading-card border border-yellow-500/30 hover-trading-card group animate-slide-in-right" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-3 animate-glow-pulse">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-green-400 text-sm font-bold animate-value-up">+5.7%</div>
                </div>
                <div className="text-2xl font-bold text-white mb-1 animate-number-counter">4.9</div>
                <div className="text-slate-300 font-medium">Market Rating</div>
                <div className="text-xs text-slate-400 mt-1">⭐ Platform Score</div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Categories */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gradient animate-fade-in">🎯 Explore by Subject</h2>
              <Badge className="bg-gradient-secondary text-white px-4 py-2 animate-pulse-slow">
                ✨ Most Popular
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { name: "Mathematics", icon: "📐", count: "2,500+ notes", color: "subject-math", popularity: "🔥 Hot" },
                { name: "Physics", icon: "⚛️", count: "1,800+ notes", color: "subject-physics", popularity: "⭐ Popular" },
                { name: "Chemistry", icon: "🧪", count: "1,600+ notes", color: "subject-chemistry", popularity: "📈 Rising" },
                { name: "Biology", icon: "🧬", count: "1,400+ notes", color: "subject-biology", popularity: "💎 Quality" },
                { name: "Computer Science", icon: "💻", count: "1,200+ notes", color: "subject-computer", popularity: "🚀 Trending" },
                { name: "English", icon: "📚", count: "1,000+ notes", color: "subject-english", popularity: "📖 Classic" }
              ].map((category, index) => (
                <Link key={category.name} href={`/catalog?subject=${encodeURIComponent(category.name)}`}>
                  <Card 
                    className="hover-lift cursor-pointer border-2 border-transparent hover:border-purple-300 transition-all duration-300 bg-white shadow-lg animate-fade-in group"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <CardContent className="p-6 text-center relative overflow-hidden">
                      {/* Background gradient */}
                      <div className={`absolute inset-0 ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                      
                      <div className="relative z-10">
                        <div className="text-4xl mb-3 animate-bounce-in" style={{animationDelay: `${index * 0.2}s`}}>
                          {category.icon}
                        </div>
                        <div className="font-bold text-foreground text-base mb-2 group-hover:text-purple-600 transition-colors">
                          {category.name}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">{category.count}</div>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-gradient-primary text-white px-2 py-1 hover-scale"
                        >
                          {category.popularity}
                        </Badge>
                      </div>
                      
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity"></div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending Notes */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-gradient animate-fade-in">🔥 Trending This Week</h2>
                <Badge className="bg-red-500 text-white px-3 py-1 animate-pulse-slow">
                  📈 Hot
                </Badge>
              </div>
              <Button className="button-glow hover-scale" asChild>
                <Link href="/catalog" data-testid="button-view-all">
                  🚀 View All Notes
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingNotes?.notes?.slice(0, 6).map((note: any, index: number) => (
                <div key={note.id} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <NoteCard note={note} />
                </div>
              )) || (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <Card className="card-enhanced">
                      <CardContent className="p-6">
                        <div className="skeleton h-4 w-3/4 mb-4"></div>
                        <div className="skeleton h-3 w-full mb-2"></div>
                        <div className="skeleton h-3 w-2/3 mb-4"></div>
                        <div className="flex gap-2">
                          <div className="skeleton h-6 w-16"></div>
                          <div className="skeleton h-6 w-16"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Trading Performance for Students */}
          {((user as any)?.role === 'student' || true) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">📊 Your Trading Performance</h2>
              <Card className="bg-trading-card border border-slate-600/30 hover-glow-intense">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 w-fit mx-auto mb-3 animate-glow-pulse">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-green-400 animate-number-counter">5</div>
                      <div className="text-slate-300 font-medium">Day Streak</div>
                      <div className="text-xs text-slate-400">Trading Active</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 w-fit mx-auto mb-3 animate-glow-pulse">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-blue-400 animate-number-counter">247</div>
                      <div className="text-slate-300 font-medium">Assets Viewed</div>
                      <div className="text-xs text-slate-400">This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 w-fit mx-auto mb-3 animate-glow-pulse">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-purple-400 animate-number-counter">89%</div>
                      <div className="text-slate-300 font-medium">Success Rate</div>
                      <div className="text-xs text-slate-400">Portfolio Growth</div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 hover-neon">🏆 Top Performer</Badge>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover-neon">📈 Rising Trader</Badge>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover-neon">💎 Market Explorer</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
