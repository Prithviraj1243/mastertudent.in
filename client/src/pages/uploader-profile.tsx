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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Upload, Wallet, FileText, TrendingUp, IndianRupee, Clock, CheckCircle, X, ArrowLeft, BookOpen, Star, Crown, Zap, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState } from "react";
import { motion } from "framer-motion";

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

  // Mock withdrawal requests for now
  const withdrawalRequests: any[] = [];

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

    if (amount > stats.totalEarnings) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 4 === 0 ? 'w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500' :
                i % 4 === 1 ? 'w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500' :
                i % 4 === 2 ? 'w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500' :
                'w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      </div>

      <Header />
      <div className="flex relative z-10">
        <Sidebar />
        <main className="flex-1 p-6">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="sm" asChild className="bg-black/20 backdrop-blur-md border-orange-400/30 text-white hover:bg-orange-500/20">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="sm" asChild className="bg-black/20 backdrop-blur-md border-purple-400/30 text-white hover:bg-purple-500/20">
                  <Link href="/">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Notes
                  </Link>
                </Button>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-full mb-6">
                <Crown className="w-4 h-4 text-orange-400 mr-2" />
                <span className="text-orange-400 text-sm font-medium">Topper Dashboard</span>
              </div>
              
              <h1 className="text-5xl font-bold text-white mb-4 leading-tight" data-testid="text-profile-title">
                💰 My Profile & 
                <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                  Earnings
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto" data-testid="text-profile-description">
                Track your uploads, earnings, and manage withdrawals in your 
                <span className="text-orange-400 font-semibold"> premium dashboard</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card data-testid="card-total-uploads" className="bg-black/40 backdrop-blur-md border border-orange-400/30 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Total Uploads</p>
                      <p className="text-3xl font-bold text-orange-400 font-mono">
                        {stats.notesUploaded.toLocaleString()}
                      </p>
                    </div>
                    <div className="relative">
                      <Upload className="h-8 w-8 text-orange-400 group-hover:animate-bounce" />
                      <Sparkles className="h-4 w-4 text-orange-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card data-testid="card-published-notes" className="bg-black/40 backdrop-blur-md border border-green-400/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Published Notes</p>
                      <p className="text-3xl font-bold text-green-400 font-mono">
                        {stats.notesUploaded.toLocaleString()}
                      </p>
                    </div>
                    <div className="relative">
                      <FileText className="h-8 w-8 text-green-400 group-hover:animate-pulse" />
                      <Star className="h-4 w-4 text-green-300 absolute -top-1 -right-1 animate-spin" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card data-testid="card-total-downloads" className="bg-black/40 backdrop-blur-md border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Total Downloads</p>
                      <p className="text-3xl font-bold text-blue-400 font-mono">
                        {stats?.totalDownloads || 0}
                      </p>
                    </div>
                    <div className="relative">
                      <TrendingUp className="h-8 w-8 text-blue-400 group-hover:animate-bounce" />
                      <Zap className="h-4 w-4 text-blue-300 absolute -top-1 -right-1 animate-ping" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card data-testid="card-wallet-balance" className="bg-black/40 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-green-400/5"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Wallet Balance</p>
                      <p className="text-3xl font-bold text-emerald-400 flex items-center font-mono">
                        <IndianRupee className="h-6 w-6 mr-1 group-hover:animate-spin" />
                        {stats.totalEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div className="relative">
                      <Wallet className="h-8 w-8 text-emerald-400 group-hover:animate-pulse" />
                      <Crown className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Enhanced Wallet Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Withdrawal Request */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Card className="bg-black/40 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Wallet className="h-6 w-6 mr-3 text-emerald-400" />
                    </motion.div>
                    Request Withdrawal
                    <Sparkles className="h-4 w-4 ml-2 text-emerald-300 animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-6">
                    Minimum withdrawal: ₹200 | Current balance: ₹{stats.totalEarnings.toLocaleString()}
                  </p>
                  
                  <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
                    <DialogTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3 shadow-lg hover:shadow-emerald-500/50"
                          disabled={stats.totalEarnings < 200}
                          data-testid="button-request-withdrawal"
                        >
                          <IndianRupee className="h-5 w-5 mr-2" />
                          Request Withdrawal
                          <Zap className="h-4 w-4 ml-2 animate-pulse" />
                        </Button>
                      </motion.div>
                    </DialogTrigger>
                  <DialogContent className="sm:max-w-lg bg-black/20 backdrop-blur-2xl border-2 border-white/20 shadow-2xl shadow-emerald-500/20 rounded-2xl overflow-hidden relative">
                    {/* Glass effect background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative z-10"
                    >
                      <DialogHeader className="text-center pb-6">
                        <motion.div
                          initial={{ y: -20 }}
                          animate={{ y: 0 }}
                          className="flex items-center justify-center mb-4"
                        >
                          <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4 rounded-full shadow-lg shadow-emerald-500/50">
                            <Wallet className="h-8 w-8 text-white" />
                          </div>
                        </motion.div>
                        <DialogTitle className="text-3xl font-bold text-white mb-2">
                          💰 Request Withdrawal
                        </DialogTitle>
                        <p className="text-white/80 text-base">Withdraw your earnings securely</p>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Amount Input */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="space-y-3"
                        >
                          <label className="text-lg font-bold text-white flex items-center">
                            <IndianRupee className="h-5 w-5 mr-2 text-emerald-400" />
                            Amount (Minimum ₹200)
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={withdrawalAmount}
                              onChange={(e) => setWithdrawalAmount(e.target.value)}
                              placeholder="Enter amount"
                              className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white text-lg placeholder-white/60 focus:border-emerald-400 focus:ring-emerald-400/30 focus:bg-white/20 pl-12 py-4 rounded-xl shadow-lg"
                              min="200"
                              max={stats.totalEarnings}
                              data-testid="input-withdrawal-amount"
                            />
                            <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-emerald-400" />
                          </div>
                          <p className="text-sm text-white/70 bg-emerald-500/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                            💰 Available Balance: ₹{stats.totalEarnings.toLocaleString()}
                          </p>
                        </motion.div>
                        
                        {/* Payment Method */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="space-y-3"
                        >
                          <label className="text-lg font-bold text-white flex items-center">
                            <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                            Payment Method
                          </label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white text-lg focus:border-purple-400 focus:ring-purple-400/30 focus:bg-white/20 py-4 rounded-xl shadow-lg">
                              <SelectValue className="text-white" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/80 backdrop-blur-xl border-2 border-white/20 rounded-xl shadow-2xl">
                              <SelectItem value="upi" className="text-white hover:bg-orange-500/30 focus:bg-orange-500/30 rounded-lg m-1">
                                <div className="flex items-center py-2">
                                  <Zap className="h-5 w-5 mr-3 text-orange-400" />
                                  <div>
                                    <div className="font-semibold">UPI Payment</div>
                                    <div className="text-sm text-white/70">Instant Transfer</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="bank" className="text-white hover:bg-blue-500/30 focus:bg-blue-500/30 rounded-lg m-1">
                                <div className="flex items-center py-2">
                                  <Wallet className="h-5 w-5 mr-3 text-blue-400" />
                                  <div>
                                    <div className="font-semibold">Bank Transfer</div>
                                    <div className="text-sm text-white/70">Secure Transfer</div>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>

                        {/* UPI Details */}
                        {paymentMethod === "upi" ? (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/10 backdrop-blur-xl border-2 border-orange-400/40 rounded-2xl p-6 space-y-4 shadow-2xl shadow-orange-500/20"
                          >
                            <div className="flex items-center mb-4">
                              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl mr-4 shadow-lg shadow-orange-500/50">
                                <Zap className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-white text-xl font-bold">⚡ UPI Payment</h4>
                                <p className="text-white/70 text-sm">Instant & Secure Transfer</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <label className="text-lg font-bold text-white">UPI ID:</label>
                              <div className="relative">
                                <Input
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  placeholder="yourname@paytm / yourname@gpay"
                                  className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white text-lg placeholder-white/60 focus:border-orange-400 focus:ring-orange-400/30 focus:bg-white/20 pl-14 py-4 rounded-xl shadow-lg"
                                  data-testid="input-upi-id"
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                  <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-sm text-white font-bold">@</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-3 mt-4">
                                <span className="text-sm bg-orange-500/30 text-white px-4 py-2 rounded-full backdrop-blur-sm font-semibold">📱 GPay</span>
                                <span className="text-sm bg-blue-500/30 text-white px-4 py-2 rounded-full backdrop-blur-sm font-semibold">📱 PhonePe</span>
                                <span className="text-sm bg-purple-500/30 text-white px-4 py-2 rounded-full backdrop-blur-sm font-semibold">📱 Paytm</span>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/10 backdrop-blur-xl border-2 border-blue-400/40 rounded-2xl p-6 space-y-5 shadow-2xl shadow-blue-500/20"
                          >
                            <div className="flex items-center mb-4">
                              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl mr-4 shadow-lg shadow-blue-500/50">
                                <Wallet className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-white text-xl font-bold">🏦 Bank Transfer</h4>
                                <p className="text-white/70 text-sm">Secure Bank Transfer</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-5">
                              <div className="space-y-2">
                                <label className="text-lg font-bold text-white">Account Holder Name:</label>
                                <Input
                                  value={bankDetails.accountHolderName}
                                  onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                                  placeholder="Full name as per bank"
                                  className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white text-lg placeholder-white/60 focus:border-blue-400 focus:ring-blue-400/30 focus:bg-white/20 py-4 rounded-xl shadow-lg"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-lg font-bold text-white">Account Number:</label>
                                <Input
                                  value={bankDetails.accountNumber}
                                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                                  placeholder="Bank account number"
                                  className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white text-lg placeholder-white/60 focus:border-blue-400 focus:ring-blue-400/30 focus:bg-white/20 py-4 rounded-xl shadow-lg"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-lg font-bold text-white">IFSC Code:</label>
                                <Input
                                  value={bankDetails.ifscCode}
                                  onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                                  placeholder="IFSC code"
                                  className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white text-lg placeholder-white/60 focus:border-blue-400 focus:ring-blue-400/30 focus:bg-white/20 py-4 rounded-xl shadow-lg"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-lg font-bold text-white">Bank Name:</label>
                                <Input
                                  value={bankDetails.bankName}
                                  onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                                  placeholder="Bank name"
                                  className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white text-lg placeholder-white/60 focus:border-blue-400 focus:ring-blue-400/30 focus:bg-white/20 py-4 rounded-xl shadow-lg"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Action Buttons */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex justify-center space-x-4 pt-6"
                        >
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              onClick={() => setWithdrawalDialogOpen(false)}
                              className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
                            >
                              ❌ Cancel
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={handleWithdrawalSubmit}
                              disabled={withdrawalMutation.isPending || !withdrawalAmount}
                              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold px-10 py-3 text-lg rounded-xl shadow-2xl shadow-emerald-500/50 border-2 border-emerald-400/30"
                              data-testid="button-submit-withdrawal"
                            >
                              {withdrawalMutation.isPending ? (
                                <div className="flex items-center">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="mr-3"
                                  >
                                    <Sparkles className="h-5 w-5" />
                                  </motion.div>
                                  Processing...
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Zap className="h-5 w-5 mr-3" />
                                  💰 Submit Request
                                </div>
                              )}
                            </Button>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Withdrawal Requests */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Card className="bg-black/40 backdrop-blur-md border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Clock className="h-6 w-6 mr-3 text-purple-400" />
                    </motion.div>
                    Recent Withdrawal Requests
                    <Star className="h-4 w-4 ml-2 text-purple-300 animate-spin" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {withdrawalRequests?.length > 0 ? (
                    <div className="divide-y divide-slate-700/50">
                      {withdrawalRequests.slice(0, 5).map((request: any) => (
                        <motion.div 
                          key={request.id} 
                          className="p-4 hover:bg-purple-500/10 transition-colors"
                          data-testid={`withdrawal-request-${request.id}`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium flex items-center text-white">
                              <IndianRupee className="h-4 w-4 mr-1 text-emerald-400" />
                              ₹{request.amount}
                            </span>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </div>
                          {request.adminComments && (
                            <div className="text-sm text-blue-400 mt-1">
                              Admin: {request.adminComments}
                            </div>
                          )}
                          {request.rejectionReason && (
                            <div className="text-sm text-red-400 mt-1">
                              Rejected: {request.rejectionReason}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-12" 
                      data-testid="empty-withdrawal-requests"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <Clock className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-gray-300 font-medium">No withdrawal requests yet</p>
                      <p className="text-sm text-gray-500 mt-1">Your requests will appear here</p>
                    </motion.div>
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