import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, BookOpen, Crown, Clock, TrendingUp, DollarSign, Star, Download, Wallet, CheckCircle, XCircle } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

function WithdrawalSettlement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [settlementComments, setSettlementComments] = useState("");

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ["/api/admin/withdrawals"],
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/withdrawals/${id}/approve`, { method: "PATCH" }),
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
      apiRequest(`/api/admin/withdrawals/${id}/reject`, { 
        method: "PATCH", 
        body: JSON.stringify({ rejectionReason: reason })
      }),
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
      apiRequest(`/api/admin/withdrawals/${id}/settle`, { 
        method: "PATCH", 
        body: JSON.stringify({ settlementComments: comments })
      }),
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
          {withdrawals?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No withdrawal requests found</p>
          ) : (
            withdrawals?.map((withdrawal: any) => (
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

export default function AdminDashboard() {
  const { user } = useAuth();

  // Check if user is admin
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground">
                  Only administrators can access this dashboard.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const { data: adminStats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-admin-title">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground" data-testid="text-admin-description">
              Platform overview and management tools
            </p>
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

              {/* Management Tools */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card data-testid="card-user-management">
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Students</p>
                        <p className="text-sm text-muted-foreground">Manage student accounts</p>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {Math.floor((adminStats?.totalUsers || 0) * 0.8)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Toppers</p>
                        <p className="text-sm text-muted-foreground">Manage topper accounts</p>
                      </div>
                      <span className="text-2xl font-bold text-secondary">
                        {Math.floor((adminStats?.totalUsers || 0) * 0.15)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Reviewers</p>
                        <p className="text-sm text-muted-foreground">Manage reviewer accounts</p>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        {Math.floor((adminStats?.totalUsers || 0) * 0.05)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-content-management">
                  <CardHeader>
                    <CardTitle>Content Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Published Notes</p>
                        <p className="text-sm text-muted-foreground">Live on platform</p>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        {Math.floor((adminStats?.totalNotes || 0) * 0.85)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Under Review</p>
                        <p className="text-sm text-muted-foreground">Awaiting approval</p>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">
                        {adminStats?.pendingReviews || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Featured Notes</p>
                        <p className="text-sm text-muted-foreground">Highlighted content</p>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {Math.floor((adminStats?.totalNotes || 0) * 0.1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
