import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, BookOpen, Crown, Clock, TrendingUp, DollarSign, 
  Star, Download, Wallet, CheckCircle, XCircle, AlertCircle, 
  Activity, Settings, Shield, BarChart3, LogOut, Lock, 
  Eye, Calendar, FileText, Coins
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// Real Users Component
function RealUsersManagement() {
  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: userStats } = useQuery<any>({
    queryKey: ["/api/admin/user-stats"],
    retry: false,
  });

  if (isLoading) return <div className="text-white">Loading users...</div>;

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats?.totalUsers || users.length}</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-green-500/30">
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats?.activeUsers || 0}</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Crown className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats?.toppers || 0}</div>
            <div className="text-sm text-gray-400">Toppers</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-orange-500/30">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats?.newToday || 0}</div>
            <div className="text-sm text-gray-400">New Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="bg-black/40 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Real User Database ({users.length} users)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((user, index) => (
              <div key={user.id || index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{user.name?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.name || 'Unknown User'}</div>
                    <div className="text-gray-400 text-sm">{user.email || 'No email'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.role === 'topper' ? 'default' : 'secondary'}>
                    {user.role || 'student'}
                  </Badge>
                  <Badge variant={user.isActive ? 'default' : 'destructive'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Real Notes Management Component
function RealNotesManagement() {
  const { data: notes = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/notes"],
    retry: false,
  });

  const { data: noteStats } = useQuery<any>({
    queryKey: ["/api/admin/note-stats"],
    retry: false,
  });

  if (isLoading) return <div className="text-white">Loading notes...</div>;

  return (
    <div className="space-y-6">
      {/* Notes Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{noteStats?.totalNotes || notes.length}</div>
            <div className="text-sm text-gray-400">Total Notes</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-green-500/30">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{noteStats?.approved || 0}</div>
            <div className="text-sm text-gray-400">Approved</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{noteStats?.pending || 0}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-red-500/30">
          <CardContent className="p-4 text-center">
            <Download className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{noteStats?.totalDownloads || 0}</div>
            <div className="text-sm text-gray-400">Downloads</div>
          </CardContent>
        </Card>
      </div>

      {/* Notes List */}
      <Card className="bg-black/40 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Real Notes Database ({notes.length} notes)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notes.map((note, index) => (
              <div key={note.id || index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex-1">
                  <div className="text-white font-medium">{note.title || `Note ${index + 1}`}</div>
                  <div className="text-gray-400 text-sm">
                    {note.subject || 'Unknown Subject'} • {note.uploader || 'Unknown Uploader'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{note.downloads || 0} downloads</Badge>
                  <Badge variant={note.status === 'approved' ? 'default' : note.status === 'pending' ? 'secondary' : 'destructive'}>
                    {note.status || 'pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Real Coins History Component
function RealCoinsHistory() {
  const { data: transactions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/transactions"],
    retry: false,
  });

  const { data: coinStats } = useQuery<any>({
    queryKey: ["/api/admin/coin-stats"],
    retry: false,
  });

  if (isLoading) return <div className="text-white">Loading transactions...</div>;

  return (
    <div className="space-y-6">
      {/* Coin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{coinStats?.totalCoins || 0}</div>
            <div className="text-sm text-gray-400">Total Coins</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-green-500/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{coinStats?.earned || 0}</div>
            <div className="text-sm text-gray-400">Coins Earned</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-red-500/30">
          <CardContent className="p-4 text-center">
            <Download className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{coinStats?.spent || 0}</div>
            <div className="text-sm text-gray-400">Coins Spent</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{transactions.length}</div>
            <div className="text-sm text-gray-400">Transactions</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card className="bg-black/40 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Real Transaction History ({transactions.length} transactions)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((transaction, index) => (
              <div key={transaction.id || index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'earn' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <Coins className={`h-5 w-5 ${transaction.type === 'earn' ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <div className="text-white font-medium">{transaction.description || 'Transaction'}</div>
                    <div className="text-gray-400 text-sm">{transaction.user || 'Unknown User'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${transaction.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.type === 'earn' ? '+' : '-'}{transaction.amount || 0} coins
                  </div>
                  <div className="text-gray-400 text-sm">{transaction.date || 'Unknown date'}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RealAdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [adminInfo, setAdminInfo] = useState<any>(null);

  // Fetch real data for live counts
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: notes = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/notes"],
    retry: false,
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/transactions"],
    retry: false,
  });

  // Check admin authentication
  useEffect(() => {
    console.log('Real Admin dashboard: Checking authentication...');
    const adminAuth = sessionStorage.getItem('adminAuth');
    const adminId = sessionStorage.getItem('adminId');
    const adminName = sessionStorage.getItem('adminName');
    const adminRole = sessionStorage.getItem('adminRole');
    const loginTime = sessionStorage.getItem('loginTime');

    console.log('Admin auth status:', { adminAuth, adminId, adminName, adminRole, loginTime });

    if (!adminAuth || adminAuth !== 'true') {
      console.log('No admin auth found, redirecting to login');
      toast({
        title: "Access Denied",
        description: "Please login with admin credentials to access this panel.",
        variant: "destructive"
      });
      setLocation('/admin-login');
      return;
    }

    // Check session timeout (24 hours)
    if (loginTime) {
      const loginDate = new Date(loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('adminId');
        sessionStorage.removeItem('adminName');
        sessionStorage.removeItem('adminRole');
        sessionStorage.removeItem('loginTime');
        
        toast({
          title: "Session Expired",
          description: "Your admin session has expired. Please login again.",
          variant: "destructive"
        });
        setLocation('/admin-login');
        return;
      }
    }

    console.log('Admin authentication successful, setting admin info');
    setAdminInfo({
      id: adminId,
      name: adminName,
      role: adminRole,
      loginTime: loginTime
    });
    console.log('Real Admin dashboard loaded successfully');
    
    // Show success toast
    toast({
      title: "🔥 Real Admin Panel Loaded",
      description: `Welcome to the real data dashboard, ${adminName}!`,
    });
  }, [setLocation, toast]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminId');
    sessionStorage.removeItem('adminName');
    sessionStorage.removeItem('adminRole');
    sessionStorage.removeItem('loginTime');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out from admin panel.",
    });
    setLocation('/admin-login');
  };

  // Show loading while checking authentication
  if (!adminInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-black/40 border-orange-500/40 backdrop-blur-lg shadow-2xl shadow-orange-500/20">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl">🔥 Loading Real Admin Panel</h3>
            <p className="text-orange-200 text-sm mt-2">Connecting to database and loading real data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">🔥 Real Admin Dashboard</h1>
              <p className="text-orange-200 text-sm">
                Live Website Data • {users.length} Users • {notes.length} Notes • {transactions.length} Transactions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-white font-medium">{adminInfo.name}</div>
              <div className="text-orange-200 text-sm">{adminInfo.role}</div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-black/40 border border-gray-600/30">
            <TabsTrigger value="users" className="data-[state=active]:bg-orange-600">
              <Users className="w-4 h-4 mr-2" />
              Live Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-orange-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Live Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="coins" className="data-[state=active]:bg-orange-600">
              <Coins className="w-4 h-4 mr-2" />
              Live Transactions ({transactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <RealUsersManagement />
          </TabsContent>

          <TabsContent value="notes">
            <RealNotesManagement />
          </TabsContent>

          <TabsContent value="coins">
            <RealCoinsHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
