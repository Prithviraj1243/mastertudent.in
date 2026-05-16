import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, IndianRupee, Clock, CheckCircle, ArrowLeft, Zap, Sparkles, Coins } from "lucide-react";
import { Link } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState } from "react";
import { motion } from "framer-motion";

const COINS_PER_RUPEE = 20;
const MIN_WITHDRAWAL_RUPEES = 200;

export default function UploaderProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { stats, isLoading } = useUserStats();
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

  const { data: withdrawalRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/earnings/withdrawals"],
    refetchInterval: 15000,
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: any) => {
      await apiRequest("POST", "/api/earnings/withdraw", withdrawalData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/earnings/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/earnings/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      setWithdrawalDialogOpen(false);
      setWithdrawalAmount("");
      setUpiId("");
      setBankDetails({ accountNumber: "", ifscCode: "", bankName: "", accountHolderName: "" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message || "Failed to submit withdrawal request", variant: "destructive" });
    },
  });

  const handleWithdrawalSubmit = () => {
    const amount = parseFloat(withdrawalAmount);
    const availableCoins = stats.totalEarnings || 0;
    const requestedCoins = Math.floor(amount * COINS_PER_RUPEE);

    if (!amount || amount < MIN_WITHDRAWAL_RUPEES) {
      toast({ title: "Error", description: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_RUPEES}`, variant: "destructive" });
      return;
    }
    if (requestedCoins > availableCoins) {
      toast({ title: "Error", description: "Insufficient coin balance", variant: "destructive" });
      return;
    }

    const withdrawalData: any = { amount, coins: requestedCoins };

    if (paymentMethod === "upi") {
      if (!upiId.trim()) {
        toast({ title: "Error", description: "Please provide UPI ID", variant: "destructive" });
        return;
      }
      withdrawalData.upiId = upiId.trim();
    } else {
      if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName || !bankDetails.accountHolderName) {
        toast({ title: "Error", description: "Please fill all bank details", variant: "destructive" });
        return;
      }
      withdrawalData.bankDetails = JSON.stringify(bankDetails);
    }

    withdrawalMutation.mutate(withdrawalData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':   return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':  return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'settled':   return <Badge variant="secondary" className="bg-green-100 text-green-800">Settled</Badge>;
      case 'rejected':  return <Badge variant="destructive">Rejected</Badge>;
      default:          return <Badge variant="outline">{status}</Badge>;
    }
  };

  const coinBalance = stats.coinBalance ?? stats.totalEarnings ?? 0;
  const notesApproved = stats.activeNotes ?? stats.notesUploaded ?? 0;
  const totalEarningsRupees = Math.floor(coinBalance / COINS_PER_RUPEE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/6 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <Header />
      <div className="flex relative z-10">
        <Sidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto">

          {/* Back + Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button variant="outline" size="sm" asChild className="mb-6 bg-black/20 backdrop-blur-md border-orange-400/30 text-white hover:bg-orange-500/20">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <h1 className="text-4xl font-bold text-white mb-1" data-testid="text-profile-title">
              My Earnings Dashboard
            </h1>
            <p className="text-gray-400 text-sm">Track your coins, approved notes &amp; withdraw earnings</p>
          </motion.div>

          {/* ── 3 Key Stats ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            {/* Coin Balance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.03 }}>
              <Card data-testid="card-coin-balance" className="bg-black/40 backdrop-blur-md border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Coin Balance</p>
                      <p className="text-3xl font-bold text-yellow-400 font-mono">{coinBalance.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">= ₹{totalEarningsRupees}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center">
                      <span className="text-2xl">🪙</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes Approved */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.03 }}>
              <Card data-testid="card-notes-approved" className="bg-black/40 backdrop-blur-md border border-green-400/30 hover:border-green-400/60 transition-all duration-300 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Notes Approved</p>
                      <p className="text-3xl font-bold text-green-400 font-mono">{notesApproved.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">published &amp; live</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-400/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Earnings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.03 }}>
              <Card data-testid="card-total-earnings" className="bg-black/40 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/60 transition-all duration-300 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Earnings</p>
                      <p className="text-3xl font-bold text-emerald-400 font-mono flex items-center">
                        <IndianRupee className="h-6 w-6 mr-1" />{totalEarningsRupees}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">available to withdraw</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ── Withdraw + History ───────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Withdrawal Request */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-black/40 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 shadow-xl h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-white text-lg">
                    <Wallet className="h-5 w-5 mr-2 text-emerald-400" />
                    Request Withdrawal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-gray-300 space-y-1">
                    <p>💰 Balance: <span className="text-yellow-400 font-bold">{coinBalance.toLocaleString()} coins</span></p>
                    <p>💵 Withdrawable: <span className="text-emerald-400 font-bold">₹{totalEarningsRupees}</span></p>
                    <p className="text-gray-500 text-xs">Min. withdrawal: ₹{MIN_WITHDRAWAL_RUPEES}</p>
                  </div>

                  <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3 shadow-lg hover:shadow-emerald-500/40"
                        disabled={coinBalance <= 0}
                        data-testid="button-request-withdrawal"
                      >
                        <IndianRupee className="h-4 w-4 mr-2" />
                        Withdraw Earnings
                        <Zap className="h-4 w-4 ml-2" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-lg bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl">
                      <DialogHeader>
                        <div className="flex items-center justify-center mb-3">
                          <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-full shadow-lg shadow-emerald-500/40">
                            <Wallet className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-white text-center">💰 Request Withdrawal</DialogTitle>
                        <p className="text-gray-400 text-sm text-center">Withdraw your earned coins securely</p>
                      </DialogHeader>

                      <div className="space-y-5 mt-2">
                        {/* Amount */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-white flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1 text-emerald-400" />
                            Amount (Min ₹{MIN_WITHDRAWAL_RUPEES})
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={withdrawalAmount}
                              onChange={(e) => setWithdrawalAmount(e.target.value)}
                              placeholder="Enter amount in ₹"
                              className="bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-emerald-400 pl-10 py-3 rounded-xl"
                              min="200"
                              max={totalEarningsRupees}
                              data-testid="input-withdrawal-amount"
                            />
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                          </div>
                          <p className="text-xs text-gray-500">
                            This will deduct {withdrawalAmount ? Math.floor(parseFloat(withdrawalAmount) * COINS_PER_RUPEE).toLocaleString() : "–"} coins
                          </p>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-white">Payment Method</label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger className="bg-white/5 border border-white/20 text-white focus:border-purple-400 py-3 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border border-white/10 rounded-xl">
                              <SelectItem value="upi" className="text-white focus:bg-orange-500/20">⚡ UPI (Instant)</SelectItem>
                              <SelectItem value="bank" className="text-white focus:bg-blue-500/20">🏦 Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* UPI / Bank fields */}
                        {paymentMethod === "upi" ? (
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-white">UPI ID</label>
                            <Input
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="yourname@gpay / @paytm"
                              className="bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-orange-400 py-3 rounded-xl"
                              data-testid="input-upi-id"
                            />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {[
                              { label: "Account Holder Name", key: "accountHolderName", placeholder: "Full name as per bank" },
                              { label: "Account Number", key: "accountNumber", placeholder: "Bank account number" },
                              { label: "IFSC Code", key: "ifscCode", placeholder: "e.g. SBIN0001234" },
                              { label: "Bank Name", key: "bankName", placeholder: "Bank name" },
                            ].map(({ label, key, placeholder }) => (
                              <div key={key} className="space-y-1">
                                <label className="text-xs font-semibold text-gray-300">{label}</label>
                                <Input
                                  value={(bankDetails as any)[key]}
                                  onChange={(e) => setBankDetails({ ...bankDetails, [key]: e.target.value })}
                                  placeholder={placeholder}
                                  className="bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-blue-400 py-2 rounded-xl text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setWithdrawalDialogOpen(false)}
                            className="flex-1 bg-white/5 border border-white/20 text-white hover:bg-white/10 rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleWithdrawalSubmit}
                            disabled={withdrawalMutation.isPending || !withdrawalAmount}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30"
                            data-testid="button-submit-withdrawal"
                          >
                            {withdrawalMutation.isPending ? (
                              <span className="flex items-center"><Sparkles className="h-4 w-4 mr-2 animate-spin" />Processing…</span>
                            ) : (
                              <span className="flex items-center"><Zap className="h-4 w-4 mr-2" />Submit</span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Withdrawal Requests */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-black/40 backdrop-blur-md border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 shadow-xl h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-white text-lg">
                    <Clock className="h-5 w-5 mr-2 text-purple-400" />
                    Recent Withdrawals
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {(withdrawalRequests as any[])?.length > 0 ? (
                    <div className="divide-y divide-slate-700/50">
                      {(withdrawalRequests as any[]).slice(0, 6).map((request: any) => (
                        <motion.div
                          key={request.id}
                          className="px-6 py-4 hover:bg-purple-500/10 transition-colors"
                          data-testid={`withdrawal-request-${request.id}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white flex items-center text-sm">
                              <IndianRupee className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                              ₹{request.amount}
                            </span>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-xs text-gray-500">{new Date(request.requestedAt).toLocaleDateString()}</p>
                          {request.adminComments && (
                            <p className="text-xs text-blue-400 mt-1">Admin: {request.adminComments}</p>
                          )}
                          {request.rejectionReason && (
                            <p className="text-xs text-red-400 mt-1">Reason: {request.rejectionReason}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="empty-withdrawal-requests">
                      <Clock className="h-10 w-10 text-purple-400 mx-auto mb-3 opacity-50" />
                      <p className="text-gray-400 text-sm font-medium">No withdrawal requests yet</p>
                      <p className="text-gray-600 text-xs mt-1">Your requests will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

        </main>
      </div>
    </div>
  );
}