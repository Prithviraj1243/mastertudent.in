import React, { useState, useEffect } from 'react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/admin/users', {
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'active') return matchesSearch && user.status === 'active';
    if (filterBy === 'premium') return matchesSearch && user.subscription === 'premium';
    
    return matchesSearch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'createdAt') {
      const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt || 0);
      return dateB - dateA;
    }
    if (sortBy === 'email') return (a.email || '').localeCompare(b.email || '');
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getUserStatus = (user) => {
    if (user.subscription === 'premium') return 'Premium';
    if (user.subscription === 'basic') return 'Basic';
    return 'Free';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Premium': return '#ff6b35';
      case 'Basic': return '#ffa502';
      case 'Free': return '#888';
      default: return '#888';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-page fade-in-up">
      {/* User Statistics */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon-container">
            <div className="stat-icon icon-users"></div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-trend positive">+8%</div>
        </div>
        
        <div className="stat-card stat-approved">
          <div className="stat-icon-container">
            <div className="stat-icon icon-check-circle"></div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{users.filter(u => u.status === 'active').length}</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-percentage positive">{users.length > 0 ? Math.round((users.filter(u => u.status === 'active').length / users.length) * 100) : 0}%</div>
        </div>
        
        <div className="stat-card stat-pending">
          <div className="stat-icon-container">
            <div className="stat-icon icon-coins"></div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{users.reduce((sum, u) => sum + (u.coins || 0), 0)}</div>
            <div className="stat-label">Total Coins</div>
          </div>
          <div className="stat-trend positive">+15%</div>
        </div>
        
        <div className="stat-card stat-rejected">
          <div className="stat-icon-container">
            <div className="stat-icon icon-trophy"></div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{users.reduce((sum, u) => sum + (u.totalEarned || 0), 0)}</div>
            <div className="stat-label">Coins Earned</div>
          </div>
          <div className="stat-trend positive">+22%</div>
        </div>
      </div>

      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h2 className="section-title">Users Management</h2>
            <p className="section-subtitle">Manage registered users and their coin balances</p>
          </div>
        </div>
      </div>

      <div className="users-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search users by email, name, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="email">Sort by Email</option>
            <option value="name">Sort by Name</option>
          </select>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="premium">Premium Users</option>
          </select>
        </div>
      </div>

      <div className="users-stats">
        <div className="stat-item">
          <span className="stat-number">{users.length}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{users.filter(u => u.subscription === 'premium').length}</span>
          <span className="stat-label">Premium Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredUsers.length}</span>
          <span className="stat-label">Filtered Results</span>
        </div>
      </div>

      <div className="table-container">
        {sortedUsers.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Coins</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.name || 'Unknown'}</div>
                        <div className="user-id">ID: {user.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-email">{user.email || 'No email'}</div>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(getUserStatus(user)) }}
                    >
                      {getUserStatus(user)}
                    </span>
                  </td>
                  <td>
                    <div className="coin-info">
                      <span className="coin-amount">🪙 {user.coins || 0}</span>
                      {user.totalCoinsEarned > 0 && (
                        <span className="total-earned">Total: {user.totalCoinsEarned}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="join-date">{formatDate(user.createdAt)}</div>
                  </td>
                  <td>
                    <div className="user-actions">
                      <button className="action-btn view-btn" title="View Details">
                        👁️
                      </button>
                      <button className="action-btn edit-btn" title="Edit User">
                        ✏️
                      </button>
                      <button className="action-btn delete-btn" title="Delete User">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-users">
            <div className="no-users-icon">👥</div>
            <h3>No Users Found</h3>
            <p>No users match your current search and filter criteria.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .users-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          position: relative;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
          font-size: 1.2rem;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #ff6b35;
          box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
        }

        .filters {
          display: flex;
          gap: 1rem;
        }

        .filter-select {
          padding: 1rem;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: #ff6b35;
        }

        .users-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 12px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #ff6b35;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #888;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ff6b35 0%, #ff4757 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .user-id {
          font-size: 0.8rem;
          color: #888;
        }

        .user-email {
          color: #ccc;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .join-date {
          color: #888;
        }

        .user-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .view-btn {
          background: rgba(52, 152, 219, 0.2);
          color: #3498db;
        }

        .view-btn:hover {
          background: rgba(52, 152, 219, 0.3);
          transform: scale(1.1);
        }

        .edit-btn {
          background: rgba(255, 165, 2, 0.2);
          color: #ffa502;
        }

        .edit-btn:hover {
          background: rgba(255, 165, 2, 0.3);
          transform: scale(1.1);
        }

        .delete-btn {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }

        .delete-btn:hover {
          background: rgba(231, 76, 60, 0.3);
          transform: scale(1.1);
        }

        .no-users {
          text-align: center;
          padding: 4rem 2rem;
          color: #888;
        }

        .no-users-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .no-users h3 {
          color: #fff;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .users-controls {
            flex-direction: column;
          }
          
          .search-box {
            min-width: auto;
          }
          
          .users-stats {
            flex-direction: column;
            gap: 1rem;
          }
          
          .table-container {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Users;
