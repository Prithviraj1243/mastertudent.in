import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  TrendingUp, 
  Star,
  Coins,
  Download,
  Eye,
  Heart,
  Target,
  Flame,
  Users,
  Calendar,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

interface LeaderboardUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  totalEarned: number;
  reputation: number;
  role: string;
  rank?: number;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  reward: number;
  validUntil: string;
  progress?: number;
  completed?: boolean;
}

const rankIcons = [
  { icon: Crown, color: "text-yellow-500", bgColor: "bg-yellow-100", name: "Champion" },
  { icon: Trophy, color: "text-gray-400", bgColor: "bg-gray-100", name: "Runner-up" },
  { icon: Medal, color: "text-orange-500", bgColor: "bg-orange-100", name: "Third Place" },
];

const challengeIcons: Record<string, any> = {
  'view_notes': Eye,
  'download_notes': Download,
  'like_notes': Heart,
  'create_posts': Star,
  'daily_login': Target,
  'streak': Flame,
};

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("earnings");
  const { user } = useAuth();

  // Fetch leaderboard data
  const { data: earningsLeaderboard = [], isLoading: earningsLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ['/api/leaderboard/earnings'],
    enabled: activeTab === 'earnings',
  });

  const { data: reputationLeaderboard = [], isLoading: reputationLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ['/api/leaderboard/reputation'],
    enabled: activeTab === 'reputation',
  });

  // Fetch daily challenges
  const { data: dailyChallenges = [] } = useQuery<DailyChallenge[]>({
    queryKey: ['/api/challenges/daily'],
  });

  // Current user stats
  const { data: userStats } = useQuery<any>({
    queryKey: ['/api/coins/balance'],
  });

  const currentLeaderboard = activeTab === 'earnings' ? earningsLeaderboard : reputationLeaderboard;
  const isLoading = activeTab === 'earnings' ? earningsLoading : reputationLoading;

  // Find current user rank
  const userRank = currentLeaderboard.findIndex(u => u.id === (user as any)?.id) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2" data-testid="title-leaderboard">
            🏆 Leaderboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Compete with top students and earn your place among the best!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Top Performers
                </CardTitle>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="earnings" className="flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      Coin Earnings
                    </TabsTrigger>
                    <TabsTrigger value="reputation" className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Reputation
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : currentLeaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {/* Top 3 Podium */}
                    <div className="grid grid-cols-3 gap-4 mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      {currentLeaderboard.slice(0, 3).map((user, index) => {
                        const IconComponent = rankIcons[index]?.icon || Medal;
                        const iconColor = rankIcons[index]?.color || "text-gray-500";
                        const bgColor = rankIcons[index]?.bgColor || "bg-gray-100";
                        
                        return (
                          <div key={user.id} className="text-center group" data-testid={`podium-${index + 1}`}>
                            <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                              <IconComponent className={`h-8 w-8 ${iconColor}`} />
                            </div>
                            <Avatar className="h-12 w-12 mx-auto mb-2 border-2 border-white shadow-lg">
                              <AvatarFallback className="bg-purple-100 text-purple-600 font-bold">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold text-sm text-gray-900 mb-1">
                              {user.firstName} {user.lastName}
                            </h3>
                            <div className="flex flex-col items-center">
                              <Badge variant="secondary" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <p className="text-sm font-bold text-gray-700 mt-1">
                                {activeTab === 'earnings' ? (
                                  <>🪙 {user.totalEarned.toLocaleString()}</>
                                ) : (
                                  <>⭐ {user.reputation.toLocaleString()}</>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Rest of the leaderboard */}
                    {currentLeaderboard.slice(3).map((user, index) => (
                      <div 
                        key={user.id} 
                        className={`flex items-center space-x-4 p-4 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          user.id === user?.id ? 'bg-purple-50 border border-purple-200' : 'border border-gray-200'
                        }`}
                        data-testid={`leaderboard-user-${user.id}`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                          {index + 4}
                        </div>
                        
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {user.firstName} {user.lastName}
                            </h3>
                            {user.role !== 'student' && (
                              <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="text-xs">
                                {user.role}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {activeTab === 'earnings' ? 'Total Coins Earned' : 'Reputation Score'}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900 dark:text-white">
                            {activeTab === 'earnings' ? (
                              <>🪙 {user.totalEarned.toLocaleString()}</>
                            ) : (
                              <>⭐ {user.reputation.toLocaleString()}</>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* User's position if not in top 10 */}
                    {userRank > 10 && userRank <= currentLeaderboard.length && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                              {userRank}
                            </div>
                            <div>
                              <h3 className="font-medium text-purple-900">Your Position</h3>
                              <p className="text-sm text-purple-600">Keep climbing! 💪</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-purple-900">
                              {activeTab === 'earnings' ? (
                                <>🪙 {userStats?.totalEarned?.toLocaleString() || 0}</>
                              ) : (
                                <>⭐ {userStats?.reputation?.toLocaleString() || 0}</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No data yet</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Start earning coins and reputation to appear on the leaderboard!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg">
                    <Coins className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-xs text-yellow-600 mb-1">Coins</p>
                    <p className="font-bold text-yellow-700" data-testid="user-coins">
                      {userStats?.coinBalance?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-purple-600 mb-1">Rank</p>
                    <p className="font-bold text-purple-700" data-testid="user-rank">
                      #{userRank || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                  <Crown className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-600 mb-1">Total Earned</p>
                  <p className="text-xl font-bold text-blue-700" data-testid="user-total-earned">
                    🪙 {userStats?.totalEarned?.toLocaleString() || '0'}
                  </p>
                </div>

                {userStats?.streak && userStats.streak > 0 && (
                  <div className="text-center p-4 bg-gradient-to-r from-orange-100 to-red-200 rounded-lg">
                    <Flame className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-orange-600 mb-1">Current Streak</p>
                    <p className="text-xl font-bold text-orange-700" data-testid="user-streak">
                      {userStats.streak} 🔥
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Challenges */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Daily Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailyChallenges.length > 0 ? (
                  <div className="space-y-3">
                    {dailyChallenges.slice(0, 3).map((challenge) => {
                      const IconComponent = challengeIcons[challenge.type] || Target;
                      const isCompleted = challenge.completed;
                      const progress = challenge.progress || 0;
                      const progressPercent = Math.min((progress / challenge.target) * 100, 100);
                      
                      return (
                        <div 
                          key={challenge.id} 
                          className={`p-3 rounded-lg border transition-all ${
                            isCompleted 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          data-testid={`challenge-${challenge.id}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <IconComponent className={`h-4 w-4 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`} />
                              <h4 className={`font-medium text-sm ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                                {challenge.title}
                              </h4>
                            </div>
                            <Badge 
                              variant={isCompleted ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {isCompleted ? "✓" : `🪙 ${challenge.reward}`}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-2">{challenge.description}</p>
                          
                          {!isCompleted && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{progress}/{challenge.target}</span>
                                <span>{Math.round(progressPercent)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No challenges available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/catalog">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-browse-notes">
                    <Eye className="h-4 w-4 mr-2" />
                    Browse Notes
                  </Button>
                </Link>
                <Link href="/forum">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-join-discussions">
                    <Users className="h-4 w-4 mr-2" />
                    Join Discussions
                  </Button>
                </Link>
                <Link href="/coin-dashboard">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-coin-dashboard">
                    <Coins className="h-4 w-4 mr-2" />
                    Coin Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}