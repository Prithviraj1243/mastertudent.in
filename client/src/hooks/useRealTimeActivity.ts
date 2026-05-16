import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface ActivityUpdate {
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

export function useRealTimeActivity() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const refreshActivity = useCallback(async () => {
    await Promise.allSettled([
      queryClient.invalidateQueries({ queryKey: ['/api/user/my-activity'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-activity'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notes'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/review/queue'] }),
    ]);
    setLastUpdate(new Date());
  }, [queryClient]);

  useEffect(() => {
    setIsConnected(true);

    // Poll server-backed activity so it works in local and production.
    const interval = setInterval(() => {
      refreshActivity();
    }, 15000);

    const onFocus = () => refreshActivity();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      setIsConnected(false);
    };
  }, [refreshActivity]);

  return {
    isConnected,
    lastUpdate,
    refreshActivity
  };
}

export function useActivityNotifications() {
  const [notifications, setNotifications] = useState<ActivityUpdate[]>([]);

  const addNotification = useCallback((activity: ActivityUpdate) => {
    setNotifications(prev => [activity, ...prev.slice(0, 4)]); // Keep only latest 5 notifications
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== activity.id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
}
