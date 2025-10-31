import React, { useState, useEffect } from 'react';

const UsersEnhanced = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(12);
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    toppers: 0,
    reviewers: 0,
    admins: 0,
    totalCoins: 0,
    totalNotes: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/admin/users', {
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        calculateStats(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const total = usersData.length;
    const students = usersData.filter(user => user.role === 'student' || !user.role).length;
    const toppers = usersData.filter(user => user.role === 'topper').length;
    const reviewers = usersData.filter(user => user.role === 'reviewer').length;
    const admins = usersData.filter(user => user.role === 'admin').length;
    
    const totalCoins = usersData.reduce((sum, user) => sum + (user.coins || 0), 0);
    const totalNotes = usersData.reduce((sum, user) => sum + (user.notesUploaded || 0), 0);
    
    setStats({ total, students, toppers, reviewers, admins, totalCoins, totalNotes });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'student' && (user.role === 'student' || !user.role)) ||
                       user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'newest') {
      const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt || 0);
      return dateB - dateA;
    }
    if (sortBy === 'oldest') {
      const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt || 0);
      return dateA - dateB;
    }
    if (sortBy === 'name') {
      return (a.firstName || '').localeCompare(b.firstName || '');
    }
    if (sortBy === 'coins') {
      return (b.coins || 0) - (a.coins || 0);
    }
    if (sortBy === 'notes') {
      return (b.notesUploaded || 0) - (a.notesUploaded || 0);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = sortedUsers.slice(startIndex, startIndex + usersPerPage);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { label: '👑 Admin', class: 'admin' },
      topper: { label: '⭐ Topper', class: 'topper' },
      reviewer: { label: '🔍 Reviewer', class: 'reviewer' },
      student: { label: '🎓 Student', class: 'student' }
    };
    
    const roleInfo = roleMap[role] || roleMap.student;
    return <span className={`role-badge ${roleInfo.class}`}>{roleInfo.label}</span>;
  };

  const getInitials = (firstName, lastName) => {
    return ((firstName || '').charAt(0) + (lastName || '').charAt(0)).toUpperCase() || '?';
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
    <div className="users-enhanced">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        
        <div className="stat-card students">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <div className="stat-number">{stats.students}</div>
            <div className="stat-label">Students</div>
          </div>
        </div>
        
        <div className="stat-card toppers">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-number">{stats.toppers}</div>
            <div className="stat-label">Toppers</div>
          </div>
        </div>
        
        <div className="stat-card coins">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalCoins.toLocaleString()}</div>
            <div className="stat-label">Total Coins</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters-container">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="topper">Toppers</option>
            <option value="reviewer">Reviewers</option>
            <option value="admin">Admins</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="coins">Most Coins</option>
            <option value="notes">Most Notes</option>
          </select>
          
          <button onClick={fetchUsers} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="users-grid">
        {currentUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-header">
              <div className="user-avatar">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="avatar-image" />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                )}
              </div>
              <div className="user-info">
                <div className="user-name">
                  {user.firstName} {user.lastName}
                </div>
                <div className="user-email">{user.email}</div>
                {getRoleBadge(user.role)}
              </div>
            </div>
            
            <div className="user-stats">
              <div className="stat-item">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <div className="stat-value">{(user.coins || 0).toLocaleString()}</div>
                  <div className="stat-name">Coins</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">📚</div>
                <div className="stat-info">
                  <div className="stat-value">{user.notesUploaded || 0}</div>
                  <div className="stat-name">Notes</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <div className="stat-value">{(user.rating || 0).toFixed(1)}</div>
                  <div className="stat-name">Rating</div>
                </div>
              </div>
            </div>
            
            <div className="user-meta">
              <div className="meta-item">
                <span className="meta-label">Joined:</span>
                <span className="meta-value">{formatDate(user.createdAt)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">ID:</span>
                <span className="meta-value user-id">{user.id}</span>
              </div>
              {user.lastLogin && (
                <div className="meta-item">
                  <span className="meta-label">Last Login:</span>
                  <span className="meta-value">{formatDate(user.lastLogin)}</span>
                </div>
              )}
            </div>
            
            <div className="user-actions">
              <button className="action-btn view">👁️ View Details</button>
              <button className="action-btn edit">✏️ Edit</button>
              {user.role !== 'admin' && (
                <button className="action-btn promote">⬆️ Promote</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({sortedUsers.length} users)
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      <style jsx>{`
        .users-enhanced {
          padding: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .stat-card.total { border-color: #3498db; }
        .stat-card.students { border-color: #2ecc71; }
        .stat-card.toppers { border-color: #f39c12; }
        .stat-card.coins { border-color: #e67e22; }

        .stat-icon {
          font-size: 2rem;
          width: 50px;
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #fff;
        }

        .stat-label {
          color: #888;
          font-size: 0.9rem;
        }

        .filters-section {
          background: rgba(42, 42, 42, 0.8);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .search-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          background: #1a1a1a;
          border: 1px solid #444;
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #ff6b35;
        }

        .filters-container {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          background: #1a1a1a;
          border: 1px solid #444;
          border-radius: 6px;
          color: #fff;
          cursor: pointer;
        }

        .refresh-btn {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border: none;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .user-card {
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          border-color: #ff6b35;
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #444;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .user-email {
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .role-badge.admin {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
          border: 1px solid #e74c3c;
        }

        .role-badge.topper {
          background: rgba(243, 156, 18, 0.2);
          color: #f39c12;
          border: 1px solid #f39c12;
        }

        .role-badge.reviewer {
          background: rgba(155, 89, 182, 0.2);
          color: #9b59b6;
          border: 1px solid #9b59b6;
        }

        .role-badge.student {
          background: rgba(52, 152, 219, 0.2);
          color: #3498db;
          border: 1px solid #3498db;
        }

        .user-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-item .stat-icon {
          font-size: 1.2rem;
        }

        .stat-value {
          font-weight: 600;
          color: #fff;
          font-size: 0.9rem;
        }

        .stat-name {
          color: #888;
          font-size: 0.8rem;
        }

        .user-meta {
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .meta-label {
          color: #888;
          font-weight: 500;
        }

        .meta-value {
          color: #ccc;
        }

        .user-id {
          font-family: monospace;
          font-size: 0.8rem;
        }

        .user-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.5rem 0.75rem;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          min-width: 80px;
        }

        .action-btn.view {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
        }

        .action-btn.edit {
          background: linear-gradient(135deg, #f39c12, #e67e22);
          color: white;
        }

        .action-btn.promote {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .pagination-btn {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #333, #222);
          border: 1px solid #444;
          border-radius: 6px;
          color: #ccc;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #444, #333);
          border-color: #ff6b35;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          color: #888;
          font-weight: 500;
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

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .users-grid {
            grid-template-columns: 1fr;
          }
          
          .filters-container {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-select, .refresh-btn {
            width: 100%;
          }
          
          .user-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UsersEnhanced;
