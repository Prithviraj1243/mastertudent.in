import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    totalPayments: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/admin/stats', {
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
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
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });
      const data = await response.json();
      if (data.success) {
        setRecentActivity(data.logs.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString();
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
    <div className="dashboard fade-in-up">
      <div className="page-header">
        <h1 className="page-title">🔥 Dashboard</h1>
        <p className="page-subtitle">Firebase & Cloudinary Analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-number">{stats.totalNotes}</div>
          <div className="stat-label">Notes Uploaded</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-number">{stats.totalPayments}</div>
          <div className="stat-label">Total Payments</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">{stats.activeSubscriptions}</div>
          <div className="stat-label">Active Subscriptions</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 System Status</h3>
          </div>
          <div className="card-content">
            <div className="status-grid">
              <div className="status-item">
                <div className="status-indicator online"></div>
                <div className="status-info">
                  <div className="status-label">Firebase</div>
                  <div className="status-value">Connected</div>
                </div>
              </div>
              <div className="status-item">
                <div className="status-indicator online"></div>
                <div className="status-info">
                  <div className="status-label">Cloudinary</div>
                  <div className="status-value">25GB Available</div>
                </div>
              </div>
              <div className="status-item">
                <div className="status-indicator online"></div>
                <div className="status-info">
                  <div className="status-label">Admin Server</div>
                  <div className="status-value">Running</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔥 Recent Activity</h3>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.action === 'VIEW_USERS' && '👥'}
                      {activity.action === 'VIEW_NOTES' && '📚'}
                      {activity.action === 'VIEW_PAYMENTS' && '💳'}
                      {activity.action === 'FILE_UPLOAD' && '☁️'}
                      {activity.action === 'VIEW_STATS' && '📊'}
                      {!['VIEW_USERS', 'VIEW_NOTES', 'VIEW_PAYMENTS', 'FILE_UPLOAD', 'VIEW_STATS'].includes(activity.action) && '🔥'}
                    </div>
                    <div className="activity-info">
                      <div className="activity-action">{activity.details || activity.action}</div>
                      <div className="activity-time">{formatDate(activity.timestamp)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-activity">
                  <div className="no-activity-icon">🌟</div>
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🚀 Quick Actions</h3>
        </div>
        <div className="card-content">
          <div className="quick-actions">
            <button className="action-btn" onClick={() => window.location.reload()}>
              <span className="action-icon">🔄</span>
              <span className="action-label">Refresh Data</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📊</span>
              <span className="action-label">Export Reports</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">⚙️</span>
              <span className="action-label">System Settings</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🔐</span>
              <span className="action-label">Security Logs</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .card-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #333;
        }

        .card-title {
          color: #ff6b35;
          font-size: 1.3rem;
          font-weight: 600;
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
          background: rgba(255, 107, 53, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 107, 53, 0.1);
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          position: relative;
        }

        .status-indicator.online {
          background: #2ecc71;
          box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
        }

        .status-indicator.online::before {
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

        .status-info {
          flex: 1;
        }

        .status-label {
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .status-value {
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

        .no-activity {
          text-align: center;
          padding: 2rem;
          color: #888;
        }

        .no-activity-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 1px solid #333;
          border-radius: 12px;
          color: #ccc;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: linear-gradient(135deg, #333 0%, #222 100%);
          border-color: #ff6b35;
          color: #ff6b35;
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 2rem;
        }

        .action-label {
          font-weight: 600;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #888;
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .quick-actions {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
