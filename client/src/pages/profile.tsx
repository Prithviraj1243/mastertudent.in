import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Crown, 
  Download, 
  BookOpen,
  Coins,
  TrendingUp,
  ArrowLeft,
  Edit3,
  Settings
} from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user } = useAuth();

  // Fetch real profile statistics
  const { data: profileStats } = useQuery<{
    notesUploaded: number;
    approvedNotes: number;
    pendingNotes: number;
    totalDownloads: number;
    averageRating: number;
    coinBalance: number;
    totalEarned: number;
    totalSpent: number;
    reputation: number;
    streak: number;
    freeDownloadsLeft: number;
  }>({
    queryKey: ['/api/profile/stats'],
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects - Matching Main Website */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${
                i % 4 === 0 ? 'w-2 h-2 bg-purple-400/20 animate-pulse' :
                i % 4 === 1 ? 'w-3 h-3 bg-cyan-400/15 animate-ping' :
                i % 4 === 2 ? 'w-1 h-1 bg-pink-400/25 animate-bounce' :
                'w-4 h-4 bg-indigo-400/10 animate-pulse'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 left-1/2 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        <div className="flex">
          <Sidebar />
        <main className="flex-1 p-6" role="main">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              asChild
              variant="ghost" 
              className="bg-slate-800/80 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white shadow-sm transition-all duration-300"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Profile Header */}
          <Card className="bg-slate-800/90 backdrop-blur-md border-slate-600/50 mb-8">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    {user.firstName} {user.lastName}
                    {user.role === 'topper' && <Crown className="h-6 w-6 text-yellow-400" />}
                  </CardTitle>
                  <p className="text-slate-300 capitalize">{user.role}</p>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                </div>
                
                {/* Edit Profile Button */}
                <div className="flex flex-col gap-2">
                  <Button 
                    asChild
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Link href="/profile/edit">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Coins */}
            <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md border border-yellow-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Coins className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-300">
                      {profileStats?.coinBalance?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-yellow-200/80 font-medium">COINS</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Downloads */}
            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Download className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-green-300">
                      {profileStats?.freeDownloadsLeft ?? '0'}
                    </p>
                    <p className="text-xs text-green-200/80 font-medium">FREE LEFT</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-blue-300">
                      {profileStats?.notesUploaded || '0'}
                    </p>
                    <p className="text-xs text-blue-200/80 font-medium">NOTES</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Stats */}
          <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-orange-400" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profileStats?.notesUploaded || '0'}</p>
                  <p className="text-sm text-slate-400">Notes Uploaded</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{profileStats?.approvedNotes || '0'}</p>
                  <p className="text-sm text-slate-400">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{profileStats?.pendingNotes || '0'}</p>
                  <p className="text-sm text-slate-400">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{profileStats?.totalDownloads || '0'}</p>
                  <p className="text-sm text-slate-400">Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        </div>
      </div>
    </div>
  );
}
