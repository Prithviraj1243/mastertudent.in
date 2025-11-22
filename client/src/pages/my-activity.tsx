import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  User, 
  Download, 
  Upload, 
  Eye, 
  Heart, 
  UserPlus, 
  MessageSquare,
  RefreshCw,
  Clock,
  MapPin,
  Monitor,
  TrendingUp,
  Calendar,
  Bookmark,
  Star
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  details: any;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location: string;
}

const actionIcons: { [key: string]: any } = {
  'login': User,
  'download': Download,
  'upload': Upload,
  'view_note': Eye,
  'like_note': Heart,
  'follow_user': UserPlus,
  'comment': MessageSquare,
};

const actionColors: { [key: string]: string } = {
  'login': 'bg-green-100 text-green-800',
  'download': 'bg-blue-100 text-blue-800',
  'upload': 'bg-purple-100 text-purple-800',
  'view_note': 'bg-yellow-100 text-yellow-800',
  'like_note': 'bg-pink-100 text-pink-800',
  'follow_user': 'bg-indigo-100 text-indigo-800',
  'comment': 'bg-orange-100 text-orange-800',
};

const actionLabels: { [key: string]: string } = {
  'login': 'Logged In',
  'download': 'Downloaded Note',
  'upload': 'Uploaded Note',
  'view_note': 'Viewed Note',
  'like_note': 'Liked Note',
  'follow_user': 'Followed User',
  'comment': 'Added Comment',
};

export default function MyActivityPage() {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useUserStats();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute

  const { data: activities = [], isLoading, refetch } = useQuery<UserActivity[]>({
    queryKey: ["/api/user/my-activity"],
    retry: false,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getActionIcon = (action: string) => {
    const IconComponent = actionIcons[action] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const getActionDetails = (activity: UserActivity) => {
    const { action, details } = activity;
    
    switch (action) {
      case 'download':
        return `Downloaded "${details.noteTitle}"`;
      case 'upload':
        return `Uploaded "${details.noteTitle}"`;
      case 'view_note':
        return `Viewed "${details.noteTitle}"`;
      case 'like_note':
        return `Liked "${details.noteTitle}"`;
      case 'follow_user':
        return `Started following ${details.followedUser}`;
      case 'comment':
        return `Commented on "${details.noteTitle}": "${details.comment}"`;
      case 'login':
        return `Session duration: ${details.sessionDuration}`;
      default:
        return 'User activity';
    }
  };

  const getActivityStats = () => {
    const activityStats = {
      total: activities.length,
      downloads: activities.filter(a => a.action === 'download').length,
      uploads: activities.filter(a => a.action === 'upload').length,
      views: activities.filter(a => a.action === 'view_note').length,
      likes: activities.filter(a => a.action === 'like_note').length,
    };
    return activityStats;
  };

  const activityStats = getActivityStats();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card className="max-w-2xl mx-auto bg-slate-800/60 backdrop-blur-md border border-slate-600/50 shadow-xl">
              <CardContent className="pt-6 text-center">
                <Activity className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-white">Please Log In</h2>
                <p className="text-slate-300">
                  You need to be logged in to view your activity.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Activity className="h-8 w-8 text-purple-400" />
              📊 My Activity
            </h1>
            <p className="text-slate-300">
              Track your learning journey and platform interactions
            </p>
          </div>

          {/* Real User Stats - Matching Home Page Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {statsLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
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
                <Link href="/my-notes">
                  <Card className="bg-slate-800/60 backdrop-blur-md border border-green-500/30 hover:border-green-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-3 shadow-lg">
                          <Upload className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                        {stats.notesUploaded > 0 ? (
                          <div className="text-green-400 text-sm font-bold">Active</div>
                        ) : (
                          <div className="text-slate-400 text-sm font-bold">New</div>
                        )}
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-white mb-1">{stats.notesUploaded.toLocaleString()}</div>
                      <div className="text-slate-300 font-medium text-sm md:text-base">My Uploads</div>
                      <div className="text-xs text-green-400 mt-1 font-medium">📈 Click to view all notes</div>
                    </CardContent>
                  </Card>
                </Link>
                
                <Card className="bg-slate-800/60 backdrop-blur-md border border-purple-500/30 hover:border-purple-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 shadow-lg">
                        <Star className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      {stats.averageRating > 0 ? (
                        <div className="text-purple-400 text-sm font-bold">⭐{stats.averageRating.toFixed(1)}</div>
                      ) : (
                        <div className="text-slate-400 text-sm font-bold">No Rating</div>
                      )}
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-white mb-1">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}</div>
                    <div className="text-slate-300 font-medium text-sm md:text-base">Average Rating</div>
                    <div className="text-xs text-purple-400 mt-1 font-medium">⭐ Your Content</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/60 backdrop-blur-md border border-orange-500/30 hover:border-orange-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-3 shadow-lg">
                        <UserPlus className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <div className="text-slate-400 text-sm font-bold">0</div>
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-white mb-1">0</div>
                    <div className="text-slate-300 font-medium text-sm md:text-base">Following</div>
                    <div className="text-xs text-orange-400 mt-1 font-medium">👥 Users</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Activity Feed - Dark Theme */}
          <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-600/50 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  📅 Activity Timeline
                </CardTitle>
                <p className="text-sm text-slate-300 mt-1">
                  Your recent actions and interactions on the platform
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Badge variant={autoRefresh ? "default" : "secondary"} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && activities.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-4 rounded-lg border border-slate-600/30 bg-slate-700/30 hover:bg-slate-600/40 transition-all duration-300"
                    >
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-full shadow-lg">
                        {getActionIcon(activity.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs bg-slate-600/50 text-slate-300 border-slate-500">
                              {actionLabels[activity.action]}
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-slate-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-300 mt-1">
                          {getActionDetails(activity)}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {activity.location}
                          </div>
                          <div className="flex items-center">
                            <Monitor className="h-3 w-3 mr-1" />
                            {activity.ipAddress}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {activities.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-slate-400">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-white">No activity found</p>
                      <p className="text-sm mt-1">Start exploring notes to see your activity here!</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-slate-600/30">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Total activities: {activities.length}</span>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded bg-slate-700 border-slate-600"
                      />
                      <span>Auto-refresh</span>
                    </label>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-slate-300"
                      disabled={!autoRefresh}
                    >
                      <option value={30000}>30s</option>
                      <option value={60000}>1m</option>
                      <option value={300000}>5m</option>
                      <option value={600000}>10m</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
