import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Download,
  Upload,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalUsers: number;
  totalNotes: number;
  approvedNotes: number;
  rejectedNotes: number;
  totalDownloads: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeUsers: number;
  recentActivity: any[];
  topNotes: any[];
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return past.toLocaleDateString();
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { data: stats, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard-stats'],
    retry: false,
    refetchInterval: 30000, // Auto-refetch every 30 seconds
  });

  // Real-time subscriptions for instant updates
  useEffect(() => {
    // Subscribe to new users
    const usersChannel = supabase
      .channel('admin-users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        refetch();
        toast({
          title: "🔄 Data Updated",
          description: "User data has been updated",
        });
      })
      .subscribe();

    // Subscribe to new notes
    const notesChannel = supabase
      .channel('admin-notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        refetch();
        toast({
          title: "🔄 Data Updated",
          description: "Notes data has been updated",
        });
      })
      .subscribe();

    // Subscribe to downloads
    const downloadsChannel = supabase
      .channel('admin-downloads-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'downloads' }, () => {
        refetch();
        toast({
          title: "📥 New Download",
          description: "A note has been downloaded",
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(notesChannel);
      supabase.removeChannel(downloadsChannel);
    };
  }, [refetch, toast]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Approved Notes',
      value: stats?.approvedNotes || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Total Downloads',
      value: stats?.totalDownloads || 0,
      icon: Download,
      color: 'from-purple-500 to-purple-600',
      change: '+23%',
      trend: 'up'
    },
    {
      title: 'Revenue (Coins)',
      value: stats?.totalRevenue || 0,
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      change: '+15%',
      trend: 'up'
    },
  ];

  const quickStats = [
    {
      label: 'Pending Approvals',
      value: stats?.pendingApprovals || 0,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      label: 'Active Users Today',
      value: stats?.activeUsers || 0,
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Total Notes',
      value: stats?.totalNotes || 0,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'Rejected Notes',
      value: stats?.rejectedNotes || 0,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              Dashboard
              <span className="flex items-center gap-2 text-sm font-normal px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </h1>
            <p className="text-slate-400">Welcome back! Real-time data from your platform.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                    <p className="text-white text-3xl font-bold">{stat.value.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center space-x-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-white text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity & Top Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity: any) => {
                    const isUpload = activity.type === 'note_upload';
                    const timeAgo = getTimeAgo(activity.time);
                    
                    return (
                      <div key={activity.id} className="flex items-center space-x-3 pb-4 border-b border-slate-800 last:border-0">
                        <div className={`w-10 h-10 ${isUpload ? 'bg-blue-500/10' : 'bg-green-500/10'} rounded-full flex items-center justify-center`}>
                          {isUpload ? (
                            <Upload className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Download className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">
                            {isUpload ? 'Uploaded' : 'Downloaded'}: <span className="font-medium">{activity.title}</span>
                          </p>
                          <p className="text-slate-400 text-xs">
                            by {activity.user} • {timeAgo}
                          </p>
                        </div>
                        {activity.status && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            activity.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                            activity.status === 'submitted' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-gray-500/10 text-gray-500'
                          }`}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Notes */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Top Performing Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topNotes && stats.topNotes.length > 0 ? (
                  stats.topNotes.map((note: any, index: number) => (
                    <div key={note.id} className="flex items-center justify-between pb-4 border-b border-slate-800 last:border-0">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">#{index + 1}</span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">{note.title}</p>
                          <p className="text-slate-400 text-xs">
                            {note.subject} • by {note.uploader}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Download className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 text-sm font-medium">{note.downloads}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No notes available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Downloads Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-slate-800 rounded-lg">
                <p className="text-slate-500">Chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-slate-800 rounded-lg">
                <p className="text-slate-500">Pie chart here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
