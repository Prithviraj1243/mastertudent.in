import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IndianRupee, Wallet, Clock, CheckCircle, XCircle, Zap, Sparkles, Upload, ImagePlus, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { useUserStats } from "@/hooks/useUserStats";

const COINS_PER_RUPEE = 20;

interface WithdrawalRequest {
  id: string;
  amount: number;
  coins: number;
  status: "pending" | "approved" | "rejected" | "settled";
  upiId?: string;
  requestedAt: string;
  processedAt?: string;
  adminComments?: string;
  rejectionReason?: string;
}

export default function EarningsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank">("upi");
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { stats } = useUserStats();

  const coinBalance = stats?.coinBalance ?? stats?.totalEarnings ?? 0;
  const availableRupees = Math.floor(coinBalance / COINS_PER_RUPEE);

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<WithdrawalRequest[]>({
    queryKey: ["/api/earnings/withdrawals"],
    refetchInterval: 15000,
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/earnings/withdraw", data),
    onSuccess: () => {
      toast({
        title: "✅ Request Submitted!",
        description: "Your withdrawal request is being reviewed. It takes up to 24 hours to process your money.",
        duration: 6000,
      });
      setDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/earnings/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
    onError: (error: Error) => {
      toast({ title: "❌ Failed", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setAmount("");
    setUpiId("");
    setBankDetails({ accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "" });
    setScreenshot(null);
    setScreenshotPreview(null);
    setPaymentMethod("upi");
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
      return;
    }
    setScreenshot(file);
    const reader = new FileReader();
    reader.onloadend = () => setScreenshotPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshot) return null;
    const formData = new FormData();
    formData.append("file", screenshot);
    const response = await fetch("/api/earnings/upload-screenshot", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(err.message || "Screenshot upload failed");
    }
    const { url } = await response.json();
    return url;
  };

  const handleSubmit = async () => {
    const rupees = parseFloat(amount);
    if (!rupees || rupees <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (rupees > availableRupees) {
      toast({ title: "Insufficient Balance", description: "Not enough coins to withdraw this amount.", variant: "destructive" });
      return;
    }
    if (!screenshot) {
      toast({ title: "Screenshot Required", description: "Please upload a screenshot or QR code of your payment details.", variant: "destructive" });
      return;
    }
    if (paymentMethod === "upi" && !upiId.trim()) {
      toast({ title: "Error", description: "Please enter your UPI ID", variant: "destructive" });
      return;
    }
    if (paymentMethod === "bank" && (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName || !bankDetails.accountHolderName)) {
      toast({ title: "Error", description: "Please fill all bank details", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const screenshotUrl = await uploadScreenshot();
      const coins = Math.floor(rupees * COINS_PER_RUPEE);
      const payload: any = {
        amount: rupees,
        coins,
        screenshotUrl,
      };
      if (paymentMethod === "upi") {
        payload.upiId = upiId.trim();
      } else {
        payload.bankDetails = JSON.stringify(bankDetails);
      }
      withdrawMutation.mutate(payload);
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message || "Could not upload screenshot", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":  return <Badge className="bg-yellow-100 text-yellow-800 text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved": return <Badge className="bg-blue-100 text-blue-800 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "settled":  return <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Settled</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-800 text-xs"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:         return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const isSubmitting = uploading || withdrawMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/4 left-1/6 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <Header />
      <div className="flex relative z-10">
        <Sidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto">

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-1">My Earnings</h1>
            <p className="text-gray-400 text-sm">20 coins = ₹1 · Withdrawals processed within 24 hours</p>
          </div>

          {/* 3 Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card data-testid="card-coin-balance" className="bg-black/40 backdrop-blur-md border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 shadow-xl hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Coin Balance</p>
                    <p className="text-3xl font-bold text-yellow-400 font-mono">{coinBalance.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">= ₹{availableRupees}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center text-2xl">🪙</div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-available" className="bg-black/40 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/60 transition-all duration-300 shadow-xl hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Available</p>
                    <p className="text-3xl font-bold text-emerald-400 font-mono flex items-center">
                      <IndianRupee className="h-6 w-6 mr-0.5" />{availableRupees}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ready to withdraw</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-withdrawals" className="bg-black/40 backdrop-blur-md border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 shadow-xl hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Withdrawals</p>
                    <p className="text-3xl font-bold text-purple-400 font-mono">{withdrawals.length}</p>
                    <p className="text-xs text-gray-500 mt-1">total requests</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-400/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Withdraw + History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Withdraw Card */}
            <Card className="bg-black/40 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-lg">
                  <Wallet className="h-5 w-5 mr-2 text-emerald-400" />
                  Request Withdrawal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-gray-300 space-y-1">
                  <p>🪙 Coins: <span className="text-yellow-400 font-bold">{coinBalance.toLocaleString()}</span></p>
                  <p>💵 Withdrawable: <span className="text-emerald-400 font-bold">₹{availableRupees}</span></p>
                  <p className="text-gray-500 text-xs">Processed within 24 hours</p>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3 shadow-lg hover:shadow-emerald-500/40"
                  disabled={coinBalance <= 0}
                  onClick={() => setDialogOpen(true)}
                  data-testid="button-request-withdrawal"
                >
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Withdraw Earnings
                  <Zap className="h-4 w-4 ml-2" />
                </Button>

                {coinBalance <= 0 && (
                  <p className="text-xs text-center text-gray-500">Earn coins by uploading notes to withdraw</p>
                )}
              </CardContent>
            </Card>

            {/* Withdrawal History */}
            <Card className="bg-black/40 backdrop-blur-md border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-lg">
                  <Clock className="h-5 w-5 mr-2 text-purple-400" />
                  Withdrawal History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {withdrawalsLoading ? (
                  <div className="text-center py-10 text-gray-500 text-sm">Loading…</div>
                ) : withdrawals.length === 0 ? (
                  <div className="text-center py-12" data-testid="empty-withdrawal-requests">
                    <Clock className="h-10 w-10 text-purple-400 mx-auto mb-3 opacity-40" />
                    <p className="text-gray-400 text-sm">No requests yet</p>
                    <p className="text-gray-600 text-xs mt-1">Your withdrawals will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700/50">
                    {withdrawals.slice(0, 6).map((w) => (
                      <div key={w.id} className="px-6 py-4 hover:bg-purple-500/10 transition-colors" data-testid={`withdrawal-${w.id}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white text-sm flex items-center">
                            <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-emerald-400" />₹{w.amount}
                          </span>
                          {getStatusBadge(w.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(w.requestedAt), { addSuffix: true })}
                        </p>
                        {w.upiId && <p className="text-xs text-gray-600 mt-0.5">UPI: {w.upiId}</p>}
                        {w.adminComments && <p className="text-xs text-blue-400 mt-0.5">Admin: {w.adminComments}</p>}
                        {w.rejectionReason && <p className="text-xs text-red-400 mt-0.5">Reason: {w.rejectionReason}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* ── Withdrawal Dialog ───────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!isSubmitting) { setDialogOpen(open); if (!open) resetForm(); } }}>
        <DialogContent className="sm:max-w-md bg-slate-900/98 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-center mb-2">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-full shadow-lg shadow-emerald-500/40">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-white text-center">💰 Withdraw Earnings</DialogTitle>
            <p className="text-gray-400 text-sm text-center">Balance: ₹{availableRupees} · Processed in 24 hrs</p>
          </DialogHeader>

          <div className="space-y-4 mt-1">

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white">Amount (₹)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={1}
                  max={availableRupees}
                  className="bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-emerald-400 pl-9 py-3 rounded-xl"
                  data-testid="input-withdrawal-amount"
                />
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
              </div>
              {amount && parseFloat(amount) > 0 && (
                <p className="text-xs text-gray-500">
                  Deducts {Math.floor(parseFloat(amount) * COINS_PER_RUPEE).toLocaleString()} coins
                </p>
              )}
            </div>

            {/* Payment Method Toggle */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white">Payment Method</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${paymentMethod === "upi" ? "bg-orange-500/20 border-orange-400/60 text-orange-300" : "border-white/10 text-gray-400 hover:border-white/20"}`}
                >
                  ⚡ UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${paymentMethod === "bank" ? "bg-blue-500/20 border-blue-400/60 text-blue-300" : "border-white/10 text-gray-400 hover:border-white/20"}`}
                >
                  🏦 Bank Transfer
                </button>
              </div>
            </div>

            {/* UPI Fields */}
            {paymentMethod === "upi" ? (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-white">UPI ID</label>
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@gpay / @paytm / @phonepe"
                  className="bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-orange-400 py-3 rounded-xl"
                  data-testid="input-upi-id"
                />
              </div>
            ) : (
              /* Bank Fields */
              <div className="space-y-3">
                {[
                  { label: "Account Holder Name", key: "accountHolderName", placeholder: "Full name as per bank" },
                  { label: "Account Number", key: "accountNumber", placeholder: "Bank account number" },
                  { label: "IFSC Code", key: "ifscCode", placeholder: "e.g. SBIN0001234" },
                  { label: "Bank Name", key: "bankName", placeholder: "e.g. State Bank of India" },
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

            {/* Screenshot Upload — Mandatory */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white flex items-center gap-1.5">
                <ImagePlus className="h-4 w-4 text-pink-400" />
                Screenshot / QR Code
                <span className="text-red-400 text-xs font-normal ml-1">* required</span>
              </label>
              <p className="text-xs text-gray-500">Upload a screenshot of your UPI QR or bank passbook (max 5MB)</p>

              {/* Upload area */}
              {!screenshotPreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/20 hover:border-pink-400/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all hover:bg-pink-500/5 cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-500" />
                  <span className="text-sm text-gray-400">Click to upload screenshot or QR</span>
                  <span className="text-xs text-gray-600">PNG, JPG, WEBP · Max 5MB</span>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <img src={screenshotPreview} alt="Screenshot preview" className="w-full max-h-40 object-contain bg-black/40" />
                  <button
                    type="button"
                    onClick={() => { setScreenshot(null); setScreenshotPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 rounded-full p-1 transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 rounded-lg px-2 py-1">
                    <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" />{screenshot?.name}</span>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleScreenshotChange}
                className="hidden"
                data-testid="input-screenshot"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setDialogOpen(false); resetForm(); }}
                disabled={isSubmitting}
                className="flex-1 bg-white/5 border border-white/20 text-white hover:bg-white/10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !amount}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30"
                data-testid="button-submit-withdrawal"
              >
                {isSubmitting ? (
                  <span className="flex items-center"><Sparkles className="h-4 w-4 mr-2 animate-spin" />{uploading ? "Uploading…" : "Submitting…"}</span>
                ) : (
                  <span className="flex items-center"><Zap className="h-4 w-4 mr-2" />Submit Request</span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
