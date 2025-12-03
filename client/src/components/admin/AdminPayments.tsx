import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  user: string;
  date: string;
}

interface PaymentStats {
  totalCoins: number;
  earned: number;
  spent: number;
}

export default function AdminPayments() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalCoins: 0,
    earned: 0,
    spent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, typeFilter]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [transRes, statsRes] = await Promise.all([
        fetch('/api/admin/transactions'),
        fetch('/api/admin/coin-stats'),
      ]);

      if (!transRes.ok || !statsRes.ok) throw new Error('Failed to fetch payment data');

      const transactions = await transRes.json();
      const stats = await statsRes.json();

      setTransactions(transactions);
      setStats(stats);
    } catch (err) {
      setError('Failed to load payment data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (trans) =>
          trans.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trans.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((trans) => trans.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'User', 'Type', 'Amount', 'Description', 'Date'],
      ...filteredTransactions.map((t) => [
        t.id,
        t.user,
        t.type,
        t.amount,
        t.description,
        t.date,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${color}`}>
              {color.includes('green') ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {trend}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-lg ${color.replace('text-', 'bg-').replace('700', '100')}`}>
          <Icon className={color} size={32} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments & Transactions</h1>
          <p className="text-gray-600 mt-2">Total transactions: {transactions.length}</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={DollarSign}
          label="Total Coins in Circulation"
          value={stats.totalCoins}
          color="text-blue-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Coins Earned"
          value={stats.earned}
          trend="By users"
          color="text-green-700"
        />
        <StatCard
          icon={TrendingDown}
          label="Total Coins Spent"
          value={stats.spent}
          trend="By users"
          color="text-red-700"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by user or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="earn">Earned</option>
              <option value="spend">Spent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Description</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{transaction.user}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          transaction.type === 'earn'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.type === 'earn' ? 'Earned' : 'Spent'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`font-semibold ${
                          transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'earn' ? '+' : '-'}
                        {transaction.amount}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{transaction.description}</td>
                    <td className="py-4 px-6 text-gray-600 text-sm">{transaction.date}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Details</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">User:</span>
                <span className="font-semibold text-gray-900">{selectedTransaction.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTransaction.type === 'earn'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {selectedTransaction.type === 'earn' ? 'Earned' : 'Spent'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span
                  className={`font-semibold text-lg ${
                    selectedTransaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {selectedTransaction.type === 'earn' ? '+' : '-'}
                  {selectedTransaction.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="font-semibold text-gray-900">{selectedTransaction.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">{selectedTransaction.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-sm text-gray-600">{selectedTransaction.id}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTransaction(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
