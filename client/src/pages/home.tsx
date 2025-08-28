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
            <div className="gradient-primary rounded-lg p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.firstName || 'Student'}! 
                </h1>
                <p className="text-white/90 mb-4">
                  Ready to master your studies? Explore the latest notes and join our community of learners.
                </p>
                <div className="flex gap-4">
                  <Button 
                    className="bg-white text-blue-600 hover:bg-white/90 hover-scale"
                    asChild
                  >
                    <Link href="/catalog" data-testid="button-browse-all">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse All Notes
                    </Link>
                  </Button>
                  {(user?.role === 'topper' || user?.role === 'admin') && (
                    <Button 
                      variant="outline" 
                      className="border-white text-white hover:bg-white hover:text-blue-600 hover-scale"
                      asChild
                    >
                      <Link href="/upload" data-testid="button-upload">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Upload Notes
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              <div className="absolute top-4 right-4 opacity-20">
                <Award className="h-24 w-24" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-enhanced hover-lift">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">10,000+</div>
                <div className="text-sm text-muted-foreground">Total Notes</div>
              </CardContent>
            </Card>
            <Card className="card-enhanced hover-lift">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">5,000+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </CardContent>
            </Card>
            <Card className="card-enhanced hover-lift">
              <CardContent className="p-6 text-center">
                <Download className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">50,000+</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
              </CardContent>
            </Card>
            <Card className="card-enhanced hover-lift">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">4.8</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Categories */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Popular Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Mathematics", icon: "📐", count: "2,500+ notes" },
                { name: "Physics", icon: "⚛️", count: "1,800+ notes" },
                { name: "Chemistry", icon: "🧪", count: "1,600+ notes" },
                { name: "Biology", icon: "🧬", count: "1,400+ notes" },
                { name: "Computer Science", icon: "💻", count: "1,200+ notes" },
                { name: "English", icon: "📚", count: "1,000+ notes" }
              ].map((category, index) => (
                <Card 
                  key={category.name} 
                  className="card-enhanced hover-lift cursor-pointer animate-slide-up" 
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="font-semibold text-sm mb-1">{category.name}</div>
                    <div className="text-xs text-muted-foreground">{category.count}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trending Notes */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Trending This Week</h2>
              <Button variant="outline" asChild>
                <Link href="/catalog" data-testid="button-view-all">
                  View All
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
