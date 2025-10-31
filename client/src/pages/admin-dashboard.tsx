import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, BookOpen, Crown, Clock, TrendingUp, DollarSign, Star, Download, Wallet, CheckCircle, XCircle, AlertCircle, Activity, Settings, Shield, BarChart3, LogOut, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
// import { ActivityMonitor } from "@/components/admin/activity-monitor";
// import { UserActivityMonitor } from "@/components/admin/user-activity-monitor";

function WithdrawalSettlement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [settlementComments, setSettlementComments] = useState("");

  const { data: withdrawals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/withdrawals"],
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/withdrawals/${id}/approve`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal approved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to approve withdrawal", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      apiRequest(`/api/admin/withdrawals/${id}/reject`, "PATCH", { rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal rejected successfully" });
      setRejectionReason("");
    },
    onError: () => {
      toast({ title: "Failed to reject withdrawal", variant: "destructive" });
    },
  });

  const settleMutation = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) => 
      apiRequest(`/api/admin/withdrawals/${id}/settle`, "PATCH", { settlementComments: comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal settled successfully" });
      setSettlementComments("");
    },
    onError: () => {
      toast({ title: "Failed to settle withdrawal", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-200">Rejected</Badge>;
      case 'settled':
        return <Badge variant="outline" className="text-green-600 border-green-200">Settled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Card data-testid="card-withdrawal-settlement">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Withdrawal Settlement</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {withdrawals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No withdrawal requests found</p>
          ) : (
            withdrawals.map((withdrawal: any) => (
              <div key={withdrawal.id} className="border rounded-lg p-4 space-y-3" data-testid={`withdrawal-${withdrawal.id}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">₹{withdrawal.amount}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested on {new Date(withdrawal.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>
                
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Topper ID:</span> {withdrawal.topperId}</p>
                  <p><span className="font-medium">Coins:</span> {withdrawal.coins}</p>
                  {withdrawal.upiId && (
                    <p><span className="font-medium">UPI ID:</span> {withdrawal.upiId}</p>
                  )}
                  {withdrawal.bankDetails && (
                    <p><span className="font-medium">Bank Details:</span> {JSON.stringify(withdrawal.bankDetails)}</p>
                  )}
                </div>

                {withdrawal.status === 'pending' && (
                  <div className="flex space-x-2 pt-2">
                    <Button
                      onClick={() => approveMutation.mutate(withdrawal.id)}
                      disabled={approveMutation.isPending}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      data-testid={`button-approve-${withdrawal.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          data-testid={`button-reject-${withdrawal.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Withdrawal Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            data-testid="textarea-rejection-reason"
                          />
                          <Button
                            onClick={() => rejectMutation.mutate({ id: withdrawal.id, reason: rejectionReason })}
                            disabled={rejectMutation.isPending || !rejectionReason.trim()}
                            variant="destructive"
                            data-testid="button-confirm-reject"
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {withdrawal.status === 'approved' && (
                  <div className="pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          data-testid={`button-settle-${withdrawal.id}`}
                        >
                          Mark as Settled
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Mark Withdrawal as Settled</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Settlement comments (optional)..."
                            value={settlementComments}
                            onChange={(e) => setSettlementComments(e.target.value)}
                            data-testid="textarea-settlement-comments"
                          />
                          <Button
                            onClick={() => settleMutation.mutate({ id: withdrawal.id, comments: settlementComments })}
                            disabled={settleMutation.isPending}
                            data-testid="button-confirm-settle"
                          >
                            Confirm Settlement
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {withdrawal.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded text-sm">
                    <p className="font-medium text-red-800">Rejection Reason:</p>
                    <p className="text-red-700">{withdrawal.rejectionReason}</p>
                  </div>
                )}

                {withdrawal.adminComments && (
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <p className="font-medium text-blue-800">Admin Comments:</p>
                    <p className="text-blue-700">{withdrawal.adminComments}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [adminInfo, setAdminInfo] = useState<any>(null);

  // Check admin authentication
  useEffect(() => {
    console.log('Admin dashboard: Checking authentication...');
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
    console.log('Admin dashboard loaded successfully');
    
    // Show success toast
    toast({
      title: "Admin Panel Loaded",
      description: `Welcome to the admin dashboard, ${adminName}!`,
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
            <h3 className="text-white font-bold text-xl">🔥 Loading Admin Panel</h3>
            <p className="text-orange-200 text-sm mt-2">Verifying credentials and loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is admin (fallback check)
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6 text-center">
                <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground mb-4">
                  Only administrators can access this dashboard.
                </p>
                <Button onClick={() => setLocation('/admin-login')} className="bg-red-600 hover:bg-red-700">
                  <Crown className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const { data: adminStats = {}, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Admin Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center" data-testid="text-admin-title">
                  <Crown className="h-8 w-8 text-red-500 mr-3" />
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground" data-testid="text-admin-description">
                  Platform overview and management tools
                </p>
              </div>
              
              {/* Admin Info & Logout */}
              <div className="flex items-center space-x-4">
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{adminInfo?.name || 'Admin User'}</p>
                        <p className="text-xs text-gray-400">ID: {adminInfo?.id || 'N/A'}</p>
                        <p className="text-xs text-gray-400 capitalize">{adminInfo?.role?.replace('_', ' ') || 'Administrator'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card data-testid="card-total-users">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold text-foreground">
                          {adminStats?.totalUsers || 0}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-total-notes">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Notes</p>
                        <p className="text-2xl font-bold text-foreground">
                          {adminStats?.totalNotes || 0}
                        </p>
                      </div>
                      <BookOpen className="h-8 w-8 text-secondary" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-active-subscriptions">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                        <p className="text-2xl font-bold text-green-600">
                          {adminStats?.activeSubscriptions || 0}
                        </p>
                      </div>
                      <Crown className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-pending-reviews">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {adminStats?.pendingReviews || 0}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue & Growth Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card data-testid="card-monthly-revenue">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Monthly Revenue</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-2">
                      ₹{((adminStats?.activeSubscriptions || 0) * 59).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Estimated monthly recurring revenue
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-average-rating">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5" />
                      <span>Platform Rating</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-2">4.8</div>
                    <p className="text-sm text-muted-foreground">
                      Average note rating across platform
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-total-downloads">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>Total Downloads</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-2">12,543</div>
                    <p className="text-sm text-muted-foreground">
                      All-time note downloads
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Withdrawal Settlement */}
              <div className="mb-8">
                <WithdrawalSettlement />
              </div>

              {/* Admin Panel Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="activity">Live Activity</TabsTrigger>
                  <TabsTrigger value="user-activity">User Activity</TabsTrigger>
                  <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Revenue & Growth Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card data-testid="card-monthly-revenue">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5" />
                          <span>Monthly Revenue</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground mb-2">
                          ₹{((adminStats?.activeSubscriptions || 0) * 59).toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          estimated monthly recurring revenue
                        </p>
                      </CardContent>
                    </Card>

                    <Card data-testid="card-average-rating">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Star className="h-5 w-5" />
                          <span>Platform Rating</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground mb-2">4.8</div>
                        <p className="text-sm text-muted-foreground">
                          Average note rating across platform
                        </p>
                      </CardContent>
                    </Card>

                    <Card data-testid="card-total-downloads">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Download className="h-5 w-5" />
                          <span>Total Downloads</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground mb-2">
                          {adminStats?.totalDownloads || 12543}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          All-time note downloads
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions & Management */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full justify-start" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          System Settings
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Shield className="h-4 w-4 mr-2" />
                          Security Settings
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Generate Reports
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span>New user registration</span>
                            <span className="text-muted-foreground">2 min ago</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Note submitted for review</span>
                            <span className="text-muted-foreground">5 min ago</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Withdrawal request</span>
                            <span className="text-muted-foreground">10 min ago</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="notes">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{adminStats?.totalNotes || 0}</div>
                              <div className="text-sm text-gray-400">Total Notes</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <Clock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{adminStats?.pendingReviews || 0}</div>
                              <div className="text-sm text-gray-400">Pending Reviews</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <Download className="h-8 w-8 text-green-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{adminStats?.totalDownloads || 0}</div>
                              <div className="text-sm text-gray-400">Total Downloads</div>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="text-center py-8">
                          <p className="text-gray-400">Notes management features coming soon...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Live Activity Monitor</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{adminStats?.activeUsers || 0}</div>
                              <div className="text-sm text-gray-400">Active Users</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <Download className="h-8 w-8 text-green-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{adminStats?.recentDownloads || 0}</div>
                              <div className="text-sm text-gray-400">Recent Downloads</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <BookOpen className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{adminStats?.newUploads || 0}</div>
                              <div className="text-sm text-gray-400">New Uploads</div>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="text-center py-8">
                          <p className="text-gray-400">Live activity monitoring coming soon...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="user-activity">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>User Activity Monitor</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{adminStats?.totalUsers || 0}</div>
                              <div className="text-sm text-gray-400">Total Users</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <Activity className="h-8 w-8 text-green-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{adminStats?.activeToday || 0}</div>
                              <div className="text-sm text-gray-400">Active Today</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <Clock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{adminStats?.avgSessionTime || '0m'}</div>
                              <div className="text-sm text-gray-400">Avg Session</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-white">{adminStats?.growthRate || '0%'}</div>
                              <div className="text-sm text-gray-400">Growth Rate</div>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="text-center py-8">
                          <p className="text-gray-400">User activity tracking coming soon...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="withdrawals">
                  <WithdrawalSettlement />
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button variant="outline" className="h-20 flex-col">
                            <Users className="h-6 w-6 mb-2" />
                            User Management
                          </Button>
                          <Button variant="outline" className="h-20 flex-col">
                            <BookOpen className="h-6 w-6 mb-2" />
                            Content Moderation
                          </Button>
                          <Button variant="outline" className="h-20 flex-col">
                            <BarChart3 className="h-6 w-6 mb-2" />
                            Analytics Dashboard
                          </Button>
                          <Button variant="outline" className="h-20 flex-col">
                            <Settings className="h-6 w-6 mb-2" />
                            System Configuration
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
