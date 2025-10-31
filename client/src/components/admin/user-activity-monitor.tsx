import { useQuery } from "@tanstack/react-query";
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
  Monitor
} from "lucide-react";
import { useState, useEffect } from "react";
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

export function UserActivityMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const { data: activities = [], isLoading, refetch } = useQuery<UserActivity[]>({
    queryKey: ["/api/admin/user-activity"],
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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time User Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Live monitoring of user actions across the platform
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
                      <span className="font-medium text-sm">{activity.userName}</span>
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
                <p>No recent activity found</p>
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
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
                <option value={300000}>5m</option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
