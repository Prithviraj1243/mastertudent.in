import React, { useState, useEffect } from 'react';

const Notes = () => {
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
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [notesPerPage] = useState(12);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);
  const [showTeacherLogin, setShowTeacherLogin] = useState(true);
  const [teacherCredentials, setTeacherCredentials] = useState({ id: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check if teacher is already authenticated
    const teacherAuth = localStorage.getItem('teacher_authenticated');
    if (teacherAuth === 'true') {
      setIsTeacherAuthenticated(true);
      setShowTeacherLogin(false);
      fetchNotes();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isTeacherAuthenticated) {
      fetchNotes();
    }
  }, [isTeacherAuthenticated]);

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
        // Calculate statistics
        const total = data.notes.length;
        const pending = data.notes.filter(note => note.approvalStatus === 'pending').length;
        const approved = data.notes.filter(note => note.approvalStatus === 'approved').length;
        const rejected = data.notes.filter(note => note.approvalStatus === 'rejected').length;
        setStats({ total, pending, approved, rejected });
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'free') return matchesSearch && (note.price === 0 || !note.price);
    if (filterBy === 'paid') return matchesSearch && note.price > 0;
    if (filterBy === 'premium') return matchesSearch && note.isPremium;
    
    return matchesSearch;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'newest' || sortBy === 'createdAt') {
      const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt || 0);
      return dateB - dateA;
    }
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    if (sortBy === 'price') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
    return 0;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getNoteType = (note) => {
    if (note.isPremium) return 'Premium';
    if (note.price > 0) return 'Paid';
    return 'Free';
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Premium': return '#9b59b6';
      case 'Paid': return '#e67e22';
      case 'Free': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return `₹${price}`;
  };

  // Teacher Authentication Functions
  const handleTeacherLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    // Teacher credentials (you can modify these)
    const validCredentials = {
      id: 'teacher123',
      password: 'notes2024'
    };

    if (teacherCredentials.id === validCredentials.id && 
        teacherCredentials.password === validCredentials.password) {
      setIsTeacherAuthenticated(true);
      setShowTeacherLogin(false);
      localStorage.setItem('teacher_authenticated', 'true');
      localStorage.setItem('teacher_id', teacherCredentials.id);
    } else {
      setLoginError('Invalid teacher credentials. Please check your ID and password.');
    }
  };

  const handleTeacherLogout = () => {
    setIsTeacherAuthenticated(false);
    setShowTeacherLogin(true);
    setTeacherCredentials({ id: '', password: '' });
    localStorage.removeItem('teacher_authenticated');
    localStorage.removeItem('teacher_id');
  };

  const handleCredentialChange = (field, value) => {
    setTeacherCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setLoginError(''); // Clear error when user types
  };

  const handlePreviewNote = (note) => {
    setPreviewNote(note);
    setShowPreview(true);
  };

  const handleApproveNote = async (noteId) => {
    // Prompt for approval reason (minimum 60 words)
    const reason = prompt('Please provide a detailed reason for approving this note (minimum 60 words):');
    if (!reason || reason.trim() === '') {
      showNotification('❌ Approval reason is required.', 'error');
      return;
    }

    const wordCount = reason.trim().split(/\s+/).length;
    if (wordCount < 60) {
      showNotification(`❌ Please provide at least 60 words. Current: ${wordCount} words.`, 'error');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [noteId]: 'approving' }));
      
      const response = await fetch(`http://localhost:3001/admin/notes/${noteId}/approve`, {
        method: 'POST',
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminEmail: 'teacher@masterstudent.com',
          approvalReason: reason,
          teacherId: localStorage.getItem('teacher_id')
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Show success notification
        showNotification(`✅ Note approved! ${result.coinReward} coins rewarded to student.`, 'success');
        // Refresh notes list
        fetchNotes();
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
    // Prompt for rejection reason (minimum 60 words)
    const reason = prompt('Please provide a detailed reason for rejecting this note (minimum 60 words):');
    if (!reason || reason.trim() === '') {
      showNotification('❌ Rejection reason is required.', 'error');
      return;
    }

    const wordCount = reason.trim().split(/\s+/).length;
    if (wordCount < 60) {
      showNotification(`❌ Please provide at least 60 words. Current: ${wordCount} words.`, 'error');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [noteId]: 'rejecting' }));
      
      const response = await fetch(`http://localhost:3001/admin/notes/${noteId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        },
        body: JSON.stringify({ 
          reason,
          teacherId: localStorage.getItem('teacher_id')
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === noteId 
              ? { ...note, approvalStatus: 'rejected', rejectionReason: reason }
              : note
          )
        );
        
        showNotification('✅ Note rejected with detailed feedback provided.', 'success');
      } else {
        throw new Error(result.error || 'Failed to reject note');
      }
    } catch (error) {
      console.error('Error rejecting note:', error);
      showNotification('❌ Failed to reject note: ' + error.message, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [noteId]: null }));
    }
  };

  const handleDeleteNote = async (noteId) => {
    const confirmDelete = window.confirm('Are you sure you want to permanently delete this note? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      setActionLoading(prev => ({ ...prev, [noteId]: 'deleting' }));
      
      const response = await fetch(`http://localhost:3001/admin/notes/${noteId}/delete`, {
        method: 'DELETE',
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        // Remove note from the list
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
        showNotification('Note deleted successfully', 'success');
      } else {
        throw new Error(result.error || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      showNotification('Failed to delete note: ' + error.message, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [noteId]: null }));
    }
  };

  // Notification system
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 10px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      max-width: 400px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
      success: 'linear-gradient(135deg, #2ecc71, #27ae60)',
      error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      warning: 'linear-gradient(135deg, #f39c12, #e67e22)',
      info: 'linear-gradient(135deg, #3498db, #2980b9)'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  };

  const downloadFile = async (filePath, fileName) => {
    try {
      const response = await fetch(`http://localhost:8000${filePath}`);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const getFileTypePreview = (fileName, filePath) => {
    if (!fileName) return null;
    
    const extension = fileName.split('.').pop().toLowerCase();
    const fileUrl = `http://localhost:8000${filePath}`;
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="image-preview">
            <img 
              src={fileUrl} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="pdf-preview">
            <iframe 
              src={fileUrl}
              width="100%" 
              height="300px"
              style={{ border: '1px solid #333', borderRadius: '8px' }}
              title="PDF Preview"
            />
          </div>
        );
      
      default:
        return (
          <div className="file-info-preview">
            <div className="file-details">
              <span className="file-extension">{extension.toUpperCase()}</span>
              <span className="file-name">{fileName}</span>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading notes...</p>
      </div>
    );
  }

  // Show teacher login if not authenticated
  if (!isTeacherAuthenticated && showTeacherLogin) {
    return (
      <div className="teacher-login-container fade-in-up">
        <div className="teacher-login-card">
          <div className="login-header">
            <div className="login-logo">👨‍🏫</div>
            <h1 className="login-title">Teacher Access Required</h1>
            <p className="login-subtitle">Notes Management - Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleTeacherLogin} className="teacher-login-form">
            <div className="form-group">
              <label className="form-label">Teacher ID</label>
              <input
                type="text"
                className="form-input"
                value={teacherCredentials.id}
                onChange={(e) => handleCredentialChange('id', e.target.value)}
                placeholder="Enter your teacher ID"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={teacherCredentials.password}
                onChange={(e) => handleCredentialChange('password', e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {loginError && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {loginError}
              </div>
            )}

            <button type="submit" className="btn btn-primary login-btn">
              <span className="login-icon">🔓</span>
              Access Notes Management
            </button>
          </form>

          <div className="login-footer">
            <div className="login-hint">
              <p>💡 <strong>Demo Credentials:</strong></p>
              <p>ID: teacher123 | Password: notes2024</p>
            </div>
            <div className="login-features">
              <div className="feature">
                <span className="feature-icon">📚</span>
                <span>Manage Student Notes</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✅</span>
                <span>Approve/Reject Submissions</span>
              </div>
              <div className="feature">
                <span className="feature-icon">👁️</span>
                <span>Preview & Download Files</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-page fade-in-up">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon-container">
            <div className="stat-icon icon-chart"></div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{notes.length}</div>
            <div className="stat-label">Total Notes</div>
          </div>
          <div className="stat-trend positive">+12%</div>
        </div>
        
        <div className="stat-card stat-pending">
          <div className="stat-icon-container">
            <div className="stat-icon icon-clock"></div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{notes.filter(n => n.approvalStatus === 'pending').length}</div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-badge pending-badge">{notes.filter(n => n.approvalStatus === 'pending').length > 0 ? 'Action Required' : 'All Clear'}</div>
        </div>
        
        <div className="stat-card stat-approved">
          <div className="stat-icon-container">
            <div className="stat-icon icon-check"></div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{notes.filter(n => n.approvalStatus === 'approved').length}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-percentage positive">+{notes.length > 0 ? Math.round((notes.filter(n => n.approvalStatus === 'approved').length / notes.length) * 100) : 0}%</div>
        </div>
        
        <div className="stat-card stat-rejected">
          <div className="stat-icon-container">
            <div className="stat-icon icon-x"></div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{notes.filter(n => n.approvalStatus === 'rejected').length}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-percentage negative">{notes.length > 0 ? Math.round((notes.filter(n => n.approvalStatus === 'rejected').length / notes.length) * 100) : 0}%</div>
        </div>
      </div>

      {/* Small Logout Button */}
      <button 
        className="logout-btn-small"
        onClick={handleTeacherLogout}
        title="Logout from Notes Management"
      >
        <div className="logout-icon"></div>
        <span>Logout</span>
      </button>

      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h2 className="section-title">📚 Notes Management</h2>
            <p className="section-subtitle">Review, approve, and manage student submissions</p>
          </div>
          <div className="header-actions">
            <div className="teacher-info">
              <div className="teacher-avatar">
                <div className="avatar-gradient"></div>
                <span className="avatar-text">T</span>
              </div>
              <div className="teacher-details">
                <span className="teacher-name">{localStorage.getItem('teacher_id')}</span>
                <span className="teacher-role">Notes Reviewer</span>
              </div>
              <div className="status-indicator online"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="notes-controls">
        <div className="search-box">
          <div className="search-icon"></div>
          <input
            type="text"
            placeholder="Search notes by title, subject, or description..."
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
            <option value="newest">Newest First</option>
            <option value="title">Sort by Title</option>
            <option value="price">Sort by Price</option>
            <option value="downloads">Sort by Downloads</option>
          </select>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Notes</option>
            <option value="free">Free Notes</option>
            <option value="paid">Paid Notes</option>
            <option value="premium">Premium Notes</option>
          </select>
        </div>
      </div>

      <div className="notes-stats">
        <div className="stat-item">
          <span className="stat-number">{notes.length}</span>
          <span className="stat-label">Total Notes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{notes.filter(n => n.price > 0).length}</span>
          <span className="stat-label">Paid Notes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{notes.filter(n => n.isPremium).length}</span>
          <span className="stat-label">Premium Notes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredNotes.length}</span>
          <span className="stat-label">Filtered Results</span>
        </div>
      </div>

      <div className="notes-grid">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <div className="note-type-badge" style={{ backgroundColor: getTypeColor(getNoteType(note)) }}>
                  {getNoteType(note)}
                </div>
                <div className="note-actions">
                  <button 
                    className="action-btn view-btn" 
                    title="Preview Note"
                    onClick={() => handlePreviewNote(note)}
                  >
                    <div className="btn-icon icon-eye"></div>
                  </button>
                  {note.approvalStatus === 'pending' && (
                    <>
                      <button 
                        className={`action-btn approve-btn modern-action-btn ${actionLoading[note.id] === 'approving' ? 'loading' : ''}`}
                        title="Approve Note & Reward Coins"
                        onClick={() => handleApproveNote(note.id)}
                        disabled={actionLoading[note.id]}
                      >
                        {actionLoading[note.id] === 'approving' ? (
                          <div className="btn-spinner"></div>
                        ) : (
                          <>
                            <div className="btn-icon icon-check"></div>
                            <span className="btn-text">Approve</span>
                          </>
                        )}
                      </button>
                      <button 
                        className={`action-btn reject-btn modern-action-btn ${actionLoading[note.id] === 'rejecting' ? 'loading' : ''}`}
                        title="Reject Note"
                        onClick={() => handleRejectNote(note.id)}
                        disabled={actionLoading[note.id]}
                      >
                        {actionLoading[note.id] === 'rejecting' ? (
                          <div className="btn-spinner"></div>
                        ) : (
                          <>
                            <div className="btn-icon icon-x"></div>
                            <span className="btn-text">Reject</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                  <button 
                    className={`action-btn delete-btn ${actionLoading[note.id] === 'deleting' ? 'loading' : ''}`}
                    title="Delete Note Permanently"
                    onClick={() => handleDeleteNote(note.id)}
                    disabled={actionLoading[note.id]}
                  >
                    {actionLoading[note.id] === 'deleting' ? (
                      <div className="btn-spinner"></div>
                    ) : (
                      <div className="btn-icon icon-trash"></div>
                    )}
                  </button>
                </div>
              </div>

              <div className="note-content">
                <div className="note-icon icon-document"></div>
                <h3 className="note-title">{note.title || 'Untitled Note'}</h3>
                <p className="note-subject">{note.subject || 'No subject'}</p>
                <p className="note-description">
                  {note.description ? 
                    (note.description.length > 100 ? 
                      note.description.substring(0, 100) + '...' : 
                      note.description
                    ) : 
                    'No description available'
                  }
                </p>
              </div>

              <div className="note-meta">
                <div className="meta-item">
                  <span className="meta-icon">💰</span>
                  <span className="meta-value">{formatPrice(note.price)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📥</span>
                  <span className="meta-value">{note.downloads || 0} downloads</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">⭐</span>
                  <span className="meta-value">{note.rating || 0}/5</span>
                </div>
              </div>

              <div className="note-footer">
                <div className="note-date">
                  <span className="date-icon">📅</span>
                  <span>Uploaded {formatDate(note.createdAt)}</span>
                </div>
                <div className="note-size">
                  <span className="size-icon">📊</span>
                  <span>{note.fileSize || 'Unknown size'}</span>
                </div>
              </div>

              <div className="note-preview">
                {note.cloudinaryUrl ? (
                  <a 
                    href={note.cloudinaryUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="preview-link"
                  >
                    <span className="preview-icon">☁️</span>
                    View on Cloudinary
                  </a>
                ) : note.filePath ? (
                  <div className="file-actions">
                    <a 
                      href={`http://localhost:8000${note.filePath}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="preview-link"
                    >
                      <span className="preview-icon">📁</span>
                      View File
                    </a>
                    <button 
                      className="download-link"
                      onClick={() => downloadFile(note.filePath, note.fileName)}
                    >
                      <span className="download-icon">⬇️</span>
                      Download
                    </button>
                  </div>
                ) : (
                  <div className="no-file-available">
                    <span className="no-file-icon">📄</span>
                    <span>File not available</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-notes">
            <div className="no-notes-icon">📚</div>
            <h3>No Notes Found</h3>
            <p>No notes match your current search and filter criteria.</p>
            <button className="btn btn-primary">
              <span>📤</span>
              Upload First Note
            </button>
          </div>
        )}
      </div>

      {/* Note Preview Modal */}
      {showPreview && previewNote && (
        <div className="preview-modal">
          <div className="preview-content">
            <div className="preview-header">
              <h2>📄 Note Preview</h2>
              <button 
                className="close-btn"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="preview-body">
              <div className="preview-info">
                <div className="info-row">
                  <span className="info-label">Title:</span>
                  <span className="info-value">{previewNote.title}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Subject:</span>
                  <span className="info-value">{previewNote.subject}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Category:</span>
                  <span className="info-value">{previewNote.category}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Uploaded by:</span>
                  <span className="info-value">{previewNote.userEmail}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge ${previewNote.approvalStatus}`}>
                    {previewNote.approvalStatus || 'pending'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">File Size:</span>
                  <span className="info-value">{previewNote.fileSize || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="preview-description">
                <h4>Description:</h4>
                <p>{previewNote.description || 'No description provided'}</p>
              </div>
              
              <div className="preview-file">
                <h4>File Preview:</h4>
                {previewNote.cloudinaryUrl ? (
                  <div className="file-preview-container">
                    <a 
                      href={previewNote.cloudinaryUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      <span className="file-icon">☁️</span>
                      View on Cloudinary
                    </a>
                  </div>
                ) : previewNote.filePath ? (
                  <div className="file-preview-container">
                    <a 
                      href={`http://localhost:8000${previewNote.filePath}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      <span className="file-icon">📁</span>
                      View File
                    </a>
                    <button 
                      className="download-btn"
                      onClick={() => downloadFile(previewNote.filePath, previewNote.fileName)}
                    >
                      <span className="download-icon">⬇️</span>
                      Download
                    </button>
                  </div>
                ) : (
                  <div className="no-file">
                    <span className="no-file-icon">📄</span>
                    <p>File not available for preview</p>
                  </div>
                )}
                
                {/* File Type Preview */}
                {previewNote.filePath && (
                  <div className="file-type-preview">
                    {getFileTypePreview(previewNote.fileName, previewNote.filePath)}
                  </div>
                )}
              </div>
              
              {previewNote.approvalStatus === 'pending' && (
                <div className="preview-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      handleApproveNote(previewNote.id);
                      setShowPreview(false);
                    }}
                  >
                    ✅ Approve Note
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      handleRejectNote(previewNote.id);
                      setShowPreview(false);
                    }}
                  >
                    ❌ Reject Note
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .notes-controls {
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

        .notes-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 12px;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
          flex: 1;
          min-width: 120px;
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

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .note-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .note-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff6b35 0%, #ff4757 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .note-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.2);
          border-color: #ff6b35;
        }

        .note-card:hover::before {
          opacity: 1;
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .note-type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .note-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
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

        .note-content {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .note-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #ff6b35;
        }

        .note-title {
          color: #fff;
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .note-subject {
          color: #ff6b35;
          font-weight: 500;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.9rem;
        }

        .note-description {
          color: #888;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        .note-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(255, 107, 53, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 107, 53, 0.1);
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
        }

        .meta-icon {
          font-size: 1.2rem;
        }

        .meta-value {
          color: #ccc;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .note-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #333;
          margin-bottom: 1rem;
        }

        .note-date, .note-size {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #888;
          font-size: 0.8rem;
        }

        .date-icon, .size-icon {
          font-size: 1rem;
        }

        .note-preview {
          text-align: center;
        }

        .preview-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(90deg, #ff6b35 0%, #ff4757 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .preview-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
        }

        .preview-icon {
          font-size: 1rem;
        }

        .no-notes {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          color: #888;
        }

        .no-notes-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .no-notes h3 {
          color: #fff;
          margin-bottom: 1rem;
        }

        .no-notes .btn {
          margin-top: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .approve-btn {
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
        }

        .approve-btn:hover {
          background: rgba(46, 204, 113, 0.3);
          transform: scale(1.1);
        }

        .reject-btn {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }

        .reject-btn:hover {
          background: rgba(231, 76, 60, 0.3);
          transform: scale(1.1);
        }

        /* Preview Modal Styles */
        .preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .preview-content {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #333;
        }

        .preview-header h2 {
          color: #ff6b35;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #888;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(255, 107, 53, 0.2);
          color: #ff6b35;
        }

        .preview-body {
          padding: 1.5rem;
        }

        .preview-info {
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #333;
        }

        .info-label {
          color: #888;
          font-weight: 500;
        }

        .info-value {
          color: #fff;
          font-weight: 500;
        }

        .status-badge.pending {
          background: #ffa502;
        }

        .status-badge.approved {
          background: #2ecc71;
        }

        .status-badge.rejected {
          background: #e74c3c;
        }

        .preview-description {
          margin-bottom: 1.5rem;
        }

        .preview-description h4 {
          color: #ff6b35;
          margin-bottom: 0.5rem;
        }

        .preview-description p {
          color: #ccc;
          line-height: 1.5;
        }

        .preview-file {
          margin-bottom: 1.5rem;
        }

        .preview-file h4 {
          color: #ff6b35;
          margin-bottom: 0.5rem;
        }

        .file-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(90deg, #ff6b35 0%, #ff4757 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .file-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
        }

        .file-icon {
          font-size: 1.2rem;
        }

        .preview-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          padding-top: 1rem;
          border-top: 1px solid #333;
        }

        .btn-success {
          background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
          color: white;
        }

        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
        }

        .btn-danger {
          background: linear-gradient(90deg, #e74c3c 0%, #c0392b 100%);
          color: white;
        }

        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
        }

        /* File Preview Styles */
        .file-preview-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .download-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
        }

        .download-icon {
          font-size: 1rem;
        }

        .no-file {
          text-align: center;
          padding: 2rem;
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.2);
          border-radius: 8px;
          color: #e74c3c;
        }

        .no-file-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .file-type-preview {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255, 107, 53, 0.05);
          border: 1px solid rgba(255, 107, 53, 0.1);
          border-radius: 8px;
        }

        .image-preview {
          text-align: center;
        }

        .pdf-preview {
          border-radius: 8px;
          overflow: hidden;
        }

        .file-info-preview {
          text-align: center;
          padding: 2rem;
        }

        .file-details {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .file-extension {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: linear-gradient(90deg, #ff6b35 0%, #ff4757 100%);
          color: white;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .file-name {
          color: #ccc;
          font-size: 0.9rem;
          word-break: break-all;
        }

        /* Note Card File Actions */
        .file-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .download-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 0.75rem;
          background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .download-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(46, 204, 113, 0.3);
        }

        .no-file-available {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.2);
          border-radius: 6px;
          color: #e74c3c;
          font-size: 0.9rem;
        }

        .no-file-available .no-file-icon {
          font-size: 1.2rem;
        }

        /* Teacher Login Styles */
        .teacher-login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
          padding: 2rem;
          position: relative;
          z-index: 10;
        }

        .teacher-login-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 20px;
          padding: 3rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
        }

        .teacher-login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff6b35 0%, #ff4757 100%);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: fireGlow 2s infinite alternate;
        }

        .login-title {
          font-size: 2rem;
          font-weight: 700;
          color: #ff6b35;
          text-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          color: #888;
          font-size: 1rem;
        }

        .teacher-login-form {
          margin-bottom: 2rem;
        }

        .login-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .login-icon {
          font-size: 1.2rem;
        }

        .error-message {
          background: rgba(255, 71, 87, 0.1);
          border: 1px solid #ff4757;
          color: #ff6348;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .login-footer {
          border-top: 1px solid #333;
          padding-top: 2rem;
        }

        .login-hint {
          background: rgba(255, 165, 2, 0.1);
          border: 1px solid #ffa502;
          color: #ffa502;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .login-features {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #888;
          font-size: 0.9rem;
        }

        .feature-icon {
          font-size: 1rem;
        }

        /* Header Modifications */
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-text {
          flex: 1;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .teacher-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.2);
          border-radius: 8px;
          color: #ff6b35;
          font-weight: 500;
        }

        .teacher-icon {
          font-size: 1.2rem;
        }

        .teacher-name {
          font-size: 0.9rem;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(90deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
        }

        .logout-icon {
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .notes-controls {
            flex-direction: column;
          }
          
          .search-box {
            min-width: auto;
          }
          
          .notes-stats {
            flex-direction: column;
            gap: 1rem;
          }
          
          .notes-grid {
            grid-template-columns: 1fr;
          }
          
          .note-meta {
            flex-direction: column;
            gap: 1rem;
          }
          
          .note-footer {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Notes;
