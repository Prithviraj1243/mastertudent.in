import React from 'react';

const Sidebar = ({ currentPage, setCurrentPage, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'notes', label: 'Notes', icon: '📚' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'upload', label: 'Upload', icon: '☁️' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">🔥 MasterStudent</h2>
        <p className="sidebar-subtitle">Admin Control Panel</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="nav-item">
            <a
              href="#"
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(item.id);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </a>
          </div>
        ))}
      </nav>

      <button className="logout-btn" onClick={onLogout}>
        <span className="logout-icon">🚪</span>
        Logout
      </button>

      <style jsx>{`
        .logout-icon {
          margin-right: 0.5rem;
        }

        .nav-label {
          font-weight: 500;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: linear-gradient(180deg, #ff6b35 0%, #ff4757 100%);
          border-radius: 2px;
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.2);
          transition: transform 0.2s ease;
        }

        .sidebar-header {
          position: relative;
        }

        .sidebar-header::after {
          content: '';
          position: absolute;
          bottom: -1rem;
          left: 2rem;
          right: 2rem;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #ff6b35 50%, transparent 100%);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
