import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  X, 
  Download, 
  Upload, 
  Eye, 
  Heart, 
  UserPlus, 
  MessageSquare,
  User,
  Bell
} from 'lucide-react';
import { useActivityNotifications } from '@/hooks/useRealTimeActivity';

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

interface ActivityNotificationProps {
  className?: string;
}

export function ActivityNotifications({ className = '' }: ActivityNotificationProps) {
  const { notifications, removeNotification, clearAllNotifications } = useActivityNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notifications.length > 0) {
      setIsVisible(true);
    }
  }, [notifications.length]);

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  const getActionIcon = (action: string) => {
    const IconComponent = actionIcons[action] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const getActionDetails = (activity: any) => {
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
        return `Commented on "${details.noteTitle}"`;
      case 'login':
        return 'Logged in successfully';
      default:
        return 'New activity';
    }
  };

  return (
    <div className={`fixed top-20 right-4 z-50 space-y-2 max-w-sm ${className}`}>
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className="bg-white shadow-lg border-l-4 border-l-blue-500 animate-in slide-in-from-right-5 duration-300"
        >
          <CardContent className="p-3">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${actionColors[notification.action]}`}>
                {getActionIcon(notification.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {actionLabels[notification.action]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNotification(notification.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">
                  {getActionDetails(notification)}
                </p>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllNotifications}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}

export function ActivityNotificationBell() {
  const { notifications } = useActivityNotifications();
  
  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {notifications.length > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
        >
          {notifications.length}
        </Badge>
      )}
    </div>
  );
}
