import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for real-time coin balance updates
 * Subscribes to user table changes and shows notifications
 */
export function useRealtimeCoinBalance(userId: string | undefined) {
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const [totalEarned, setTotalEarned] = useState<number | null>(null);
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    console.log('💰 Setting up real-time coin balance for user:', userId);

    // Subscribe to user table changes for this specific user
    const subscription = supabase
      .channel(`user-coins-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('💰 Coin balance updated:', payload);

          const oldUser = payload.old as any;
          const newUser = payload.new as any;

          const oldBalance = oldUser.coin_balance || 0;
          const newBalance = newUser.coin_balance || 0;
          const difference = newBalance - oldBalance;

          console.log(`💰 Balance change: ${oldBalance} → ${newBalance} (${difference > 0 ? '+' : ''}${difference})`);

          // Update state
          setCoinBalance(newBalance);
          setTotalEarned(newUser.total_earned || 0);
          setPreviousBalance(oldBalance);

          // Show notification if coins increased
          if (difference > 0) {
            toast({
              title: "🎉 Coins Earned!",
              description: `You received ${difference} coins! New balance: ${newBalance} coins`,
              duration: 5000,
            });
          } else if (difference < 0) {
            toast({
              title: "💸 Coins Spent",
              description: `You spent ${Math.abs(difference)} coins. New balance: ${newBalance} coins`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('💰 Coin subscription status:', status);
      });

    return () => {
      console.log('💰 Unsubscribing from coin updates...');
      subscription.unsubscribe();
    };
  }, [userId, toast]);

  return {
    coinBalance,
    totalEarned,
    previousBalance,
  };
}
