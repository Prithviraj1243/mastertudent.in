import React, { useState, useEffect } from 'react';

const NotesEnhanced = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [actionLoading, setActionLoading] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewNote, setPreviewNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [notesPerPage] = useState(12);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalSize: 0,
    avgRating: 0
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/admin/notes', {
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotes(data.notes);
        calculateStats(data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      showNotification('❌ Failed to load notes. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (notesData) => {
    const total = notesData.length;
    const pending = notesData.filter(note => note.approvalStatus === 'pending' || !note.isApproved).length;
    const approved = notesData.filter(note => note.approvalStatus === 'approved' || note.isApproved).length;
    const rejected = notesData.filter(note => note.approvalStatus === 'rejected').length;
    
    const totalSize = notesData.reduce((sum, note) => sum + (note.fileSize || 0), 0);
    const totalRating = notesData.reduce((sum, note) => sum + (note.rating || 0), 0);
    const avgRating = total > 0 ? (totalRating / total).toFixed(1) : 0;
    
    setStats({ total, pending, approved, rejected, totalSize, avgRating });
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const handleApproveNote = async (noteId) => {
    try {
      setActionLoading(prev => ({ ...prev, [noteId]: 'approving' }));
      
      const response = await fetch(`http://localhost:3001/admin/notes/${noteId}/approve`, {
        method: 'POST',
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminEmail: 'teacher@masterstudent.com'
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification(`✅ Note approved! ${result.coinReward} coins rewarded to student.`, 'success');
        fetchNotes(); // Refresh the list
      } else {
        showNotification('❌ Failed to approve note. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error approving note:', error);
      showNotification('❌ Network error. Please check your connection.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [noteId]: null }));
    }
  };

  const handleRejectNote = async (noteId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim() === '') return;

    try {
      setActionLoading(prev => ({ ...prev, [noteId]: 'rejecting' }));
      
      const response = await fetch(`http://localhost:3001/admin/notes/${noteId}/reject`, {
        method: 'POST',
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminEmail: 'teacher@masterstudent.com',
          reason: reason.trim()
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification('❌ Note rejected successfully. Student has been notified.', 'warning');
        fetchNotes();
      } else {
        showNotification('❌ Failed to reject note. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error rejecting note:', error);
      showNotification('❌ Network error. Please check your connection.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [noteId]: null }));
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && (note.approvalStatus === 'pending' || !note.isApproved)) ||
                         (statusFilter === 'approved' && (note.approvalStatus === 'approved' || note.isApproved)) ||
                         (statusFilter === 'rejected' && note.approvalStatus === 'rejected');
    
    const matchesSubject = subjectFilter === 'all' || note.subject === subjectFilter;
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
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
    if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    if (sortBy === 'subject') {
      return (a.subject || '').localeCompare(b.subject || '');
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedNotes.length / notesPerPage);
  const startIndex = (currentPage - 1) * notesPerPage;
  const currentNotes = sortedNotes.slice(startIndex, startIndex + notesPerPage);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadge = (note) => {
    if (note.approvalStatus === 'approved' || note.isApproved) {
      return <span className="status-badge approved">✅ Approved</span>;
    }
    if (note.approvalStatus === 'rejected') {
      return <span className="status-badge rejected">❌ Rejected</span>;
    }
    return <span className="status-badge pending">⏳ Pending</span>;
  };

  const getSubjects = () => {
    const subjects = [...new Set(notes.map(note => note.subject).filter(Boolean))];
    return subjects.sort();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="notes-enhanced">
      {/* Notification */}
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Notes</div>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>
        
        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        
        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-number">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search by title, subject, description, or email..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Subjects</option>
            {getSubjects().map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="subject">Subject A-Z</option>
          </select>
          
          <button onClick={fetchNotes} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="notes-grid">
        {currentNotes.map(note => (
          <div key={note.id} className="note-card">
            <div className="note-header">
              <div className="note-title">{note.title || 'Untitled'}</div>
              {getStatusBadge(note)}
            </div>
            
            <div className="note-meta">
              <div className="meta-item">
                <span className="meta-label">Subject:</span>
                <span className="meta-value">{note.subject || 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">{note.category || 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Student:</span>
                <span className="meta-value">{note.userEmail || 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Size:</span>
                <span className="meta-value">{formatFileSize(note.fileSize)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Uploaded:</span>
                <span className="meta-value">{formatDate(note.createdAt)}</span>
              </div>
              {note.coinReward && (
                <div className="meta-item">
                  <span className="meta-label">Coins:</span>
                  <span className="meta-value coin-reward">💰 {note.coinReward}</span>
                </div>
              )}
            </div>
            
            {note.description && (
              <div className="note-description">
                {note.description.length > 100 
                  ? note.description.substring(0, 100) + '...' 
                  : note.description}
              </div>
            )}
            
            <div className="note-actions">
              {(!note.isApproved && note.approvalStatus !== 'approved') && (
                <button
                  onClick={() => handleApproveNote(note.id)}
                  disabled={actionLoading[note.id] === 'approving'}
                  className="action-btn approve"
                >
                  {actionLoading[note.id] === 'approving' ? '⏳ Approving...' : '✅ Approve'}
                </button>
              )}
              
              {note.approvalStatus !== 'rejected' && (
                <button
                  onClick={() => handleRejectNote(note.id)}
                  disabled={actionLoading[note.id] === 'rejecting'}
                  className="action-btn reject"
                >
                  {actionLoading[note.id] === 'rejecting' ? '⏳ Rejecting...' : '❌ Reject'}
                </button>
              )}
              
              <button
                onClick={() => {
                  setPreviewNote(note);
                  setShowPreview(true);
                }}
                className="action-btn preview"
              >
                👁️ Preview
              </button>
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
            Page {currentPage} of {totalPages} ({sortedNotes.length} notes)
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

      {/* Preview Modal */}
      {showPreview && previewNote && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 Note Preview</h3>
              <button onClick={() => setShowPreview(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="preview-info">
                <h4>{previewNote.title}</h4>
                <p><strong>Subject:</strong> {previewNote.subject}</p>
                <p><strong>Category:</strong> {previewNote.category}</p>
                <p><strong>Student:</strong> {previewNote.userEmail}</p>
                <p><strong>File:</strong> {previewNote.fileName} ({formatFileSize(previewNote.fileSize)})</p>
                <p><strong>Description:</strong> {previewNote.description}</p>
                <p><strong>Status:</strong> {getStatusBadge(previewNote)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .notes-enhanced {
          padding: 1rem;
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }

        .notification.success { background: #2ecc71; }
        .notification.error { background: #e74c3c; }
        .notification.warning { background: #f39c12; }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
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
        .stat-card.pending { border-color: #f39c12; }
        .stat-card.approved { border-color: #2ecc71; }
        .stat-card.rejected { border-color: #e74c3c; }

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

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .note-card {
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .note-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          border-color: #ff6b35;
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .note-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          flex: 1;
          margin-right: 1rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-badge.approved {
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
          border: 1px solid #2ecc71;
        }

        .status-badge.pending {
          background: rgba(243, 156, 18, 0.2);
          color: #f39c12;
          border: 1px solid #f39c12;
        }

        .status-badge.rejected {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
          border: 1px solid #e74c3c;
        }

        .note-meta {
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

        .coin-reward {
          color: #f39c12;
          font-weight: 600;
        }

        .note-description {
          color: #aaa;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .note-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          min-width: 80px;
        }

        .action-btn.approve {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          color: white;
        }

        .action-btn.reject {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
        }

        .action-btn.preview {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #2a2a2a;
          border: 1px solid #444;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #444;
        }

        .modal-header h3 {
          color: #fff;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #888;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #fff;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .preview-info h4 {
          color: #fff;
          margin-bottom: 1rem;
        }

        .preview-info p {
          color: #ccc;
          margin-bottom: 0.5rem;
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
          
          .notes-grid {
            grid-template-columns: 1fr;
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

export default NotesEnhanced;
