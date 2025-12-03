import React, { useState, useEffect } from 'react';
import { Users, FileText, CreditCard, TrendingUp, Calendar, Activity } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalNotes: number;
  approvedNotes: number;
  totalCoins: number;
  totalTransactions: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalNotes: 0,
    approvedNotes: 0,
    totalCoins: 0,
    totalTransactions: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [usersRes, notesRes, transactionsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/notes'),
        fetch('/api/admin/transactions'),
      ]);

      const users = await usersRes.json();
      const notes = await notesRes.json();
      const transactions = await transactionsRes.json();

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.isActive).length,
        totalNotes: notes.length,
        approvedNotes: notes.filter((n: any) => n.status === 'approved' || n.status === 'published').length,
        totalCoins: users.reduce((sum: number, u: any) => sum + (u.coins || 0), 0),
        totalTransactions: transactions.length,
        recentActivity: transactions.slice(0, 5),
      });
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, trend }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
              <TrendingUp size={16} />
              {trend}
            </p>
          )}
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <Icon className="text-blue-600" size={32} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the admin panel. Here's your overview.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          trend={`${stats.activeUsers} active`}
        />
        <StatCard
          icon={FileText}
          label="Total Notes"
          value={stats.totalNotes}
          trend={`${stats.approvedNotes} approved`}
        />
        <StatCard
          icon={CreditCard}
          label="Total Coins"
          value={stats.totalCoins.toLocaleString()}
          trend="In circulation"
        />
        <StatCard
          icon={Activity}
          label="Transactions"
          value={stats.totalTransactions}
          trend="All time"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
        </div>

        {stats.recentActivity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map((activity: any) => (
                  <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{activity.user}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          activity.type === 'earn'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {activity.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{activity.amount}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{activity.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent transactions</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth</h3>
          <div className="h-32 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Chart coming soon</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Note Distribution</h3>
          <div className="h-32 bg-gradient-to-r from-green-50 to-green-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Chart coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
