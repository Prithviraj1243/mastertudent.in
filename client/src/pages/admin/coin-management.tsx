import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Coins,
  Search,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Gift,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'earned' | 'spent' | 'bonus' | 'refund';
  amount: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: string;
}

interface CoinStats {
  totalCoinsInCirculation: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  averageBalance: number;
}

interface AdminWithdrawal {
  id: string;
  topperId: string;
  amount: string | number;
  coins: number;
  status: 'pending' | 'approved' | 'rejected' | 'settled';
  upiId?: string | null;
  requestedAt: string;
  processedAt?: string | null;
  rejectionReason?: string | null;
}

export default function CoinManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: stats } = useQuery<CoinStats>({
    queryKey: ['/api/admin/coin-stats'],
    retry: false,
  });

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    retry: false,
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<AdminWithdrawal[]>({
    queryKey: ['/api/admin/withdrawals'],
    retry: false,
    refetchInterval: 10000,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to approve withdrawal');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Withdrawal approved', description: 'User will receive payout update within 24 hours.' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Approval failed', description: error.message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (payload: { id: string; reason: string }) => {
      const res = await fetch(`/api/admin/withdrawals/${payload.id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: payload.reason }),
      });
      if (!res.ok) throw new Error('Failed to reject withdrawal');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Withdrawal rejected' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Rejection failed', description: error.message, variant: 'destructive' });
    },
  });

  const filteredTransactions = transactions?.filter((tx) => {
    const matchesSearch = tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  }) || [];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'earned':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Earned</Badge>;
      case 'spent':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Spent</Badge>;
      case 'bonus':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Bonus</Badge>;
      case 'refund':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Refund</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'spent':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'refund':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getWithdrawalStatusBadge = (status: string) => {
    if (status === 'pending') return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    if (status === 'approved') return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    if (status === 'settled') return <Badge className="bg-green-500/10 text-green-400 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Settled</Badge>;
    return <Badge className="bg-red-500/10 text-red-400 border-red-500/20"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Coin Management</h1>
            <p className="text-slate-400">Monitor and manage coin economy</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Transactions
          </Button>
        </div>

        {/* Coin Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Coins in Circulation</p>
                <p className="text-white text-3xl font-bold">
                  {stats?.totalCoinsInCirculation.toLocaleString() || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Earned</p>
                <p className="text-white text-3xl font-bold">
                  {stats?.totalCoinsEarned.toLocaleString() || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Spent</p>
                <p className="text-white text-3xl font-bold">
                  {stats?.totalCoinsSpent.toLocaleString() || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Average Balance</p>
                <p className="text-white text-3xl font-bold">
                  {stats?.averageBalance.toLocaleString() || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Gift Coins to User</p>
                  <Button className="mt-2 bg-green-600 hover:bg-green-700" size="sm">
                    Send Bonus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Process Refund</p>
                  <Button className="mt-2 bg-blue-600 hover:bg-blue-700" size="sm">
                    Refund Coins
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Coins className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Adjust Balance</p>
                  <Button className="mt-2 bg-purple-600 hover:bg-purple-700" size="sm">
                    Modify Balance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions by user or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={typeFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('all')}
                  className={typeFilter === 'all' ? 'bg-blue-600' : 'border-slate-700 text-slate-300'}
                >
                  All
                </Button>
                <Button
                  variant={typeFilter === 'earned' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('earned')}
                  className={typeFilter === 'earned' ? 'bg-green-600' : 'border-slate-700 text-slate-300'}
                >
                  Earned
                </Button>
                <Button
                  variant={typeFilter === 'spent' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('spent')}
                  className={typeFilter === 'spent' ? 'bg-red-600' : 'border-slate-700 text-slate-300'}
                >
                  Spent
                </Button>
                <Button
                  variant={typeFilter === 'bonus' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('bonus')}
                  className={typeFilter === 'bonus' ? 'bg-purple-600' : 'border-slate-700 text-slate-300'}
                >
                  Bonus
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400">Description</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Balance Before</TableHead>
                  <TableHead className="text-slate-400">Balance After</TableHead>
                  <TableHead className="text-slate-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(tx.type)}
                          {getTypeBadge(tx.type)}
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-medium">{tx.userName}</TableCell>
                      <TableCell className="text-slate-300">{tx.description}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          tx.type === 'earned' || tx.type === 'bonus' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {tx.type === 'earned' || tx.type === 'bonus' ? '+' : '-'}{tx.amount}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">{tx.balanceBefore}</TableCell>
                      <TableCell className="text-slate-300">{tx.balanceAfter}</TableCell>
                      <TableCell className="text-slate-300">{tx.timestamp}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Withdrawal Requests */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Withdrawal Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Coins</TableHead>
                  <TableHead className="text-slate-400">UPI</TableHead>
                  <TableHead className="text-slate-400">Requested</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">Loading requests...</TableCell>
                  </TableRow>
                ) : withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">No withdrawal requests</TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map((w) => (
                    <TableRow key={w.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="text-white font-semibold">₹{Number(w.amount).toFixed(2)}</TableCell>
                      <TableCell className="text-slate-300">{w.coins}</TableCell>
                      <TableCell className="text-slate-300">{w.upiId || '-'}</TableCell>
                      <TableCell className="text-slate-300">{formatDistanceToNow(new Date(w.requestedAt), { addSuffix: true })}</TableCell>
                      <TableCell>{getWithdrawalStatusBadge(w.status)}</TableCell>
                      <TableCell className="text-right">
                        {w.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approveMutation.mutate(w.id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const reason = window.prompt('Reason for rejection:', 'Invalid payment details') || 'Rejected by admin';
                                rejectMutation.mutate({ id: w.id, reason });
                              }}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Processed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
