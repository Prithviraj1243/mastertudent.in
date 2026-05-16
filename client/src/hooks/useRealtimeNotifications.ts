import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for real-time notifications
 * Subscribes to notifications table and shows toast alerts
 */
export function useRealtimeNotifications(userId: string | undefined) {
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    console.log('🔔 Setting up real-time notifications for user:', userId);

    const subscription = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as any;
          console.log('🔔 New notification received:', notification);

          // Determine toast variant based on notification type
          let variant: 'default' | 'destructive' = 'default';
          let icon = '🔔';

          if (notification.type === 'note_approved') {
            icon = '✅';
          } else if (notification.type === 'note_rejected') {
            icon = '❌';
            variant = 'destructive';
          } else if (notification.type === 'coin_earned') {
            icon = '💰';
          }

          // Show toast notification
          toast({
            title: `${icon} ${notification.title}`,
            description: notification.body,
            variant,
            duration: 10000, // Show for 10 seconds
          });
        }
      )
      .subscribe((status) => {
        console.log('🔔 Notification subscription status:', status);
      });

    return () => {
      console.log('🔔 Unsubscribing from notifications...');
      subscription.unsubscribe();
    };
  }, [userId, toast]);
}
