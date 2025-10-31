import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Hook to fetch real user data from main application
export const useAdminUserData = () => {
  return useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("/api/admin/users", "GET"),
    retry: false,
  });
};

// Hook to fetch real notes data from main application
export const useAdminNotesData = (filters?: {
  status?: string;
  subject?: string;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.subject) queryParams.append('subject', filters.subject);
  if (filters?.search) queryParams.append('search', filters.search);
  
  return useQuery({
    queryKey: ["/api/admin/notes", filters],
    queryFn: () => apiRequest(`/api/admin/notes?${queryParams.toString()}`, "GET"),
    retry: false,
  });
};

// Hook to fetch dashboard statistics
export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ["/api/admin/dashboard/stats"],
    queryFn: () => apiRequest("/api/admin/dashboard/stats", "GET"),
    retry: false,
  });
};

// Hook to fetch recent activity
export const useAdminRecentActivity = () => {
  return useQuery({
    queryKey: ["/api/admin/activity"],
    queryFn: () => apiRequest("/api/admin/activity", "GET"),
    retry: false,
  });
};

// Hook to approve notes
export const useApproveNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, reviewComment, reviewerId }: {
      noteId: string;
      reviewComment: string;
      reviewerId: string;
    }) => apiRequest(`/api/admin/notes/${noteId}/approve`, "PATCH", {
      reviewComment,
      reviewerId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
    },
  });
};

// Hook to reject notes
export const useRejectNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, reviewComment, reviewerId }: {
      noteId: string;
      reviewComment: string;
      reviewerId: string;
    }) => apiRequest(`/api/admin/notes/${noteId}/reject`, "PATCH", {
      reviewComment,
      reviewerId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
    },
  });
};

// Hook to manage user roles
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      apiRequest(`/api/admin/users/${userId}/role`, "PATCH", { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });
};

// Hook to fetch withdrawal requests
export const useAdminWithdrawals = () => {
  return useQuery({
    queryKey: ["/api/admin/withdrawals"],
    queryFn: () => apiRequest("/api/admin/withdrawals", "GET"),
    retry: false,
  });
};

// Hook to approve withdrawals
export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (withdrawalId: string) => 
      apiRequest(`/api/admin/withdrawals/${withdrawalId}/approve`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
    },
  });
};

// Hook to reject withdrawals
export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ withdrawalId, reason }: { withdrawalId: string; reason: string }) => 
      apiRequest(`/api/admin/withdrawals/${withdrawalId}/reject`, "PATCH", { rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
    },
  });
};

// Hook to fetch subscription data
export const useAdminSubscriptions = () => {
  return useQuery({
    queryKey: ["/api/admin/subscriptions"],
    queryFn: () => apiRequest("/api/admin/subscriptions", "GET"),
    retry: false,
  });
};

// Hook to fetch payment analytics
export const useAdminPaymentAnalytics = () => {
  return useQuery({
    queryKey: ["/api/admin/payments/analytics"],
    queryFn: () => apiRequest("/api/admin/payments/analytics", "GET"),
    retry: false,
  });
};

// Teacher authentication hook
export const useTeacherAuth = () => {
  return useMutation({
    mutationFn: ({ teacherId, password }: { teacherId: string; password: string }) => 
      apiRequest("/api/admin/auth/teacher", "POST", { teacherId, password }),
  });
};

// Hook to fetch subject-wise statistics
export const useSubjectStats = () => {
  return useQuery({
    queryKey: ["/api/admin/subjects/stats"],
    queryFn: () => apiRequest("/api/admin/subjects/stats", "GET"),
    retry: false,
  });
};

// Hook to fetch user engagement metrics
export const useUserEngagementMetrics = () => {
  return useQuery({
    queryKey: ["/api/admin/users/engagement"],
    queryFn: () => apiRequest("/api/admin/users/engagement", "GET"),
    retry: false,
  });
};

// Hook to send notifications to users
export const useSendNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userIds, 
      title, 
      message, 
      type 
    }: { 
      userIds: string[]; 
      title: string; 
      message: string; 
      type: string; 
    }) => apiRequest("/api/admin/notifications/send", "POST", {
      userIds,
      title,
      message,
      type
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activity"] });
    },
  });
};

// Hook to manage system settings
export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: Record<string, any>) => 
      apiRequest("/api/admin/settings", "PATCH", settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
  });
};

// Hook to export data
export const useExportData = () => {
  return useMutation({
    mutationFn: ({ type, filters }: { type: string; filters?: Record<string, any> }) => 
      apiRequest("/api/admin/export", "POST", { type, filters }),
  });
};

// Mock data fallback for development
export const mockAdminData = {
  users: [
    {
      id: '1',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      role: 'student',
      joinedAt: '2024-01-15T10:30:00Z',
      lastActive: '2024-01-20T15:45:00Z',
      notesUploaded: 5,
      totalEarnings: 250,
      subscriptionStatus: 'premium'
    },
    {
      id: '2',
      name: 'Priya Patel',
      email: 'priya@example.com',
      role: 'topper',
      joinedAt: '2024-01-10T09:20:00Z',
      lastActive: '2024-01-20T14:30:00Z',
      notesUploaded: 12,
      totalEarnings: 1200,
      subscriptionStatus: 'premium'
    }
  ],
  notes: [
    {
      id: '1',
      title: 'Advanced Calculus - Derivatives',
      subject: 'Mathematics',
      chapter: 'Calculus',
      unit: 'Derivatives',
      authorId: '2',
      authorName: 'Priya Patel',
      status: 'pending',
      uploadedAt: '2024-01-20T10:30:00Z',
      fileType: 'PDF',
      fileSize: '2.5 MB',
      description: 'Comprehensive notes on derivatives with examples',
      tags: ['calculus', 'derivatives', 'mathematics'],
      views: 0,
      downloads: 0,
      rating: 0
    }
  ],
  stats: {
    totalUsers: 1247,
    totalNotes: 3456,
    pendingApprovals: 23,
    totalEarnings: 125000,
    monthlyGrowth: 15.2,
    activeToday: 234
  }
};

// Utility function to get mock data when API is not available
export const getMockData = (endpoint: string) => {
  switch (endpoint) {
    case '/api/admin/users':
      return mockAdminData.users;
    case '/api/admin/notes':
      return mockAdminData.notes;
    case '/api/admin/dashboard/stats':
      return mockAdminData.stats;
    default:
      return null;
  }
};
