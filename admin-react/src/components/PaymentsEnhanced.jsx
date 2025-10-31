import React, { useState, useEffect } from 'react';

const PaymentsEnhanced = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    avgAmount: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/admin/payments', {
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments || []);
        calculateStats(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Mock data for demonstration
      const mockPayments = [
        {
          id: '1',
          userId: 'user1',
          userEmail: 'student1@example.com',
          amount: 299,
          currency: 'INR',
          status: 'successful',
          method: 'upi',
          transactionId: 'TXN123456789',
          description: 'Premium Notes Package',
          createdAt: new Date('2024-01-15T10:30:00Z'),
          updatedAt: new Date('2024-01-15T10:30:30Z')
        },
        {
          id: '2',
          userId: 'user2',
          userEmail: 'student2@example.com',
          amount: 199,
          currency: 'INR',
          status: 'successful',
          method: 'card',
          transactionId: 'TXN123456790',
          description: 'Coin Package - 500 Coins',
          createdAt: new Date('2024-01-14T15:45:00Z'),
          updatedAt: new Date('2024-01-14T15:45:15Z')
        },
        {
          id: '3',
          userId: 'user3',
          userEmail: 'student3@example.com',
          amount: 99,
          currency: 'INR',
          status: 'pending',
          method: 'upi',
          transactionId: 'TXN123456791',
          description: 'Basic Subscription',
          createdAt: new Date('2024-01-13T09:20:00Z'),
          updatedAt: new Date('2024-01-13T09:20:00Z')
        }
      ];
      setPayments(mockPayments);
      calculateStats(mockPayments);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData) => {
    const total = paymentsData.length;
    const totalAmount = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const successful = paymentsData.filter(payment => payment.status === 'successful').length;
    const pending = paymentsData.filter(payment => payment.status === 'pending').length;
    const failed = paymentsData.filter(payment => payment.status === 'failed').length;
    const avgAmount = total > 0 ? totalAmount / total : 0;
    
    setStats({ total, totalAmount, successful, pending, failed, avgAmount });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'amount_high') {
      return (b.amount || 0) - (a.amount || 0);
    }
    if (sortBy === 'amount_low') {
      return (a.amount || 0) - (b.amount || 0);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedPayments.length / paymentsPerPage);
  const startIndex = (currentPage - 1) * paymentsPerPage;
  const currentPayments = sortedPayments.slice(startIndex, startIndex + paymentsPerPage);

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      successful: { label: '✅ Successful', class: 'success' },
      pending: { label: '⏳ Pending', class: 'pending' },
      failed: { label: '❌ Failed', class: 'failed' },
      refunded: { label: '🔄 Refunded', class: 'refunded' }
    };
    
    const statusInfo = statusMap[status] || statusMap.pending;
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getMethodIcon = (method) => {
    const methodMap = {
      upi: '📱',
      card: '💳',
      netbanking: '🏦',
      wallet: '👛'
    };
    return methodMap[method] || '💰';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="payments-enhanced">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
        </div>
        
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{formatCurrency(stats.totalAmount)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        
        <div className="stat-card successful">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.successful}</div>
            <div className="stat-label">Successful</div>
          </div>
        </div>
        
        <div className="stat-card average">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{formatCurrency(stats.avgAmount)}</div>
            <div className="stat-label">Average Amount</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search by email, transaction ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters-container">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Highest Amount</option>
            <option value="amount_low">Lowest Amount</option>
          </select>
          
          <button onClick={fetchPayments} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-table-container">
        <div className="table-header">
          <h3>💳 Payment Transactions</h3>
          <div className="table-info">{sortedPayments.length} transactions found</div>
        </div>
        
        <div className="payments-table">
          <div className="table-header-row">
            <div className="table-cell">Transaction</div>
            <div className="table-cell">User</div>
            <div className="table-cell">Amount</div>
            <div className="table-cell">Method</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Date</div>
            <div className="table-cell">Actions</div>
          </div>
          
          {currentPayments.map(payment => (
            <div key={payment.id} className="table-row">
              <div className="table-cell transaction-cell">
                <div className="transaction-id">{payment.transactionId}</div>
                <div className="transaction-desc">{payment.description}</div>
              </div>
              
              <div className="table-cell user-cell">
                <div className="user-email">{payment.userEmail}</div>
                <div className="user-id">ID: {payment.userId}</div>
              </div>
              
              <div className="table-cell amount-cell">
                <div className="amount">{formatCurrency(payment.amount, payment.currency)}</div>
              </div>
              
              <div className="table-cell method-cell">
                <div className="payment-method">
                  <span className="method-icon">{getMethodIcon(payment.method)}</span>
                  <span className="method-name">{payment.method?.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="table-cell status-cell">
                {getStatusBadge(payment.status)}
              </div>
              
              <div className="table-cell date-cell">
                <div className="created-date">{formatDate(payment.createdAt)}</div>
                {payment.updatedAt && payment.updatedAt !== payment.createdAt && (
                  <div className="updated-date">Updated: {formatDate(payment.updatedAt)}</div>
                )}
              </div>
              
              <div className="table-cell actions-cell">
                <button className="action-btn view">👁️ View</button>
                {payment.status === 'successful' && (
                  <button className="action-btn refund">🔄 Refund</button>
                )}
              </div>
            </div>
          ))}
          
          {currentPayments.length === 0 && (
            <div className="no-payments">
              <div className="no-payments-icon">💳</div>
              <h3>No payments found</h3>
              <p>No transactions match your current filters.</p>
            </div>
          )}
        </div>
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
            Page {currentPage} of {totalPages} ({sortedPayments.length} transactions)
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
        .payments-enhanced {
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
        .stat-card.revenue { border-color: #2ecc71; }
        .stat-card.successful { border-color: #27ae60; }
        .stat-card.average { border-color: #f39c12; }

        .stat-icon {
          font-size: 2rem;
          width: 50px;
          text-align: center;
        }

        .stat-number {
          font-size: 1.5rem;
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

        .payments-table-container {
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 1px solid #333;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .table-header {
          padding: 1.5rem;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0,0,0,0.2);
        }

        .table-header h3 {
          color: #ff6b35;
          margin: 0;
          font-size: 1.2rem;
        }

        .table-info {
          color: #888;
          font-size: 0.9rem;
        }

        .payments-table {
          display: flex;
          flex-direction: column;
        }

        .table-header-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 2fr 1fr;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid #333;
          font-weight: 600;
          color: #ccc;
          font-size: 0.9rem;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 2fr 1fr;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #333;
          transition: all 0.3s ease;
        }

        .table-row:hover {
          background: rgba(255, 107, 53, 0.05);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-cell {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .transaction-id {
          font-family: monospace;
          color: #fff;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .transaction-desc {
          color: #888;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .user-email {
          color: #fff;
          font-weight: 500;
        }

        .user-id {
          color: #888;
          font-size: 0.8rem;
          font-family: monospace;
        }

        .amount {
          font-size: 1.1rem;
          font-weight: bold;
          color: #2ecc71;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .method-icon {
          font-size: 1.2rem;
        }

        .method-name {
          color: #ccc;
          font-weight: 500;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          width: fit-content;
        }

        .status-badge.success {
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
          border: 1px solid #2ecc71;
        }

        .status-badge.pending {
          background: rgba(243, 156, 18, 0.2);
          color: #f39c12;
          border: 1px solid #f39c12;
        }

        .status-badge.failed {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
          border: 1px solid #e74c3c;
        }

        .status-badge.refunded {
          background: rgba(155, 89, 182, 0.2);
          color: #9b59b6;
          border: 1px solid #9b59b6;
        }

        .created-date {
          color: #ccc;
          font-size: 0.9rem;
        }

        .updated-date {
          color: #888;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .actions-cell {
          flex-direction: row;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.view {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
        }

        .action-btn.refund {
          background: linear-gradient(135deg, #f39c12, #e67e22);
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .no-payments {
          text-align: center;
          padding: 3rem;
          color: #888;
        }

        .no-payments-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .no-payments h3 {
          color: #ccc;
          margin-bottom: 0.5rem;
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

        @media (max-width: 1200px) {
          .table-header-row,
          .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .table-cell {
            padding: 0.5rem 0;
            border-bottom: 1px solid #444;
          }
          
          .table-cell:last-child {
            border-bottom: none;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .filters-container {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-select, .refresh-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentsEnhanced;
