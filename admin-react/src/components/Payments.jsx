import React, { useState, useEffect } from 'react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    fetchPayments();
    fetchSubscriptions();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('http://localhost:3001/admin/payments', {
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('http://localhost:3001/admin/subscriptions', {
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });
      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `₹${amount || 0}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
      case 'success':
        return '#2ecc71';
      case 'pending':
        return '#ffa502';
      case 'failed':
      case 'cancelled':
      case 'expired':
        return '#e74c3c';
      default:
        return '#888';
    }
  };

  const getSubscriptionTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'pro':
        return '#ff6b35';
      case 'premium':
        return '#ffa502';
      case 'basic':
        return '#3498db';
      default:
        return '#888';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'completed') return matchesSearch && payment.status === 'completed';
    if (filterBy === 'pending') return matchesSearch && payment.status === 'pending';
    if (filterBy === 'failed') return matchesSearch && payment.status === 'failed';
    
    return matchesSearch;
  });

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.tier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'active') return matchesSearch && subscription.status === 'active';
    if (filterBy === 'cancelled') return matchesSearch && subscription.status === 'cancelled';
    if (filterBy === 'expired') return matchesSearch && subscription.status === 'expired';
    
    return matchesSearch;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const activeSubscriptionsCount = subscriptions.filter(s => s.status === 'active').length;
  const monthlyRecurringRevenue = subscriptions
    .filter(s => s.status === 'active' && s.interval === 'monthly')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading payments & subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="payments-page fade-in-up">
      <div className="page-header">
        <h1 className="page-title">💳 Payments & Subscriptions</h1>
        <p className="page-subtitle">Stripe Integration & Revenue Management</p>
      </div>

      <div className="revenue-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-number">{formatAmount(totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-number">{formatAmount(monthlyRecurringRevenue)}</div>
          <div className="stat-label">Monthly Recurring Revenue</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">{activeSubscriptionsCount}</div>
          <div className="stat-label">Active Subscriptions</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-number">{payments.length}</div>
          <div className="stat-label">Total Transactions</div>
        </div>
      </div>

      <div className="payments-controls">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <span className="tab-icon">💳</span>
            Payments
          </button>
          <button 
            className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <span className="tab-icon">⭐</span>
            Subscriptions
          </button>
        </div>

        <div className="search-filter">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            {activeTab === 'payments' ? (
              <>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </>
            ) : (
              <>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </>
            )}
          </select>
        </div>
      </div>

      {activeTab === 'payments' ? (
        <div className="table-container">
          {filteredPayments.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <div className="transaction-id">
                        <span className="id-text">{payment.id?.substring(0, 12)}...</span>
                        <span className="payment-type">{payment.type || 'One-time'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="user-id">{payment.userId?.substring(0, 8)}...</div>
                        <div className="user-email">{payment.userEmail || 'Unknown'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="amount">{formatAmount(payment.amount)}</div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(payment.status) }}
                      >
                        {payment.status || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <div className="payment-method">
                        <span className="method-icon">
                          {payment.method === 'card' ? '💳' : 
                           payment.method === 'upi' ? '📱' : 
                           payment.method === 'netbanking' ? '🏦' : '💰'}
                        </span>
                        <span>{payment.method || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="payment-date">{formatDate(payment.createdAt)}</div>
                    </td>
                    <td>
                      <div className="payment-actions">
                        <button className="action-btn view-btn" title="View Details">
                          👁️
                        </button>
                        <button className="action-btn refund-btn" title="Process Refund">
                          ↩️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">
              <div className="no-data-icon">💳</div>
              <h3>No Payments Found</h3>
              <p>No payment transactions match your current filters.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="subscriptions-grid">
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((subscription) => (
              <div key={subscription.id} className="subscription-card">
                <div className="subscription-header">
                  <div 
                    className="tier-badge"
                    style={{ backgroundColor: getSubscriptionTierColor(subscription.tier) }}
                  >
                    {subscription.tier || 'Basic'} Plan
                  </div>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(subscription.status) }}
                  >
                    {subscription.status || 'Unknown'}
                  </div>
                </div>

                <div className="subscription-content">
                  <div className="subscription-icon">
                    {subscription.tier === 'pro' ? '🔥' : 
                     subscription.tier === 'premium' ? '⭐' : '📚'}
                  </div>
                  <div className="subscription-details">
                    <div className="subscription-user">
                      <span className="user-label">User ID:</span>
                      <span className="user-value">{subscription.userId?.substring(0, 12)}...</span>
                    </div>
                    <div className="subscription-amount">
                      <span className="amount-value">{formatAmount(subscription.amount)}</span>
                      <span className="interval">/{subscription.interval || 'month'}</span>
                    </div>
                  </div>
                </div>

                <div className="subscription-meta">
                  <div className="meta-row">
                    <span className="meta-label">Started:</span>
                    <span className="meta-value">{formatDate(subscription.startDate || subscription.createdAt)}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Next Billing:</span>
                    <span className="meta-value">{formatDate(subscription.nextBilling)}</span>
                  </div>
                  {subscription.endDate && (
                    <div className="meta-row">
                      <span className="meta-label">Ends:</span>
                      <span className="meta-value">{formatDate(subscription.endDate)}</span>
                    </div>
                  )}
                </div>

                <div className="subscription-actions">
                  <button className="action-btn view-btn">
                    <span>👁️</span>
                    View Details
                  </button>
                  <button className="action-btn edit-btn">
                    <span>✏️</span>
                    Modify
                  </button>
                  <button className="action-btn cancel-btn">
                    <span>❌</span>
                    Cancel
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <div className="no-data-icon">⭐</div>
              <h3>No Subscriptions Found</h3>
              <p>No subscription plans match your current filters.</p>
              <button className="btn btn-primary">
                <span>➕</span>
                Create Subscription Plan
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .revenue-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .payments-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .tab-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #ccc;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-btn.active {
          background: linear-gradient(90deg, #ff6b35 0%, #ff4757 100%);
          color: white;
          border-color: #ff6b35;
        }

        .tab-btn:hover:not(.active) {
          background: #2a2a2a;
          color: #fff;
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .search-filter {
          display: flex;
          gap: 1rem;
        }

        .search-box {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
        }

        .search-input {
          padding: 1rem 1rem 1rem 3rem;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          width: 250px;
        }

        .search-input:focus {
          outline: none;
          border-color: #ff6b35;
          box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
        }

        .filter-select {
          padding: 1rem;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
        }

        .transaction-id {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .id-text {
          font-family: monospace;
          color: #fff;
        }

        .payment-type {
          font-size: 0.8rem;
          color: #888;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .user-id {
          font-family: monospace;
          color: #fff;
        }

        .user-email {
          font-size: 0.8rem;
          color: #888;
        }

        .amount {
          font-weight: 600;
          color: #2ecc71;
          font-size: 1.1rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .method-icon {
          font-size: 1.2rem;
        }

        .payment-date {
          color: #888;
        }

        .payment-actions {
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

        .refund-btn {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }

        .refund-btn:hover {
          background: rgba(231, 76, 60, 0.3);
          transform: scale(1.1);
        }

        .subscriptions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .subscription-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .subscription-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.2);
          border-color: #ff6b35;
        }

        .subscription-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .tier-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .subscription-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .subscription-icon {
          font-size: 3rem;
        }

        .subscription-details {
          flex: 1;
        }

        .subscription-user {
          margin-bottom: 0.5rem;
        }

        .user-label {
          color: #888;
          font-size: 0.9rem;
        }

        .user-value {
          color: #fff;
          font-family: monospace;
          margin-left: 0.5rem;
        }

        .subscription-amount {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .amount-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2ecc71;
        }

        .interval {
          color: #888;
          font-size: 1rem;
        }

        .subscription-meta {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255, 107, 53, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 107, 53, 0.1);
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .meta-row:last-child {
          margin-bottom: 0;
        }

        .meta-label {
          color: #888;
          font-size: 0.9rem;
        }

        .meta-value {
          color: #fff;
          font-weight: 500;
        }

        .subscription-actions {
          display: flex;
          gap: 0.5rem;
        }

        .subscription-actions .action-btn {
          flex: 1;
          height: auto;
          width: auto;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .edit-btn {
          background: rgba(255, 165, 2, 0.2);
          color: #ffa502;
        }

        .edit-btn:hover {
          background: rgba(255, 165, 2, 0.3);
        }

        .cancel-btn {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }

        .cancel-btn:hover {
          background: rgba(231, 76, 60, 0.3);
        }

        .no-data {
          text-align: center;
          padding: 4rem 2rem;
          color: #888;
          grid-column: 1 / -1;
        }

        .no-data-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .no-data h3 {
          color: #fff;
          margin-bottom: 1rem;
        }

        .no-data .btn {
          margin-top: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .payments-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-filter {
            flex-direction: column;
          }
          
          .search-input {
            width: 100%;
          }
          
          .subscriptions-grid {
            grid-template-columns: 1fr;
          }
          
          .subscription-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Payments;
