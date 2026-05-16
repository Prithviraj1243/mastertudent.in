import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
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
  Calendar
} from "lucide-react";
import { useState } from "react";
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
    const stats = {
      total: activities.length,
      downloads: activities.filter(a => a.action === 'download').length,
      uploads: activities.filter(a => a.action === 'upload').length,
      views: activities.filter(a => a.action === 'view_note').length,
      likes: activities.filter(a => a.action === 'like_note').length,
    };
    return stats;
  };

  const stats = getActivityStats();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Please Log In</h2>
                <p className="text-muted-foreground">
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Activity className="h-8 w-8" />
              My Activity
            </h1>
            <p className="text-muted-foreground">
              Track your learning journey and platform interactions
            </p>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Activities</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Downloads</p>
                    <p className="text-2xl font-bold">{stats.downloads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Uploads</p>
                    <p className="text-2xl font-bold">{stats.uploads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Views</p>
                    <p className="text-2xl font-bold">{stats.views}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <div>
                    <p className="text-sm font-medium">Likes</p>
                    <p className="text-2xl font-bold">{stats.likes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your recent actions and interactions on the platform
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Badge variant={autoRefresh ? "default" : "secondary"}>
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && activities.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${actionColors[activity.action]}`}>
                        {getActionIcon(activity.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {actionLabels[activity.action]}
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {getActionDetails(activity)}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
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
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activity found</p>
                      <p className="text-sm mt-1">Start exploring notes to see your activity here!</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Total activities: {activities.length}</span>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded"
                      />
                      <span>Auto-refresh</span>
                    </label>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="px-2 py-1 border rounded text-xs"
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
