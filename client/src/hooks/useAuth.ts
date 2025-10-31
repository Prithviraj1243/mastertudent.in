import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // Check for sessionStorage authentication first
  const sessionUser = typeof window !== 'undefined' ? sessionStorage.getItem('authUser') : null;
  const mockUser = sessionUser ? JSON.parse(sessionUser) : null;

  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: !mockUser, // Skip API call if we have session user
  });

  return {
    user: mockUser || user,
    isLoading: mockUser ? false : isLoading,
    isAuthenticated: !!mockUser || (!!user && !error),
    error,
    refetch,
  };
}
