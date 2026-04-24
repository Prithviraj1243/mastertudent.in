import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Coins, 
  IndianRupee,
  Wallet,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye,
  Star,
  Gift,
  CreditCard,
  Banknote,
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Conversion rate: 2 coins = 1 rupee
const COINS_PER_RUPEE = 2;
const MINIMUM_WITHDRAWAL_COINS = 100; // Minimum 100 coins (50 rupees)

interface EarningsStats {
  coinBalance: number;
  totalEarned: number;
  pendingWithdrawals: number;
  totalWithdrawn: number;
  availableForWithdrawal: number;
}

interface WithdrawalRequest {
  id: string;
  amount: number; // Rupees
  coins: number;
  status: 'pending' | 'approved' | 'rejected' | 'settled';
  upiId?: string;
  bankDetails?: any;
  requestedAt: string;
  processedAt?: string;
  adminComments?: string;
  rejectionReason?: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  coinChange: number;
  description: string;
  createdAt: string;
}

export default function EarningsPage() {
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [coinsToRedeem, setCoinsToRedeem] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch earnings stats
  const { data: stats, isLoading: statsLoading } = useQuery<EarningsStats>({
    queryKey: ['/api/earnings/stats'],
    refetchInterval: 30000,
  });

  // Fetch withdrawal requests
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<WithdrawalRequest[]>({
    queryKey: ['/api/earnings/withdrawals'],
  });

  // Fetch earning transactions
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/earnings/transactions'],
  });

  // Request withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: async (data: { coins: number; amount: number; upiId?: string; bankDetails?: string }) => {
      return apiRequest('POST', '/api/earnings/withdraw', data);
    },
    onSuccess: () => {
      toast({
        title: "✅ Withdrawal Request Submitted!",
        description: "Your request is being processed. You'll be notified once approved.",
      });
      setRedeemDialogOpen(false);
      setCoinsToRedeem("");
      setUpiId("");
      setBankDetails("");
      queryClient.invalidateQueries({ queryKey: ['/api/earnings/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/earnings/withdrawals'] });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRedeem = () => {
    const coins = parseInt(coinsToRedeem);
    
    if (!coins || coins < MINIMUM_WITHDRAWAL_COINS) {
      toast({
        title: "Invalid Amount",
        description: `Minimum withdrawal is ${MINIMUM_WITHDRAWAL_COINS} coins (₹${MINIMUM_WITHDRAWAL_COINS / COINS_PER_RUPEE})`,
        variant: "destructive",
      });
      return;
    }

    if (coins > (stats?.availableForWithdrawal || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough coins available for withdrawal",
        variant: "destructive",
      });
      return;
    }

    if (!upiId && !bankDetails) {
      toast({
        title: "Payment Details Required",
        description: "Please provide either UPI ID or bank details",
        variant: "destructive",
      });
      return;
    }

    const amount = coins / COINS_PER_RUPEE;
    withdrawalMutation.mutate({
      coins,
      amount,
      upiId: upiId || undefined,
      bankDetails: bankDetails || undefined,
    });
  };

  const coinsToRupees = (coins: number) => {
    return coins / COINS_PER_RUPEE;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Approved' },
      settled: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Settled' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
    };
    const { color, icon: Icon, label } = config[status as keyof typeof config] || config.pending;
    return (
      <Badge className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const rupeesAmount = coinsToRedeem ? coinsToRupees(parseInt(coinsToRedeem) || 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              💰 My Earnings
            </h1>
            <p className="text-lg text-gray-600">
              Track your coin earnings and redeem them for real money
            </p>
          </div>

          {/* Conversion Rate Info */}
          <Alert className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <Coins className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Conversion Rate:</strong> 2 Coins = ₹1 Rupee | Minimum withdrawal: {MINIMUM_WITHDRAWAL_COINS} coins (₹{MINIMUM_WITHDRAWAL_COINS / COINS_PER_RUPEE})
            </AlertDescription>
          </Alert>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-yellow-600">Coin Balance</p>
                  <Coins className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-yellow-700">
                  {statsLoading ? '...' : stats?.coinBalance?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  ≈ ₹{statsLoading ? '...' : coinsToRupees(stats?.coinBalance || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-600">Total Earned</p>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-700">
                  {statsLoading ? '...' : stats?.totalEarned?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  ≈ ₹{statsLoading ? '...' : coinsToRupees(stats?.totalEarned || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-600">Available to Withdraw</p>
                  <Wallet className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-700">
                  {statsLoading ? '...' : stats?.availableForWithdrawal?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  ≈ ₹{statsLoading ? '...' : coinsToRupees(stats?.availableForWithdrawal || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-purple-600">Total Withdrawn</p>
                  <IndianRupee className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-700">
                  ₹{statsLoading ? '...' : coinsToRupees(stats?.totalWithdrawn || 0).toFixed(2)}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  {stats?.totalWithdrawn || 0} coins redeemed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Redeem Button */}
          <Card className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 border-0 text-white">
            <CardContent className="p-8 text-center">
              <Banknote className="h-16 w-16 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold mb-2">Ready to Redeem Your Coins?</h2>
              <p className="mb-6 text-emerald-50">
                Convert your coins to rupees and withdraw to your UPI or bank account
              </p>
              <Button
                size="lg"
                onClick={() => setRedeemDialogOpen(true)}
                disabled={(stats?.availableForWithdrawal || 0) < MINIMUM_WITHDRAWAL_COINS}
                className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Redeem Coins for Cash
              </Button>
              {(stats?.availableForWithdrawal || 0) < MINIMUM_WITHDRAWAL_COINS && (
                <p className="text-sm text-emerald-100 mt-3">
                  Earn {MINIMUM_WITHDRAWAL_COINS - (stats?.availableForWithdrawal || 0)} more coins to withdraw
                </p>
              )}
            </CardContent>
          </Card>

          {/* Withdrawal History */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>Track your redemption requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <IndianRupee className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No withdrawal requests yet</p>
                  <p className="text-sm">Start earning coins to make your first withdrawal!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-lg">₹{withdrawal.amount.toFixed(2)}</p>
                          <Badge variant="outline" className="text-xs">
                            {withdrawal.coins} coins
                          </Badge>
                          {getStatusBadge(withdrawal.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          Requested {formatDistanceToNow(new Date(withdrawal.requestedAt), { addSuffix: true })}
                        </p>
                        {withdrawal.upiId && (
                          <p className="text-xs text-gray-500 mt-1">UPI: {withdrawal.upiId}</p>
                        )}
                        {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">Reason: {withdrawal.rejectionReason}</p>
                        )}
                        {withdrawal.status === 'settled' && withdrawal.processedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Settled {formatDistanceToNow(new Date(withdrawal.processedAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Earnings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Earnings</CardTitle>
              <CardDescription>Your latest coin transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {tx.type === 'coin_earned' ? (
                          <div className="p-2 bg-green-100 rounded-full">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Download className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.coinChange > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {tx.coinChange > 0 ? '+' : ''}{tx.coinChange} coins
                        </p>
                        <p className="text-xs text-gray-500">
                          ≈ ₹{coinsToRupees(Math.abs(tx.coinChange)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Redemption Dialog */}
          <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Redeem Coins for Cash</DialogTitle>
                <DialogDescription>
                  Convert your coins to rupees and withdraw to your account
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="coins">Coins to Redeem</Label>
                  <Input
                    id="coins"
                    type="number"
                    placeholder={`Min. ${MINIMUM_WITHDRAWAL_COINS} coins`}
                    value={coinsToRedeem}
                    onChange={(e) => setCoinsToRedeem(e.target.value)}
                    min={MINIMUM_WITHDRAWAL_COINS}
                    max={stats?.availableForWithdrawal}
                  />
                  {coinsToRedeem && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">You will receive:</span>
                        <span className="text-xl font-bold text-emerald-600">
                          ₹{rupeesAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="upi">UPI ID (Recommended)</Label>
                  <Input
                    id="upi"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>

                <div className="text-center text-sm text-gray-500">OR</div>

                <div>
                  <Label htmlFor="bank">Bank Details (Optional)</Label>
                  <Textarea
                    id="bank"
                    placeholder="Account holder name, Account number, IFSC code, Bank name"
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    rows={3}
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Withdrawals are processed within 2-3 business days. You'll receive a notification once approved.
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setRedeemDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRedeem}
                  disabled={withdrawalMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
