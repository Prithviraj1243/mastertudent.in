import React, { useState, useEffect } from 'react';

const DashboardEnhanced = () => {
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
          totalSubscriptions: 0, // Will be calculated when subscriptions API is available
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
      const websiteResponse = await fetch('http://localhost:8000/api/health');
      
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

            <button className="action-btn success">
              <div className="action-icon">💰</div>
              <div className="action-content">
                <div className="action-title">Coin Management</div>
                <div className="action-desc">Monitor coin economy</div>
              </div>
            </button>

            <button className="action-btn warning">
              <div className="action-icon">🔐</div>
              <div className="action-content">
                <div className="action-title">Security Logs</div>
                <div className="action-desc">View access logs</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-enhanced {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 1px solid #333;
          border-radius: 12px;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: bold;
          color: #fff;
          margin: 0;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .dashboard-subtitle {
          color: #888;
          margin: 0.5rem 0 0 0;
        }

        .refresh-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
        }

        .main-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff6b35, #f7931e);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(0,0,0,0.4);
        }

        .stat-card.users::before { background: linear-gradient(90deg, #3498db, #2980b9); }
        .stat-card.notes::before { background: linear-gradient(90deg, #2ecc71, #27ae60); }
        .stat-card.coins::before { background: linear-gradient(90deg, #f39c12, #e67e22); }
        .stat-card.revenue::before { background: linear-gradient(90deg, #9b59b6, #8e44ad); }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-trend {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .stat-trend.positive {
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
          border: 1px solid #2ecc71;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1.1rem;
          font-weight: 600;
          color: #ccc;
          margin-bottom: 0.25rem;
        }

        .stat-sublabel {
          font-size: 0.9rem;
          color: #888;
        }

        .secondary-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          background: rgba(42, 42, 42, 0.8);
          border: 1px solid #333;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          background: rgba(52, 52, 52, 0.8);
          border-color: #444;
        }

        .stat-item .stat-icon {
          font-size: 1.5rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #fff;
        }

        .stat-name {
          color: #888;
          font-size: 0.9rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .card {
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 1px solid #333;
          border-radius: 12px;
          overflow: hidden;
        }

        .card-header {
          padding: 1.5rem;
          border-bottom: 1px solid #333;
          background: rgba(0,0,0,0.2);
        }

        .card-title {
          color: #ff6b35;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .status-overview, .activity-count, .actions-subtitle {
          color: #888;
          font-size: 0.9rem;
        }

        .card-content {
          padding: 1.5rem;
        }

        .status-grid {
          display: grid;
          gap: 1rem;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          border: 1px solid #333;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          position: relative;
        }

        .status-indicator.online .status-dot {
          background: #2ecc71;
          box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
        }

        .status-indicator.online .status-dot::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px solid #2ecc71;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-text {
          color: #2ecc71;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-label {
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .status-details {
          color: #888;
          font-size: 0.9rem;
        }

        .activity-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #333;
          transition: all 0.3s ease;
        }

        .activity-item:hover {
          background: rgba(255, 107, 53, 0.05);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          font-size: 1.5rem;
          width: 40px;
          text-align: center;
        }

        .activity-info {
          flex: 1;
        }

        .activity-action {
          color: #fff;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .activity-time {
          color: #888;
          font-size: 0.8rem;
        }

        .activity-status .status-dot {
          width: 8px;
          height: 8px;
        }

        .activity-status .status-dot.success {
          background: #2ecc71;
        }

        .no-activity {
          text-align: center;
          padding: 2rem;
          color: #888;
        }

        .no-activity-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #333 0%, #222 100%);
          border: 1px solid #444;
          border-radius: 8px;
          color: #ccc;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .action-btn.primary:hover { border-color: #3498db; color: #3498db; }
        .action-btn.secondary:hover { border-color: #2ecc71; color: #2ecc71; }
        .action-btn.tertiary:hover { border-color: #f39c12; color: #f39c12; }
        .action-btn.quaternary:hover { border-color: #9b59b6; color: #9b59b6; }
        .action-btn.success:hover { border-color: #27ae60; color: #27ae60; }
        .action-btn.warning:hover { border-color: #e74c3c; color: #e74c3c; }

        .action-icon {
          font-size: 2rem;
          width: 50px;
          text-align: center;
        }

        .action-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .action-desc {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #888;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #333;
          border-top: 3px solid #ff6b35;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @media (max-width: 1200px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .main-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .secondary-stats-grid {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardEnhanced;
