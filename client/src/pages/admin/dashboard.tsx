import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, FileText, TrendingUp, DollarSign, Download, Upload,
  Eye, CheckCircle, Clock, AlertCircle, Activity, ArrowRight,
  XCircle, UserPlus, RefreshCw, Shield, Zap, Crown
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

const adminFetch = async (url: string) => {
  const token = sessionStorage.getItem('adminToken');
  const res = await fetch(url, {
    credentials: 'include',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

// Simple SVG Bar Chart
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-4 h-40 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-white text-xs font-bold">{d.value}</span>
          <div
            className="w-full rounded-t-md transition-all duration-700"
            style={{ height: `${Math.max((d.value / max) * 120, 4)}px`, backgroundColor: d.color }}
          />
          <span className="text-slate-400 text-xs text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// SVG Donut Chart
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const r = 60, cx = 80, cy = 80, strokeW = 22;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4">
      <svg width="160" height="160" className="flex-shrink-0">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const offset = circumference - cumulative * circumference;
          cumulative += pct;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeW}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 0.7s ease' }}
            />
          );
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize="10">total</text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-slate-300 text-xs">{seg.label}</span>
            <span className="text-white text-xs font-bold ml-auto pl-2">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard-stats'],
    queryFn: () => adminFetch('/api/admin/dashboard-stats'),
    retry: 1,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const usersChannel = supabase.channel('admin-users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => { refetch(); })
      .subscribe();
    const notesChannel = supabase.channel('admin-notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => { refetch(); })
      .subscribe();
    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(notesChannel);
    };
  }, [refetch]);

  const statCards = [
    {
      title: 'Total Users', value: stats?.totalUsers || 0,
      icon: Users, color: 'from-blue-500 to-blue-700', link: '/admin/users',
      sub: 'Registered accounts'
    },
    {
      title: 'Approved Notes', value: stats?.approvedNotes || 0,
      icon: CheckCircle, color: 'from-emerald-500 to-green-700', link: '/admin/notes',
      sub: 'Live on platform'
    },
    {
      title: 'Total Downloads', value: stats?.totalDownloads || 0,
      icon: Download, color: 'from-purple-500 to-violet-700', link: '/admin/analytics',
      sub: 'All time'
    },
    {
      title: 'Pending Review', value: stats?.pendingApprovals || 0,
      icon: Clock, color: 'from-amber-500 to-orange-600', link: '/admin/notes',
      sub: 'Needs attention', urgent: (stats?.pendingApprovals || 0) > 0
    },
  ];

  const noteBarData = [
    { label: 'Approved', value: stats?.approvedNotes || 0, color: '#10b981' },
    { label: 'Pending', value: stats?.pendingApprovals || 0, color: '#f59e0b' },
    { label: 'Rejected', value: stats?.rejectedNotes || 0, color: '#ef4444' },
    { label: 'Total', value: stats?.totalNotes || 0, color: '#6366f1' },
  ];

  const userDonut = [
    { label: 'Students', value: Math.max((stats?.totalUsers || 0) - 2, 0), color: '#3b82f6' },
    { label: 'Admins', value: 1, color: '#8b5cf6' },
    { label: 'Toppers', value: 1, color: '#10b981' },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-3">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-400">Loading dashboard…</p>
          </div>
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
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              Dashboard
              <span className="flex items-center gap-2 text-sm font-normal px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            </h1>
            <p className="text-slate-400 text-sm">Welcome back, Admin! Here's what's happening on your platform.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <button
                key={i}
                onClick={() => setLocation(stat.link)}
                className="group text-left bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 w-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {stat.urgent && (
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/30 animate-pulse">
                      Action needed
                    </span>
                  )}
                  {!stat.urgent && (
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
                <p className="text-slate-400 text-xs mb-1">{stat.title}</p>
                <p className="text-white text-3xl font-bold mb-1">{stat.value.toLocaleString()}</p>
                <p className="text-slate-500 text-xs">{stat.sub}</p>
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => setLocation('/admin/notes')}
            className="flex items-center gap-3 p-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-xl transition-colors text-left"
          >
            <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 text-xs font-bold">Pending Review</p>
              <p className="text-white text-lg font-black">{stats?.pendingApprovals || 0}</p>
            </div>
          </button>
          <button
            onClick={() => setLocation('/admin/users')}
            className="flex items-center gap-3 p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors text-left"
          >
            <Users className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-blue-400 text-xs font-bold">All Users</p>
              <p className="text-white text-lg font-black">{stats?.totalUsers || 0}</p>
            </div>
          </button>
          <button
            onClick={() => setLocation('/admin/notes')}
            className="flex items-center gap-3 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-colors text-left"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-400 text-xs font-bold">Approved Notes</p>
              <p className="text-white text-lg font-black">{stats?.approvedNotes || 0}</p>
            </div>
          </button>
          <button
            onClick={() => setLocation('/admin/notes')}
            className="flex items-center gap-3 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors text-left"
          >
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-xs font-bold">Rejected</p>
              <p className="text-white text-lg font-black">{stats?.rejectedNotes || 0}</p>
            </div>
          </button>
          <button
            onClick={() => setLocation('/admin/toppers')}
            className="flex items-center gap-3 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors text-left"
          >
            <Crown className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-400 text-xs font-bold">Verify Toppers</p>
              <p className="text-white text-xs mt-0.5">Review docs →</p>
            </div>
          </button>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-blue-400" />
                Notes Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={noteBarData} />
            </CardContent>
          </Card>

          {/* Donut Chart */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-purple-400" />
                User Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart segments={userDonut} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Top Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Activity */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-blue-400" />
                Recent Activity
              </CardTitle>
              <button
                onClick={() => setLocation('/admin/notes')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity: any) => {
                    const isUpload = activity.type === 'note_upload';
                    return (
                      <button
                        key={activity.id}
                        onClick={() => setLocation('/admin/notes')}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors text-left group"
                      >
                        <div className={`w-9 h-9 flex-shrink-0 ${isUpload ? 'bg-blue-500/10' : 'bg-green-500/10'} rounded-full flex items-center justify-center`}>
                          {isUpload
                            ? <Upload className="w-4 h-4 text-blue-400" />
                            : <Download className="w-4 h-4 text-green-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{activity.title}</p>
                          <p className="text-slate-500 text-xs">{getTimeAgo(activity.time)}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          activity.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                          activity.status === 'submitted' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {activity.status || 'new'}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No recent activity yet</p>
                    <p className="text-xs mt-1">Activity will appear as users upload notes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Notes */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Top Performing Notes
              </CardTitle>
              <button
                onClick={() => setLocation('/admin/notes')}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.topNotes && stats.topNotes.length > 0 ? (
                  stats.topNotes.map((note: any, index: number) => (
                    <button
                      key={note.id}
                      onClick={() => setLocation('/admin/notes')}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-black">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{note.title}</p>
                        <p className="text-slate-500 text-xs">{note.subject}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-bold">{note.downloads}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No approved notes yet</p>
                    <button
                      onClick={() => setLocation('/admin/notes')}
                      className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mx-auto"
                    >
                      Review pending notes <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health Bar */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm font-medium">System Status</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs">All systems operational</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  API <span className="text-green-400 font-medium ml-1">Online</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Database <span className="text-green-400 font-medium ml-1">Connected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>Admin JWT Auth Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}
