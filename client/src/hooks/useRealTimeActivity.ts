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

  const simulateRealTimeUpdate = useCallback(() => {
    // Simulate receiving a new activity update
    const newActivity: ActivityUpdate = {
      id: `activity-${Date.now()}`,
      userId: 'current-user',
      userName: 'Current User',
      userEmail: 'user@example.com',
      action: ['login', 'download', 'upload', 'view_note', 'like_note'][Math.floor(Math.random() * 5)],
      details: { noteTitle: 'Sample Note', noteId: `note-${Date.now()}` },
      timestamp: new Date().toISOString(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Mumbai, India'
    };

    // Update the query cache with the new activity
    queryClient.setQueryData(['/api/user/my-activity'], (oldData: ActivityUpdate[] = []) => {
      return [newActivity, ...oldData.slice(0, 19)]; // Keep only latest 20 activities
    });

    // Also update admin activity if user is admin
    queryClient.setQueryData(['/api/admin/user-activity'], (oldData: ActivityUpdate[] = []) => {
      return [newActivity, ...oldData.slice(0, 19)]; // Keep only latest 20 activities
    });

    setLastUpdate(new Date());
  }, [queryClient]);

  useEffect(() => {
    // Simulate WebSocket connection
    setIsConnected(true);
    
    // Simulate periodic updates (every 10-30 seconds)
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of update
        simulateRealTimeUpdate();
      }
    }, 10000 + Math.random() * 20000); // Random interval between 10-30 seconds

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [simulateRealTimeUpdate]);

  return {
    isConnected,
    lastUpdate,
    simulateUpdate: simulateRealTimeUpdate
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
