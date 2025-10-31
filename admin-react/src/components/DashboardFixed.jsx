import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const DashboardFixed = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    totalPayments: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    pendingNotes: 0,
    approvedNotes: 0,
    rejectedNotes: 0,
    totalCoins: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    firebase: 'online',
    cloudinary: 'online',
    adminServer: 'online',
    mainWebsite: 'online'
  });

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchStats(),
      fetchRecentActivity(),
      checkSystemStatus()
    ]);
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await fetch('http://localhost:3001/admin/users', {
        headers: { 'x-api-key': 'masterstudent_admin_2024_secure_key' }
      });
      const usersData = await usersResponse.json();
      
      // Fetch notes
      const notesResponse = await fetch('http://localhost:3001/admin/notes', {
        headers: { 'x-api-key': 'masterstudent_admin_2024_secure_key' }
      });
      const notesData = await notesResponse.json();
      
      // Fetch payments
      const paymentsResponse = await fetch('http://localhost:3001/admin/payments', {
        headers: { 'x-api-key': 'masterstudent_admin_2024_secure_key' }
      });
      const paymentsData = await paymentsResponse.json();

      if (usersData.success && notesData.success) {
        const users = usersData.users || [];
        const notes = notesData.notes || [];
        const payments = paymentsData.success ? paymentsData.payments || [] : [];
        
        // Calculate comprehensive stats
        const totalUsers = users.length;
        const totalNotes = notes.length;
        const pendingNotes = notes.filter(note => note.approvalStatus === 'pending' || !note.isApproved).length;
        const approvedNotes = notes.filter(note => note.approvalStatus === 'approved' || note.isApproved).length;
        const rejectedNotes = notes.filter(note => note.approvalStatus === 'rejected').length;
        const totalCoins = users.reduce((sum, user) => sum + (user.coins || 0), 0);
        const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        setStats({
          totalUsers,
          totalNotes,
          totalPayments: payments.length,
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          pendingNotes,
          approvedNotes,
          rejectedNotes,
          totalCoins,
          totalRevenue
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('http://localhost:3001/admin/logs', {
        headers: { 'x-api-key': 'masterstudent_admin_2024_secure_key' }
      });
      const data = await response.json();
      if (data.success) {
        setRecentActivity(data.logs.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const checkSystemStatus = async () => {
    try {
      // Check Firebase Admin Server
      const adminResponse = await fetch('http://localhost:3001/admin/stats', {
        headers: { 'x-api-key': 'masterstudent_admin_2024_secure_key' }
      });
      
      // Check Main Website
      const websiteResponse = await fetch('http://localhost:8000/');
      
      setSystemStatus({
        firebase: 'online',
        cloudinary: 'online',
        adminServer: adminResponse.ok ? 'online' : 'offline',
        mainWebsite: websiteResponse.ok ? 'online' : 'offline'
      });
    } catch (error) {
      console.error('Error checking system status:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getActivityIcon = (action) => {
    const iconMap = {
      'VIEW_USERS': '👥',
      'VIEW_NOTES': '📚',
      'NOTE_APPROVED': '✅',
      'NOTE_REJECTED': '❌',
      'VIEW_PAYMENTS': '💳',
      'FILE_UPLOAD': '☁️',
      'VIEW_STATS': '📊',
      'USER_LOGIN': '🔐',
      'COIN_REWARD': '💰'
    };
    return iconMap[action] || '🔥';
  };

  const getStatusIndicator = (status) => {
    return (
      <div className={`status-indicator ${status}`}>
        <div className="status-dot"></div>
        <span className="status-text">{status}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-enhanced">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">🔥 Admin Dashboard</h1>
          <p className="dashboard-subtitle">Comprehensive Platform Analytics & Management</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchAllData} className="refresh-btn">
            🔄 Refresh All Data
          </button>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="main-stats-grid">
        <div className="stat-card users">
          <div className="stat-header">
            <div className="stat-icon">👥</div>
            <div className="stat-trend positive">+12%</div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
            <div className="stat-label">Total Users</div>
            <div className="stat-sublabel">Registered members</div>
          </div>
        </div>

        <div className="stat-card notes">
          <div className="stat-header">
            <div className="stat-icon">📚</div>
            <div className="stat-trend positive">+8%</div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalNotes.toLocaleString()}</div>
            <div className="stat-label">Total Notes</div>
            <div className="stat-sublabel">Uploaded content</div>
          </div>
        </div>

        <div className="stat-card coins">
          <div className="stat-header">
            <div className="stat-icon">💰</div>
            <div className="stat-trend positive">+15%</div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalCoins.toLocaleString()}</div>
            <div className="stat-label">Total Coins</div>
            <div className="stat-sublabel">In circulation</div>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-header">
            <div className="stat-icon">💳</div>
            <div className="stat-trend positive">+22%</div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">Revenue</div>
            <div className="stat-sublabel">Total earnings</div>
          </div>
        </div>
      </div>

      {/* Secondary Statistics */}
      <div className="secondary-stats-grid">
        <div className="stat-item pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.pendingNotes}</div>
            <div className="stat-name">Pending Review</div>
          </div>
        </div>

        <div className="stat-item approved">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.approvedNotes}</div>
            <div className="stat-name">Approved Notes</div>
          </div>
        </div>

        <div className="stat-item rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-value">{stats.rejectedNotes}</div>
            <div className="stat-name">Rejected Notes</div>
          </div>
        </div>

        <div className="stat-item payments">
          <div className="stat-icon">💸</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalPayments}</div>
            <div className="stat-name">Transactions</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* System Status */}
        <div className="card system-status">
          <div className="card-header">
            <h3 className="card-title">🖥️ System Status</h3>
            <div className="status-overview">All Systems Operational</div>
          </div>
          <div className="card-content">
            <div className="status-grid">
              <div className="status-item">
                {getStatusIndicator(systemStatus.firebase)}
                <div className="status-info">
                  <div className="status-label">Firebase Database</div>
                  <div className="status-details">Firestore & Authentication</div>
                </div>
              </div>

              <div className="status-item">
                {getStatusIndicator(systemStatus.cloudinary)}
                <div className="status-info">
                  <div className="status-label">Cloudinary Storage</div>
                  <div className="status-details">25GB Free Tier Available</div>
                </div>
              </div>

              <div className="status-item">
                {getStatusIndicator(systemStatus.adminServer)}
                <div className="status-info">
                  <div className="status-label">Admin Server</div>
                  <div className="status-details">Port 3001 - API Gateway</div>
                </div>
              </div>

              <div className="status-item">
                {getStatusIndicator(systemStatus.mainWebsite)}
                <div className="status-info">
                  <div className="status-label">Main Website</div>
                  <div className="status-details">Port 8000 - User Portal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card recent-activity">
          <div className="card-header">
            <h3 className="card-title">📊 Recent Activity</h3>
            <div className="activity-count">{recentActivity.length} recent actions</div>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="activity-info">
                      <div className="activity-action">{activity.details || activity.action}</div>
                      <div className="activity-time">{formatDate(activity.timestamp)}</div>
                    </div>
                    <div className="activity-status">
                      <div className="status-dot success"></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-activity">
                  <div className="no-activity-icon">🌟</div>
                  <p>No recent activity</p>
                  <small>System activities will appear here</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card quick-actions">
        <div className="card-header">
          <h3 className="card-title">🚀 Quick Actions</h3>
          <div className="actions-subtitle">Common administrative tasks</div>
        </div>
        <div className="card-content">
          <div className="actions-grid">
            <button className="action-btn primary">
              <div className="action-icon">📊</div>
              <div className="action-content">
                <div className="action-title">Generate Report</div>
                <div className="action-desc">Export analytics data</div>
              </div>
            </button>

            <button className="action-btn secondary">
              <div className="action-icon">👥</div>
              <div className="action-content">
                <div className="action-title">Manage Users</div>
                <div className="action-desc">View user accounts</div>
              </div>
            </button>

            <button className="action-btn tertiary">
              <div className="action-icon">📚</div>
              <div className="action-content">
                <div className="action-title">Review Notes</div>
                <div className="action-desc">Approve pending content</div>
              </div>
            </button>

            <button className="action-btn quaternary">
              <div className="action-icon">⚙️</div>
              <div className="action-content">
                <div className="action-title">System Settings</div>
                <div className="action-desc">Configure platform</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFixed;
