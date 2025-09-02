import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
    refetch,
  };
}
