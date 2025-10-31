import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, 
  TrendingUp, 
  Download, 
  Eye, 
  Heart,
  ShoppingCart,
  Gift,
  Target,
  Calendar,
  Wallet,
  CreditCard,
  Zap,
  Star,
  Trophy,
  Flame,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  coinChange: number;
  description: string;
  createdAt: string;
  noteId?: string;
}

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus: number;
  isPopular: boolean;
  isActive: boolean;
}

const transactionIcons: Record<string, any> = {
  'coin_earned': Coins,
  'coin_spent': ShoppingCart,
  'coin_purchased': CreditCard,
  'note_view': Eye,
  'note_download': Download,
  'note_like': Heart,
  'challenge_reward': Trophy,
  'daily_bonus': Gift,
  'streak_bonus': Flame,
};

const transactionColors: Record<string, string> = {
  'coin_earned': 'text-green-600',
  'coin_spent': 'text-red-600',
  'coin_purchased': 'text-blue-600',
  'note_view': 'text-purple-600',
  'note_download': 'text-orange-600',
  'note_like': 'text-pink-600',
  'challenge_reward': 'text-yellow-600',
  'daily_bonus': 'text-emerald-600',
  'streak_bonus': 'text-orange-500',
};

export default function CoinDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch coin balance and stats
  const { data: coinStats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ['/api/coins/balance'],
    refetchInterval: 30000,
  });

  // Fetch transaction history
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/coins/transactions'],
    enabled: activeTab === 'history',
  });

  // Fetch coin packages
  const { data: coinPackages = [] } = useQuery<CoinPackage[]>({
    queryKey: ['/api/coins/packages'],
    enabled: activeTab === 'purchase',
  });

  // Purchase coins mutation
  const purchaseCoinsMutation = useMutation({
    mutationFn: async (packageId: string) => {
      return apiRequest('POST', '/api/coins/purchase', { packageId });
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful! 🎉",
        description: "Your coins have been added to your account.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coins/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coins/transactions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2" data-testid="title-coin-dashboard">
            🪙 Coin Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your earnings, manage transactions, and purchase more coins
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Current Balance</p>
                  <p className="text-3xl font-bold text-yellow-700" data-testid="current-balance">
                    {statsLoading ? '...' : coinStats?.coinBalance?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="relative">
                  <Coins className="h-10 w-10 text-yellow-500 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Earned</p>
                  <p className="text-3xl font-bold text-green-700" data-testid="total-earned">
                    {statsLoading ? '...' : coinStats?.totalEarned?.toLocaleString() || '0'}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Spent</p>
                  <p className="text-3xl font-bold text-blue-700" data-testid="total-spent">
                    {statsLoading ? '...' : coinStats?.totalSpent?.toLocaleString() || '0'}
                  </p>
                </div>
                <ShoppingCart className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Free Downloads</p>
                  <p className="text-3xl font-bold text-purple-700" data-testid="free-downloads">
                    {statsLoading ? '...' : coinStats?.freeDownloadsLeft || '3'}
                  </p>
                </div>
                <Download className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="earn" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Earn Coins
                </TabsTrigger>
                <TabsTrigger value="purchase" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Buy Coins
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>
            <TabsContent value="overview" className="space-y-6">
              {/* Current Streak */}
              {coinStats?.streak && coinStats.streak > 0 && (
                <Card className="bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-orange-800 mb-1">
                          🔥 Current Streak: {coinStats.streak} days
                        </h3>
                        <p className="text-orange-600">Keep it up! Daily streaks earn bonus coins.</p>
                      </div>
                      <Flame className="h-12 w-12 text-orange-500 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Earning Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border border-purple-200 hover:bg-purple-50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Eye className="h-8 w-8 text-purple-600" />
                      <div>
                        <h4 className="font-semibold text-purple-900">View Notes</h4>
                        <p className="text-sm text-purple-600">+2 coins per view</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Browse study materials and earn coins for each note you view.</p>
                  </CardContent>
                </Card>

                <Card className="border border-green-200 hover:bg-green-50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Heart className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-900">Like Notes</h4>
                        <p className="text-sm text-green-600">+1 coin per like</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Show appreciation for quality content and earn coins.</p>
                  </CardContent>
                </Card>

                <Card className="border border-blue-200 hover:bg-blue-50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Daily Challenges</h4>
                        <p className="text-sm text-blue-600">+10-50 coins</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Complete daily tasks to earn bonus coin rewards.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => {
                    const IconComponent = transactionIcons[transaction.type] || Coins;
                    const iconColor = transactionColors[transaction.type] || 'text-gray-600';
                    const isPositive = transaction.coinChange > 0;
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className={`h-5 w-5 ${iconColor}`} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(transaction.createdAt))} ago
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          {isPositive ? '+' : ''}{transaction.coinChange}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="earn" className="space-y-6">
              <div className="text-center py-8">
                <Zap className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Earn Coins Every Day!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Multiple ways to earn coins and build your collection
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <Card className="border-2 border-yellow-200 bg-yellow-50">
                    <CardContent className="p-6 text-center">
                      <Eye className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-yellow-800 mb-2">View Study Notes</h4>
                      <p className="text-yellow-700 mb-4">Earn 2 coins for each note you view (once per day per note)</p>
                      <Badge className="bg-yellow-200 text-yellow-800">+2 coins</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-6 text-center">
                      <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-green-800 mb-2">Like Quality Content</h4>
                      <p className="text-green-700 mb-4">Show appreciation for great notes and earn coins</p>
                      <Badge className="bg-green-200 text-green-800">+1 coin</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-6 text-center">
                      <Star className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-purple-800 mb-2">Daily Login Bonus</h4>
                      <p className="text-purple-700 mb-4">Get coins just for logging in every day</p>
                      <Badge className="bg-purple-200 text-purple-800">+5 coins</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-orange-200 bg-orange-50">
                    <CardContent className="p-6 text-center">
                      <Flame className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-orange-800 mb-2">Streak Bonuses</h4>
                      <p className="text-orange-700 mb-4">Maintain daily activity streaks for extra rewards</p>
                      <Badge className="bg-orange-200 text-orange-800">+10-50 coins</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="purchase" className="space-y-6">
              <div className="text-center mb-8">
                <CreditCard className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Purchase Coin Packages
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get more coins instantly with our affordable packages
                </p>
              </div>

              {coinPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coinPackages.map((pkg) => (
                    <Card key={pkg.id} className={`relative ${pkg.isPopular ? 'border-2 border-yellow-400 shadow-lg scale-105' : 'border border-gray-200'}`}>
                      {pkg.isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-yellow-400 text-yellow-900">Most Popular</Badge>
                        </div>
                      )}
                      <CardContent className="p-6 text-center">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h4>
                        <div className="mb-4">
                          <p className="text-3xl font-bold text-blue-600">{pkg.coins.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">coins</p>
                          {pkg.bonus > 0 && (
                            <p className="text-sm text-green-600 font-medium">+{pkg.bonus} bonus coins!</p>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          ₹{pkg.price}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                          ₹{(pkg.price / pkg.coins).toFixed(3)} per coin
                        </p>
                        <Button 
                          onClick={() => purchaseCoinsMutation.mutate(pkg.id)}
                          disabled={purchaseCoinsMutation.isPending}
                          className={`w-full ${pkg.isPopular ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                          data-testid={`button-purchase-${pkg.id}`}
                        >
                          {purchaseCoinsMutation.isPending ? "Processing..." : "Purchase"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No packages available</h3>
                  <p className="text-gray-600 dark:text-gray-300">Coin packages will be available soon!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => {
                    const IconComponent = transactionIcons[transaction.type] || Coins;
                    const iconColor = transactionColors[transaction.type] || 'text-gray-600';
                    const isPositive = transaction.coinChange > 0;
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" data-testid={`transaction-${transaction.id}`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full bg-gray-100`}>
                            <IconComponent className={`h-5 w-5 ${iconColor}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString()} • {new Date(transaction.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center gap-1 font-bold text-lg ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                            {isPositive ? '+' : ''}{transaction.coinChange}
                          </div>
                          <p className="text-sm text-gray-500">{transaction.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Start earning and spending coins to see your transaction history here.
                  </p>
                </div>
              )}
            </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </main>
      </div>
    </div>
  );
}