import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  CreditCard, 
  ClipboardCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  Shield
} from "lucide-react";
import { Link } from "wouter";

interface AdminStats {
  totalUsers: number;
  totalNotes: number;
  activeSubscriptions: number;
  pendingReviews: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Always call hooks first (before any conditional returns)
  const { data: stats, isLoading, error } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    retry: false,
    enabled: isAuthenticated && user?.role === "admin", // Only fetch if admin
  });

  // Redirect to new admin panel
  if (typeof window !== 'undefined') {
    setTimeout(() => setLocation("/admin"), 100);
  }

  // Redirect if not admin - with smooth transition
  if (!isAuthenticated || user?.role !== "admin") {
    // Use setTimeout for smooth redirect
    if (typeof window !== 'undefined') {
      setTimeout(() => setLocation("/"), 100);
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Redirecting to new admin panel...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/admin/users",
    },
    {
      title: "Total Notes",
      value: stats?.totalNotes || 0,
      icon: FileText,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      link: "/admin/notes",
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions || 0,
      icon: CreditCard,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      link: "/admin/analytics",
    },
    {
      title: "Pending Reviews",
      value: stats?.pendingReviews || 0,
      icon: ClipboardCheck,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      link: "/admin/notes?status=submitted",
    },
  ];

  const quickActions = [
    { label: "Manage Users", path: "/admin/users", icon: Users },
    { label: "Review Notes", path: "/admin/notes", icon: FileText },
    { label: "View Analytics", path: "/admin/analytics", icon: TrendingUp },
    { label: "User Activity", path: "/admin/analytics", icon: Activity },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-400">Error Loading Dashboard</CardTitle>
              <CardDescription>Failed to fetch admin statistics</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-blue-300 text-sm sm:text-base mt-1">
                Manage your platform and monitor activity
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.link}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm sm:text-base font-medium text-slate-300">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {stat.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      View details <ArrowRight className="h-3 w-3" />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.path}>
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-slate-700/50 border-slate-600/50"
                    >
                      <Icon className="h-5 w-5 text-blue-400" />
                      <span className="text-sm font-medium text-slate-300">
                        {action.label}
                      </span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Preview */}
        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-slate-400">
                  Latest platform activity
                </CardDescription>
              </div>
              <Link href="/admin/analytics">
                <Button variant="ghost" size="sm" className="text-blue-400">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-400">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Activity feed will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

