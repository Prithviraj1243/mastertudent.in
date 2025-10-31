import React, { useState, useRef, useEffect } from 'react';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [noteMetadata, setNoteMetadata] = useState({
    title: '',
    subject: '',
    description: '',
    price: 0,
    tags: '',
    userEmail: 'admin@masterstudent.com'
  });
  const fileInputRef = useRef(null);

  // Fetch recent notes on component mount
  useEffect(() => {
    fetchRecentNotes();
  }, []);

  const fetchRecentNotes = async () => {
    try {
      setLoadingNotes(true);
      const response = await fetch('http://localhost:3001/admin/notes', {
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });
      const data = await response.json();
      if (data.success) {
        // Get the 5 most recent notes
        const sortedNotes = data.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentNotes(sortedNotes.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recent notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    setUploadedFiles(fileArray);
  };

  const uploadToCloudinary = async (file) => {
    // Validate metadata
    if (!noteMetadata.title.trim()) {
      setUploadResult({ error: 'Please enter a title for the note' });
      return;
    }
    if (!noteMetadata.subject.trim()) {
      setUploadResult({ error: 'Please select a subject' });
      return;
    }
    if (!noteMetadata.description.trim()) {
      setUploadResult({ error: 'Please enter a description' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    // Add note metadata
    formData.append('title', noteMetadata.title);
    formData.append('subject', noteMetadata.subject);
    formData.append('description', noteMetadata.description);
    formData.append('price', noteMetadata.price.toString());
    formData.append('tags', noteMetadata.tags);
    formData.append('userEmail', noteMetadata.userEmail);

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:3001/admin/upload', {
        method: 'POST',
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();
      
      if (result.success) {
        setUploadResult(result);
        // Clear form after successful upload
        setNoteMetadata({
          title: '',
          subject: '',
          description: '',
          price: 0,
          tags: '',
          userEmail: 'admin@masterstudent.com'
        });
        // Refresh recent notes list
        fetchRecentNotes();
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 1000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({ error: error.message });
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpload = () => {
    if (uploadedFiles.length > 0) {
      uploadToCloudinary(uploadedFiles[0]);
    }
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    setUploadResult(null);
    setNoteMetadata({
      title: '',
      subject: '',
      description: '',
      price: 0,
      tags: '',
      userEmail: 'admin@masterstudent.com'
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'ppt':
      case 'pptx': return '📊';
      case 'xls':
      case 'xlsx': return '📈';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎥';
      case 'mp3':
      case 'wav': return '🎵';
      case 'zip':
      case 'rar': return '📦';
      default: return '📁';
    }
  };

  return (
    <div className="upload-page fade-in-up">
      <div className="page-header">
        <h1 className="page-title">☁️ File Upload</h1>
        <p className="page-subtitle">Upload files to Cloudinary (25GB Free Storage)</p>
      </div>

      <div className="upload-stats">
        <div className="stat-item">
          <div className="stat-icon">☁️</div>
          <div className="stat-number">25GB</div>
          <div className="stat-label">Free Storage</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">⚡</div>
          <div className="stat-number">50MB</div>
          <div className="stat-label">Max File Size</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🔒</div>
          <div className="stat-number">Secure</div>
          <div className="stat-label">CDN Delivery</div>
        </div>
      </div>

      <div className="upload-container">
        <div 
          className={`upload-area ${dragActive ? 'dragover' : ''} ${uploading ? 'uploading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleChange}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.zip,.rar"
          />

          {uploading ? (
            <div className="upload-progress">
              <div className="progress-icon">☁️</div>
              <h3>Uploading to Cloudinary...</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p>{uploadProgress}% Complete</p>
            </div>
          ) : uploadedFiles.length > 0 ? (
            <div className="files-preview">
              <div className="preview-icon">📁</div>
              <h3>Files Ready for Upload</h3>
              <div className="files-list">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-icon">{getFileIcon(file.name)}</span>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Note Metadata Form */}
              <div className="metadata-form" onClick={(e) => e.stopPropagation()}>
                <h4>📝 Note Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={noteMetadata.title}
                      onChange={(e) => setNoteMetadata({...noteMetadata, title: e.target.value})}
                      placeholder="Enter note title"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Subject *</label>
                    <select
                      value={noteMetadata.subject}
                      onChange={(e) => setNoteMetadata({...noteMetadata, subject: e.target.value})}
                      className="form-select"
                    >
                      <option value="">Select Subject</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      value={noteMetadata.price}
                      onChange={(e) => setNoteMetadata({...noteMetadata, price: parseInt(e.target.value) || 0})}
                      placeholder="0 for free"
                      className="form-input"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      value={noteMetadata.tags}
                      onChange={(e) => setNoteMetadata({...noteMetadata, tags: e.target.value})}
                      placeholder="JEE, NEET, Engineering (comma separated)"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    value={noteMetadata.description}
                    onChange={(e) => setNoteMetadata({...noteMetadata, description: e.target.value})}
                    placeholder="Describe what this note covers..."
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="upload-actions">
                <button className="btn btn-primary" onClick={handleUpload}>
                  <span>☁️</span>
                  Upload Note
                </button>
                <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                  <span>📁</span>
                  Browse Files
                </button>
                <button className="btn btn-secondary" onClick={clearFiles}>
                  <span>🗑️</span>
                  Clear All
                </button>
              </div>
            </div>
          ) : (
            <div className="upload-prompt" onClick={() => fileInputRef.current?.click()}>
              <div className="upload-icon">☁️</div>
              <h3>Drag & Drop Files Here</h3>
              <p>or click to browse files</p>
              <div className="supported-formats">
                <p>Supported formats:</p>
                <div className="format-tags">
                  <span className="format-tag">PDF</span>
                  <span className="format-tag">DOC</span>
                  <span className="format-tag">PPT</span>
                  <span className="format-tag">XLS</span>
                  <span className="format-tag">Images</span>
                  <span className="format-tag">Videos</span>
                  <span className="format-tag">Audio</span>
                  <span className="format-tag">Archives</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {uploadResult && (
          <div className={`upload-result ${uploadResult.error ? 'error' : 'success'}`}>
            {uploadResult.error ? (
              <div className="result-content">
                <div className="result-icon">❌</div>
                <h3>Upload Failed</h3>
                <p>{uploadResult.error}</p>
                <button className="btn btn-secondary" onClick={() => setUploadResult(null)}>
                  Try Again
                </button>
              </div>
            ) : (
              <div className="result-content">
                <div className="result-icon">✅</div>
                <h3>Upload Successful!</h3>
                <div className="result-details">
                  <div className="detail-item">
                    <span className="detail-label">Public ID:</span>
                    <span className="detail-value">{uploadResult.file.public_id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Format:</span>
                    <span className="detail-value">{uploadResult.file.format}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Size:</span>
                    <span className="detail-value">{formatFileSize(uploadResult.file.size)}</span>
                  </div>
                  {uploadResult.file.width && uploadResult.file.height && (
                    <div className="detail-item">
                      <span className="detail-label">Dimensions:</span>
                      <span className="detail-value">{uploadResult.file.width} x {uploadResult.file.height}</span>
                    </div>
                  )}
                </div>
                <div className="result-actions">
                  <a 
                    href={uploadResult.file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <span>🔗</span>
                    View File
                  </a>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => navigator.clipboard.writeText(uploadResult.file.url)}
                  >
                    <span>📋</span>
                    Copy URL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Notes Section */}
      <div className="recent-notes-section">
        <div className="section-header">
          <h3>📚 Recently Uploaded Notes</h3>
          <button onClick={fetchRecentNotes} className="refresh-btn-small">
            🔄 Refresh
          </button>
        </div>
        
        {loadingNotes ? (
          <div className="loading-notes">
            <div className="loading-spinner-small"></div>
            <p>Loading recent notes...</p>
          </div>
        ) : recentNotes.length > 0 ? (
          <div className="notes-list">
            {recentNotes.map((note, index) => (
              <div key={note.id || index} className="note-item">
                <div className="note-info">
                  <div className="note-title">{note.title || 'Untitled Note'}</div>
                  <div className="note-details">
                    <span className="note-subject">{note.subject || 'No Subject'}</span>
                    <span className="note-status">
                      {note.isApproved ? '✅ Approved' : 
                       note.approvalStatus === 'rejected' ? '❌ Rejected' : 
                       '⏳ Pending'}
                    </span>
                    <span className="note-date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="note-actions-small">
                  <button 
                    className="view-btn-small"
                    onClick={() => window.open(`/download-notes`, '_blank')}
                    title="View in Download Section"
                  >
                    👁️
                  </button>
                  {note.filePath && (
                    <button 
                      className="download-btn-small"
                      onClick={() => window.open(note.filePath, '_blank')}
                      title="Download File"
                    >
                      📎
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-notes">
            <div className="no-notes-icon">📝</div>
            <p>No notes uploaded yet</p>
            <small>Upload your first note using the form above</small>
          </div>
        )}
      </div>

      <div className="upload-tips">
        <h3>📝 Upload Tips</h3>
        <div className="tips-grid">
          <div className="tip-item">
            <div className="tip-icon">⚡</div>
            <div className="tip-content">
              <h4>Fast CDN Delivery</h4>
              <p>Files are automatically optimized and delivered via global CDN</p>
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-icon">🔒</div>
            <div className="tip-content">
              <h4>Secure Storage</h4>
              <p>All files are stored securely with backup and redundancy</p>
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-icon">📊</div>
            <div className="tip-content">
              <h4>Analytics Tracking</h4>
              <p>Track file views, downloads, and engagement metrics</p>
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-icon">🎨</div>
            <div className="tip-content">
              <h4>Auto Optimization</h4>
              <p>Images and videos are automatically optimized for web</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .upload-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          justify-content: center;
        }

        .stat-item {
          text-align: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 12px;
          min-width: 150px;
        }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ff6b35;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: #888;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .upload-container {
          margin-bottom: 3rem;
        }

        .upload-area {
          border: 3px dashed #333;
          border-radius: 20px;
          padding: 4rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .upload-area::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 107, 53, 0.05) 50%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .upload-area:hover::before {
          opacity: 1;
        }

        .upload-area:hover {
          border-color: #ff6b35;
          background: rgba(255, 107, 53, 0.05);
          transform: translateY(-2px);
        }

        .upload-area.dragover {
          border-color: #ff4757;
          background: rgba(255, 71, 87, 0.1);
          transform: scale(1.02);
        }

        .upload-area.uploading {
          border-color: #2ecc71;
          background: rgba(46, 204, 113, 0.05);
        }

        .upload-prompt {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 4rem 2rem;
          color: #ccc;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-prompt:hover {
          background: rgba(255, 107, 53, 0.05);
          border-color: rgba(255, 107, 53, 0.3);
          transform: translateY(-2px);
        }

        .upload-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          color: #ff6b35;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .upload-prompt h3 {
          color: #fff;
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }

        .upload-prompt p {
          color: #888;
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .supported-formats p {
          color: #888;
          margin-bottom: 1rem;
        }

        .format-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        .format-tag {
          padding: 0.25rem 0.75rem;
          background: rgba(255, 107, 53, 0.2);
          color: #ff6b35;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .upload-progress {
          position: relative;
          z-index: 2;
        }

        .progress-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          color: #2ecc71;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .upload-progress h3 {
          color: #2ecc71;
          margin-bottom: 2rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #333;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .files-preview {
          position: relative;
          z-index: 2;
        }

        .preview-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #ff6b35;
        }

        .files-preview h3 {
          color: #fff;
          margin-bottom: 2rem;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.2);
          border-radius: 8px;
        }

        .file-icon {
          font-size: 2rem;
        }

        .file-info {
          flex: 1;
          text-align: left;
        }

        .file-name {
          color: #fff;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .file-size {
          color: #888;
          font-size: 0.9rem;
        }

        .upload-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .upload-result {
          margin-top: 2rem;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
        }

        .upload-result.success {
          background: rgba(46, 204, 113, 0.1);
          border: 1px solid rgba(46, 204, 113, 0.3);
        }

        .upload-result.error {
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.3);
        }

        .result-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .result-content h3 {
          margin-bottom: 1.5rem;
        }

        .upload-result.success h3 {
          color: #2ecc71;
        }

        .upload-result.error h3 {
          color: #e74c3c;
        }

        .result-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          background: rgba(255, 107, 53, 0.05);
          border-radius: 6px;
        }

        .detail-label {
          color: #888;
          font-weight: 500;
        }

        .detail-value {
          color: #fff;
          font-family: monospace;
        }

        .result-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .metadata-form {
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(255, 107, 53, 0.05);
          border: 1px solid rgba(255, 107, 53, 0.2);
          border-radius: 12px;
        }

        .metadata-form h4 {
          color: #ff6b35;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          color: #ccc;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 0.75rem;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 6px;
          color: #fff;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #ff6b35;
          box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .recent-notes-section {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h3 {
          color: #ff6b35;
          margin: 0;
          font-size: 1.2rem;
        }

        .refresh-btn-small {
          padding: 0.5rem 1rem;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.3);
          border-radius: 6px;
          color: #ff6b35;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .refresh-btn-small:hover {
          background: rgba(255, 107, 53, 0.2);
          border-color: #ff6b35;
        }

        .loading-notes {
          text-align: center;
          padding: 2rem;
          color: #888;
        }

        .loading-spinner-small {
          width: 24px;
          height: 24px;
          border: 2px solid #333;
          border-top: 2px solid #ff6b35;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .notes-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .note-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 107, 53, 0.05);
          border: 1px solid rgba(255, 107, 53, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .note-item:hover {
          background: rgba(255, 107, 53, 0.1);
          border-color: rgba(255, 107, 53, 0.2);
        }

        .note-info {
          flex: 1;
        }

        .note-title {
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .note-details {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
        }

        .note-subject {
          color: #ff6b35;
          font-weight: 500;
        }

        .note-status {
          color: #888;
        }

        .note-date {
          color: #666;
        }

        .note-actions-small {
          display: flex;
          gap: 0.5rem;
        }

        .view-btn-small,
        .download-btn-small {
          padding: 0.5rem;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.2);
          border-radius: 4px;
          color: #ff6b35;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .view-btn-small:hover,
        .download-btn-small:hover {
          background: rgba(255, 107, 53, 0.2);
          border-color: #ff6b35;
        }

        .no-notes {
          text-align: center;
          padding: 3rem;
          color: #888;
        }

        .no-notes-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .no-notes p {
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .no-notes small {
          color: #666;
        }

        .upload-tips {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 2rem;
        }

        .upload-tips h3 {
          color: #ff6b35;
          text-align: center;
          margin-bottom: 2rem;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .tip-item {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 107, 53, 0.05);
          border: 1px solid rgba(255, 107, 53, 0.1);
          border-radius: 8px;
        }

        .tip-icon {
          font-size: 2rem;
          color: #ff6b35;
        }

        .tip-content h4 {
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .tip-content p {
          color: #888;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .upload-stats {
            flex-direction: column;
            align-items: center;
          }
          
          .upload-area {
            padding: 2rem 1rem;
          }
          
          .upload-actions {
            flex-direction: column;
          }
          
          .result-actions {
            flex-direction: column;
          }
          
          .tips-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Upload;
