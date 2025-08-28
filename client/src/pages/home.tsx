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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 animate-fade-in">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-rainbow rounded-2xl p-8 text-white relative overflow-hidden animate-fade-in">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
                <div className="absolute bottom-8 right-8 w-16 h-16 bg-white/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-3 rounded-full animate-glow">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-glow animate-bounce-in">
                      Welcome back, {user?.firstName || 'Amazing Student'}! 🎉
                    </h1>
                    <p className="text-white/90 text-lg">
                      Your learning journey continues here
                    </p>
                  </div>
                </div>
                
                <p className="text-white/90 mb-6 text-lg leading-relaxed">
                  🚀 Ready to excel in your studies? Join thousands of students using our premium study materials to achieve academic success!
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    className="bg-white text-purple-600 hover:bg-white/90 hover-scale text-lg px-8 py-3 font-semibold shadow-2xl"
                    asChild
                  >
                    <Link href="/catalog" data-testid="button-browse-all">
                      <BookOpen className="mr-2 h-5 w-5" />
                      🎯 Explore Notes
                    </Link>
                  </Button>
                  {(user?.role === 'topper' || user?.role === 'admin') && (
                    <Button 
                      className="bg-white/20 border-2 border-white text-white hover:bg-white hover:text-purple-600 hover-scale text-lg px-8 py-3 font-semibold"
                      asChild
                    >
                      <Link href="/upload" data-testid="button-upload">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        ⭐ Share Knowledge
                      </Link>
                    </Button>
                  )}
                  <Button 
                    className="bg-yellow-400 text-purple-800 hover:bg-yellow-300 hover-scale text-lg px-8 py-3 font-semibold shadow-2xl"
                    asChild
                  >
                    <Link href="/subscribe" data-testid="button-subscribe">
                      <Star className="mr-2 h-5 w-5" />
                      🏆 Go Premium
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Achievement badge */}
              <div className="absolute top-4 right-4 bg-white/20 rounded-full p-4 animate-pulse-slow">
                <div className="text-center">
                  <Award className="h-8 w-8 mx-auto text-yellow-300 mb-1" />
                  <div className="text-xs font-bold">Study Streak</div>
                  <div className="text-lg font-bold">7 Days! 🔥</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-primary text-white hover-lift border-0 shadow-2xl animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-3 animate-glow">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-1">📚 10,000+</div>
                <div className="text-white/90 font-medium">Study Notes Available</div>
                <div className="text-xs text-white/70 mt-1">Updated Daily</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-success text-white hover-lift border-0 shadow-2xl animate-fade-in" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-6 text-center">
                <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-3 animate-glow">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-1">👥 5,000+</div>
                <div className="text-white/90 font-medium">Active Learners</div>
                <div className="text-xs text-white/70 mt-1">Growing Community</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-info text-white hover-lift border-0 shadow-2xl animate-fade-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6 text-center">
                <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-3 animate-glow">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-1">📥 50,000+</div>
                <div className="text-white/90 font-medium">Total Downloads</div>
                <div className="text-xs text-white/70 mt-1">This Month</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-secondary text-white hover-lift border-0 shadow-2xl animate-fade-in" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-6 text-center">
                <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-3 animate-glow">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-1">⭐ 4.8</div>
                <div className="text-white/90 font-medium">Average Rating</div>
                <div className="text-xs text-white/70 mt-1">From 2000+ Reviews</div>
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

          {/* Achievement Section for Students */}
          {user?.role === 'student' && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Progress</h2>
              <Card className="card-enhanced">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Study Streak</h3>
                      <p className="text-muted-foreground">Keep learning every day to maintain your streak!</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">5</div>
                      <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Badge variant="secondary">Early Bird</Badge>
                    <Badge variant="secondary">Note Explorer</Badge>
                    <Badge variant="outline">Almost Scholar</Badge>
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
