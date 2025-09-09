import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Upload, Wallet, FileText, TrendingUp, IndianRupee, Clock, CheckCircle, X } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState } from "react";

export default function UploaderProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    accountHolderName: "",
  });

  // Check if user is topper or admin
  if (user && user.role !== 'topper' && user.role !== 'admin') {
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
                  Only toppers can access the uploader profile.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  // Fetch uploader stats
  const { data: uploaderStats, isLoading } = useQuery({
    queryKey: ['/api/uploader/stats'],
    retry: false,
  });

  // Fetch withdrawal requests
  const { data: withdrawalRequests } = useQuery({
    queryKey: ['/api/withdrawals'],
    retry: false,
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: any) => {
      await apiRequest("POST", "/api/withdrawals/request", withdrawalData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/uploader/stats"] });
      setWithdrawalDialogOpen(false);
      setWithdrawalAmount("");
      setUpiId("");
      setBankDetails({
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        accountHolderName: "",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      });
    },
  });

  const handleWithdrawalSubmit = () => {
    const amount = parseFloat(withdrawalAmount);
    
    if (!amount || amount < 200) {
      toast({
        title: "Error",
        description: "Minimum withdrawal amount is ₹200",
        variant: "destructive",
      });
      return;
    }

    if (uploaderStats && amount > uploaderStats.walletBalance) {
      toast({
        title: "Error",
        description: "Insufficient wallet balance",
        variant: "destructive",
      });
      return;
    }

    const withdrawalData: any = {
      amount,
      coins: Math.floor(amount * 20), // Assuming 1 rupee = 20 coins
    };

    if (paymentMethod === "upi") {
      if (!upiId.trim()) {
        toast({
          title: "Error",
          description: "Please provide UPI ID",
          variant: "destructive",
        });
        return;
      }
      withdrawalData.upiId = upiId.trim();
    } else {
      if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName || !bankDetails.accountHolderName) {
        toast({
          title: "Error",
          description: "Please fill all bank details",
          variant: "destructive",
        });
        return;
      }
      withdrawalData.bankDetails = bankDetails;
    }

    withdrawalMutation.mutate(withdrawalData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'settled':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Settled</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-profile-title">
              Uploader Profile
            </h1>
            <p className="text-muted-foreground" data-testid="text-profile-description">
              Track your uploads, earnings, and manage withdrawals
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-total-uploads">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Uploads</p>
                    <p className="text-2xl font-bold text-foreground">
                      {uploaderStats?.totalUploads || 0}
                    </p>
                  </div>
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-published-notes">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Published Notes</p>
                    <p className="text-2xl font-bold text-green-600">
                      {uploaderStats?.publishedNotes || 0}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-total-downloads">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {uploaderStats?.totalDownloads || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-wallet-balance">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                    <p className="text-2xl font-bold text-emerald-600 flex items-center">
                      <IndianRupee className="h-5 w-5 mr-1" />
                      {uploaderStats?.walletBalance || 0}
                    </p>
                  </div>
                  <Wallet className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Withdrawal Request */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  Request Withdrawal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Minimum withdrawal: ₹200 | Current balance: ₹{uploaderStats?.walletBalance || 0}
                </p>
                
                <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full"
                      disabled={!uploaderStats || uploaderStats.walletBalance < 200}
                      data-testid="button-request-withdrawal"
                    >
                      <IndianRupee className="h-4 w-4 mr-2" />
                      Request Withdrawal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request Withdrawal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">
                          Amount (Minimum ₹200):
                        </label>
                        <Input
                          type="number"
                          value={withdrawalAmount}
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="mt-2"
                          min="200"
                          max={uploaderStats?.walletBalance || 0}
                          data-testid="input-withdrawal-amount"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Payment Method:</label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {paymentMethod === "upi" ? (
                        <div>
                          <label className="text-sm font-medium">UPI ID:</label>
                          <Input
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="example@upi"
                            className="mt-2"
                            data-testid="input-upi-id"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Account Holder Name:</label>
                            <Input
                              value={bankDetails.accountHolderName}
                              onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                              placeholder="Full name as per bank"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Account Number:</label>
                            <Input
                              value={bankDetails.accountNumber}
                              onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                              placeholder="Bank account number"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">IFSC Code:</label>
                            <Input
                              value={bankDetails.ifscCode}
                              onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                              placeholder="IFSC code"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Bank Name:</label>
                            <Input
                              value={bankDetails.bankName}
                              onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                              placeholder="Bank name"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setWithdrawalDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleWithdrawalSubmit}
                          disabled={withdrawalMutation.isPending || !withdrawalAmount}
                          className="bg-emerald-600 hover:bg-emerald-700"
                          data-testid="button-submit-withdrawal"
                        >
                          {withdrawalMutation.isPending ? "Submitting..." : "Submit Request"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Recent Withdrawal Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {withdrawalRequests?.length > 0 ? (
                  <div className="divide-y divide-border">
                    {withdrawalRequests.slice(0, 5).map((request: any) => (
                      <div 
                        key={request.id} 
                        className="p-4 hover:bg-accent transition-colors"
                        data-testid={`withdrawal-request-${request.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            ₹{request.amount}
                          </span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </div>
                        {request.adminComments && (
                          <div className="text-sm text-blue-600 mt-1">
                            Admin: {request.adminComments}
                          </div>
                        )}
                        {request.rejectionReason && (
                          <div className="text-sm text-red-600 mt-1">
                            Rejected: {request.rejectionReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-withdrawal-requests">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No withdrawal requests yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}