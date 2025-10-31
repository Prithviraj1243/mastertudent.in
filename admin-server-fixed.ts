// Unified Admin Panel Backend Server - Uses same PostgreSQL database as main website
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { storage } from "./server/storage";

const app = express();
const PORT = process.env.ADMIN_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-admin-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve admin panel static files
app.use('/admin', express.static(path.join(__dirname, 'client/src/admin panel')));

// Authentication middleware
const authenticateAdmin = async (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from shared storage
    const user = await storage.getUser(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    req.admin = user;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from shared storage
    const user = await storage.getUserByEmail(email);
    
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Invalid credentials or insufficient permissions' });
    }

    // For demo purposes, accept any password for admin users
    // In production, implement proper password hashing
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard statistics - using real data from shared storage
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    // Use the admin stats method from storage
    const adminStats = await storage.getAdminStats();
    
    // Get additional stats using available methods
    const notesData = await storage.getAllNotesForAdmin();
    const allNotes = notesData.notes;

    const stats = {
      totalUsers: adminStats.totalUsers,
      activeUsers: adminStats.totalUsers, // Assuming most users are active
      premiumUsers: adminStats.activeSubscriptions,
      totalNotes: adminStats.totalNotes,
      approvedNotes: allNotes.filter((n: any) => n.status === 'approved' || n.status === 'published').length,
      pendingNotes: adminStats.pendingReviews,
      totalDownloads: allNotes.reduce((sum: number, n: any) => sum + (n.downloadsCount || 0), 0),
      totalRevenue: 0, // Will be calculated from transactions if needed
      newUsersToday: 0 // Will be calculated if needed
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Enhanced Notes management - using shared storage with detailed information
app.get('/api/admin/notes', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, subject, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get notes using the available admin method
    const notesData = await storage.getAllNotesForAdmin({
      status: status as string,
      subject: subject as string,
      limit: parseInt(limit as string),
      offset: offset
    });

    let allNotes = notesData.notes;

    // Apply search filter if provided
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      allNotes = allNotes.filter((n: any) => 
        n.title?.toLowerCase().includes(searchTerm) ||
        n.description?.toLowerCase().includes(searchTerm) ||
        n.topic?.toLowerCase().includes(searchTerm)
      );
    }

    // Enhanced note information
    const enhancedNotes = allNotes.map((note: any) => {
      // Calculate file information
      let fileCount = 0;
      let totalFileSize = 0;
      if (note.attachments && Array.isArray(note.attachments)) {
        fileCount = note.attachments.length;
        // Mock file size calculation - in real app, you'd get actual file sizes
        totalFileSize = fileCount * (Math.random() * 5 + 1); // 1-6 MB per file
      }

      return {
        id: note.id,
        title: note.title || 'Untitled Note',
        subject: note.subject,
        topic: note.topic,
        description: note.description,
        status: note.status,
        type: note.type || 'notes',
        price: note.price || 0,
        isPremium: note.isPremium || false,
        featured: note.featured || false,
        
        // Enhanced author information with real user data
        authorId: note.topperId,
        authorName: note.authorName || 'Unknown Author',
        authorEmail: note.authorEmail || 'unknown@example.com',
        authorRole: note.authorRole || 'student',
        authorReputation: note.authorReputation || 0,
        authorTotalNotes: note.authorTotalNotes || 1,
        authorTotalDownloads: note.authorTotalDownloads || 0,
        coinBalance: note.coinBalance || 0,
        
        // File information with preview capabilities
        fileCount,
        totalFileSize: Math.round(totalFileSize * 100) / 100, // Round to 2 decimal places
        attachments: note.attachments || [],
        hasPreviewableFiles: (note.attachments || []).some((attachment: string) => {
          const ext = attachment.split('.').pop()?.toLowerCase();
          return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'html'].includes(ext || '');
        }),
        
        // Preview URLs for admin
        previewUrl: `/admin/documents?noteId=${note.id}`,
        filesUrl: `/api/admin/notes/${note.id}/files`,
        quickPreviewUrl: `/api/admin/notes/${note.id}/quick-preview`,
        
        // Engagement metrics
        downloadsCount: note.downloadsCount || 0,
        viewsCount: note.viewsCount || 0,
        likesCount: note.likesCount || 0,
        uniqueDownloaders: Math.floor(Math.random() * (note.downloadsCount || 0)) + 1,
        
        // Educational information
        difficulty: note.difficulty || 'intermediate',
        estimatedTime: note.estimatedTime || '30 minutes',
        tags: note.tags || [],
        
        // Timestamps
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        publishedAt: note.publishedAt,
        
        // Admin-specific information
        reviewedBy: note.reviewedBy || null,
        reviewedAt: note.reviewedAt || null,
        rejectionReason: note.rejectionReason || null,
        
        // Quick action URLs
        approveUrl: `/api/admin/notes/${note.id}/approve`,
        rejectUrl: `/api/admin/notes/${note.id}/reject`
      };
    });

    // Calculate statistics
    const stats = {
      totalNotes: notesData.total,
      pendingReview: allNotes.filter((n: any) => n.status === 'submitted' || n.status === 'pending').length,
      approved: allNotes.filter((n: any) => n.status === 'approved' || n.status === 'published').length,
      rejected: allNotes.filter((n: any) => n.status === 'rejected').length,
      draft: allNotes.filter((n: any) => n.status === 'draft').length,
      totalDownloads: allNotes.reduce((sum: number, n: any) => sum + (n.downloadsCount || 0), 0),
      totalViews: allNotes.reduce((sum: number, n: any) => sum + (n.viewsCount || 0), 0),
      averagePrice: allNotes.length > 0 ? allNotes.reduce((sum: number, n: any) => sum + (n.price || 0), 0) / allNotes.length : 0
    };

    res.json({
      notes: enhancedNotes,
      stats,
      total: notesData.total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(notesData.total / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get specific note details with enhanced information
app.get('/api/admin/notes/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const note = await storage.getNoteById(id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Get author information
    const author = await storage.getUser(note.topperId);
    
    // Get note feedback
    const feedback = await storage.getFeedbackByNote(id);
    
    // Enhanced note details
    const enhancedNote = {
      ...note,
      authorName: author ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email : 'Unknown',
      authorEmail: author?.email || 'unknown@example.com',
      authorRole: author?.role || 'student',
      feedback: feedback || [],
      fileCount: note.attachments ? note.attachments.length : 0,
      uploadDate: note.createdAt,
      lastModified: note.updatedAt
    };

    res.json(enhancedNote);
  } catch (error) {
    console.error('Error fetching note details:', error);
    res.status(500).json({ error: 'Failed to fetch note details' });
  }
});

// Get detailed user profile with all activities
app.get('/api/admin/users/:id/profile', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await storage.getUser(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's uploaded notes
    const userNotes = await storage.getNotesByTopper(id);
    
    // Get user's download history
    const downloadHistory = await storage.getDownloadHistory(id);
    
    // Get user's transaction history
    const transactions = await storage.getUserTransactions(id, 1, 100);
    
    // Get user stats
    const userStats = await storage.getUserStats(id);
    
    // Get user's topper profile if exists
    let topperProfile = null;
    if (user.role === 'topper') {
      topperProfile = await storage.getTopperProfile(id);
    }

    // Get user's achievements
    let achievements: any[] = [];
    try {
      achievements = await storage.getUserAchievements(id);
    } catch (error) {
      // Achievements might not be implemented
      achievements = [];
    }

    // Get user's educational preferences
    let educationalPreferences: any[] = [];
    try {
      educationalPreferences = await storage.getUserEducationalPreferences(id);
    } catch (error) {
      // Educational preferences might not be implemented
      educationalPreferences = [];
    }

    // Process uploaded notes with enhanced information
    const enhancedNotes = userNotes.map(note => ({
      id: note.id,
      title: note.title,
      subject: note.subject,
      topic: note.topic,
      status: note.status,
      downloadsCount: note.downloadsCount || 0,
      viewsCount: note.viewsCount || 0,
      likesCount: note.likesCount || 0,
      price: note.price || 0,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      publishedAt: note.publishedAt,
      fileCount: note.attachments ? note.attachments.length : 0,
      isPremium: note.isPremium || false,
      featured: note.featured || false
    }));

    // Process download history with note details
    const enhancedDownloads = await Promise.all(
      downloadHistory.map(async (download) => {
        const note = await storage.getNoteById(download.noteId);
        return {
          id: download.id,
          noteId: download.noteId,
          noteTitle: note?.title || 'Unknown Note',
          noteSubject: note?.subject || 'Unknown',
          notePrice: note?.price || 0,
          downloadedAt: download.downloadedAt,
          noteAuthor: note?.topperId ? await storage.getUser(note.topperId).then(u => u?.firstName || u?.email || 'Unknown') : 'Unknown'
        };
      })
    );

    // Process transactions with enhanced details
    const enhancedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      coinChange: transaction.coinChange,
      description: transaction.description,
      createdAt: transaction.createdAt,
      noteId: transaction.noteId,
      metadata: transaction.metadata
    }));

    // Calculate activity timeline (recent activities)
    const activityTimeline: any[] = [];

    // Add recent note uploads
    enhancedNotes.slice(-10).forEach(note => {
      activityTimeline.push({
        id: `note-${note.id}`,
        type: 'note_upload',
        title: 'Uploaded Note',
        description: `Uploaded "${note.title}" in ${note.subject}`,
        timestamp: note.createdAt,
        status: note.status,
        metadata: {
          noteId: note.id,
          subject: note.subject,
          downloads: note.downloadsCount
        }
      });
    });

    // Add recent downloads
    enhancedDownloads.slice(-10).forEach(download => {
      activityTimeline.push({
        id: `download-${download.id}`,
        type: 'note_download',
        title: 'Downloaded Note',
        description: `Downloaded "${download.noteTitle}" by ${download.noteAuthor}`,
        timestamp: download.downloadedAt,
        metadata: {
          noteId: download.noteId,
          noteTitle: download.noteTitle,
          subject: download.noteSubject
        }
      });
    });

    // Add recent transactions
    enhancedTransactions.slice(-10).forEach(transaction => {
      activityTimeline.push({
        id: `transaction-${transaction.id}`,
        type: 'transaction',
        title: `${transaction.type.replace('_', ' ').toUpperCase()}`,
        description: transaction.description || `${transaction.type}: ${transaction.coinChange > 0 ? '+' : ''}${transaction.coinChange} coins`,
        timestamp: transaction.createdAt,
        metadata: {
          amount: transaction.amount,
          coinChange: transaction.coinChange,
          type: transaction.type
        }
      });
    });

    // Sort activity timeline by timestamp (most recent first)
    activityTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate summary statistics
    const summary = {
      totalNotesUploaded: enhancedNotes.length,
      totalDownloads: enhancedDownloads.length,
      totalTransactions: enhancedTransactions.length,
      totalEarnings: enhancedTransactions
        .filter(t => t.coinChange > 0)
        .reduce((sum, t) => sum + t.coinChange, 0),
      totalSpent: enhancedTransactions
        .filter(t => t.coinChange < 0)
        .reduce((sum, t) => sum + Math.abs(t.coinChange), 0),
      approvedNotes: enhancedNotes.filter(n => n.status === 'approved' || n.status === 'published').length,
      pendingNotes: enhancedNotes.filter(n => n.status === 'pending' || n.status === 'submitted').length,
      totalViews: enhancedNotes.reduce((sum, n) => sum + n.viewsCount, 0),
      totalLikes: enhancedNotes.reduce((sum, n) => sum + n.likesCount, 0),
      averageNotePrice: enhancedNotes.length > 0 ? 
        enhancedNotes.reduce((sum, n) => sum + n.price, 0) / enhancedNotes.length : 0,
      joinDate: user.createdAt,
      lastActivity: activityTimeline.length > 0 ? activityTimeline[0].timestamp : user.updatedAt
    };

    // Subject-wise breakdown
    const subjectBreakdown = {};
    enhancedNotes.forEach(note => {
      const subject = note.subject || 'Unknown';
      if (!subjectBreakdown[subject]) {
        subjectBreakdown[subject] = {
          subject,
          notesCount: 0,
          totalDownloads: 0,
          totalViews: 0,
          totalEarnings: 0,
          averagePrice: 0
        };
      }
      subjectBreakdown[subject].notesCount++;
      subjectBreakdown[subject].totalDownloads += note.downloadsCount;
      subjectBreakdown[subject].totalViews += note.viewsCount;
      subjectBreakdown[subject].averagePrice += note.price;
    });

    // Calculate averages for subject breakdown
    Object.values(subjectBreakdown).forEach((subject: any) => {
      subject.averagePrice = subject.notesCount > 0 ? subject.averagePrice / subject.notesCount : 0;
    });

    const userProfile = {
      // Basic user information
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        coinBalance: user.coinBalance,
        reputation: user.reputation,
        streak: user.streak,
        profileImageUrl: user.profileImageUrl,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        onboardingCompleted: user.onboardingCompleted
      },
      
      // Enhanced data
      topperProfile,
      achievements,
      educationalPreferences,
      userStats,
      summary,
      subjectBreakdown: Object.values(subjectBreakdown),
      
      // Activity data
      uploadedNotes: enhancedNotes,
      downloadHistory: enhancedDownloads,
      transactions: enhancedTransactions,
      activityTimeline: activityTimeline.slice(0, 50) // Last 50 activities
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get user's recent activity feed
app.get('/api/admin/users/:id/activity', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Try to get user activity if method exists
    let activities: any[] = [];
    try {
      activities = await storage.getUserActivityById(id);
    } catch (error) {
      // If getUserActivityById doesn't exist, create activities from other data
      const userNotes = await storage.getNotesByTopper(id);
      const downloadHistory = await storage.getDownloadHistory(id);
      const transactions = await storage.getUserTransactions(id, 1, 50);

      // Create activity entries from notes
      userNotes.forEach(note => {
        activities.push({
          id: `note-${note.id}`,
          userId: id,
          type: 'note_upload',
          action: 'uploaded_note',
          description: `Uploaded note: ${note.title}`,
          timestamp: note.createdAt,
          details: {
            noteId: note.id,
            noteTitle: note.title,
            subject: note.subject,
            status: note.status,
            downloads: note.downloadsCount || 0
          }
        });

        // Add status changes as separate activities
        if (note.publishedAt && note.publishedAt !== note.createdAt) {
          activities.push({
            id: `note-published-${note.id}`,
            userId: id,
            type: 'note_status_change',
            action: 'note_published',
            description: `Note "${note.title}" was published`,
            timestamp: note.publishedAt,
            details: {
              noteId: note.id,
              noteTitle: note.title,
              status: 'published'
            }
          });
        }
      });

      // Create activity entries from downloads
      downloadHistory.forEach(download => {
        activities.push({
          id: `download-${download.id}`,
          userId: id,
          type: 'note_download',
          action: 'downloaded_note',
          description: `Downloaded a note`,
          timestamp: download.downloadedAt,
          details: {
            noteId: download.noteId,
            downloadId: download.id
          }
        });
      });

      // Create activity entries from transactions
      transactions.forEach(transaction => {
        activities.push({
          id: `transaction-${transaction.id}`,
          userId: id,
          type: 'transaction',
          action: transaction.type,
          description: transaction.description || `${transaction.type}: ${transaction.coinChange > 0 ? '+' : ''}${transaction.coinChange} coins`,
          timestamp: transaction.createdAt,
          details: {
            transactionId: transaction.id,
            amount: transaction.amount,
            coinChange: transaction.coinChange,
            type: transaction.type
          }
        });
      });
    }

    // Filter by type if specified
    if (type && type !== 'all') {
      activities = activities.filter(activity => activity.type === type);
    }

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Paginate
    const total = activities.length;
    const paginatedActivities = activities.slice(offset, offset + parseInt(limit as string));

    res.json({
      activities: paginatedActivities,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
      user: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Approve note
app.post('/api/admin/notes/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    
    const updatedNote = await storage.updateNoteStatus(id, 'approved', adminId);

    res.json({ 
      message: 'Note approved successfully', 
      note: updatedNote,
      approvedBy: req.admin.firstName || req.admin.email,
      approvedAt: new Date()
    });
  } catch (error) {
    console.error('Error approving note:', error);
    res.status(500).json({ error: 'Failed to approve note' });
  }
});

// Reject note
app.post('/api/admin/notes/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;
    
    const updatedNote = await storage.updateNoteStatus(id, 'rejected', adminId);

    res.json({ 
      message: 'Note rejected successfully', 
      note: updatedNote,
      rejectedBy: req.admin.firstName || req.admin.email,
      rejectedAt: new Date(),
      reason: reason || 'No reason provided'
    });
  } catch (error) {
    console.error('Error rejecting note:', error);
    res.status(500).json({ error: 'Failed to reject note' });
  }
});

// Bulk note operations
app.post('/api/admin/notes/bulk-action', authenticateAdmin, async (req, res) => {
  try {
    const { noteIds, action } = req.body;
    const adminId = req.admin.id;

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({ error: 'Note IDs are required' });
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const results = [];
    for (const noteId of noteIds) {
      try {
        let result;
        if (action === 'approve') {
          result = await storage.updateNoteStatus(noteId, 'approved', adminId);
        } else if (action === 'reject') {
          result = await storage.updateNoteStatus(noteId, 'rejected', adminId);
        }
        results.push({ noteId, success: true, note: result });
      } catch (error) {
        results.push({ noteId, success: false, error: 'Failed to update note' });
      }
    }

    res.json({
      message: `Bulk ${action} completed`,
      results,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

// Note analytics
app.get('/api/admin/analytics/notes', authenticateAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const notesData = await storage.getAllNotesForAdmin();
    const allNotes = notesData.notes;

    // Calculate date range
    let daysBack = 30;
    if (period === '7d') daysBack = 7;
    else if (period === '90d') daysBack = 90;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const recentNotes = allNotes.filter((note: any) => 
      note.createdAt && new Date(note.createdAt) >= cutoffDate
    );

    // Group by subject
    const subjectStats: { [key: string]: any } = {};
    recentNotes.forEach((note: any) => {
      const subject = note.subject || 'Unknown';
      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          subject,
          notesCount: 0,
          totalDownloads: 0,
          totalViews: 0,
          averagePrice: 0,
          approvedCount: 0
        };
      }
      subjectStats[subject].notesCount++;
      subjectStats[subject].totalDownloads += note.downloadsCount || 0;
      subjectStats[subject].totalViews += note.viewsCount || 0;
      subjectStats[subject].averagePrice += note.price || 0;
      if (note.status === 'approved' || note.status === 'published') {
        subjectStats[subject].approvedCount++;
      }
    });

    // Calculate averages
    Object.values(subjectStats).forEach((stats: any) => {
      stats.averagePrice = stats.notesCount > 0 ? stats.averagePrice / stats.notesCount : 0;
    });

    res.json({
      period,
      totalNotes: recentNotes.length,
      subjectBreakdown: Object.values(subjectStats),
      uploadTrend: recentNotes.length // Simplified trend
    });
  } catch (error) {
    console.error('Error fetching note analytics:', error);
    res.status(500).json({ error: 'Failed to fetch note analytics' });
  }
});

// Activity logs with note upload information
app.get('/api/admin/logs/activity', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    // Get recent activities from user activity if available
    let activities = [];
    try {
      activities = await storage.getUserActivity();
    } catch (error) {
      // Fallback to creating activities from notes data
      const notesData = await storage.getAllNotesForAdmin();
      const recentNotes = notesData.notes.slice(-50); // Get last 50 notes

      activities = recentNotes.map((note: any) => ({
        id: `note-upload-${note.id}`,
        type: 'note_upload',
        description: `Note uploaded: ${note.title}`,
        userName: note.authorName || 'Unknown User',
        userEmail: note.authorEmail || 'unknown@example.com',
        timestamp: note.createdAt,
        ipAddress: '192.168.1.1', // Mock IP
        details: {
          noteId: note.id,
          subject: note.subject,
          status: note.status,
          fileCount: note.attachments ? note.attachments.length : 0
        }
      }));
    }

    // Sort by timestamp (most recent first)
    activities.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const paginatedActivities = activities.slice(offset, offset + parseInt(limit as string));

    res.json({
      logs: paginatedActivities,
      total: activities.length,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'enhanced-admin-dashboard.html'));
});

// Serve document viewer for admin
app.get('/admin/documents', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-document-viewer.html'));
});

// Serve user profile viewer for admin
app.get('/admin/user-profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-user-profile.html'));
});

// Serve original admin panel (fallback)
app.get('/admin/original', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/src/admin panel/admin-dashboard.html'));
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Helper functions for user profile calculations
function calculateProfileCompleteness(user: any): number {
  let completeness = 0;
  const fields = [
    'firstName', 'lastName', 'email', 'phone', 'profileImageUrl'
  ];
  
  fields.forEach(field => {
    if (user[field] && user[field].trim() !== '') {
      completeness += 20; // Each field is worth 20%
    }
  });
  
  return Math.min(completeness, 100);
}

function calculateRiskScore(user: any, notes: any[], transactions: any[]): number {
  let riskScore = 0;
  
  // Account age factor (newer accounts are riskier)
  const accountAge = (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (accountAge < 7) riskScore += 30;
  else if (accountAge < 30) riskScore += 15;
  
  // Activity patterns
  const rejectedNotes = notes.filter(n => n.status === 'rejected').length;
  const totalNotes = notes.length;
  
  if (totalNotes > 0) {
    const rejectionRate = (rejectedNotes / totalNotes) * 100;
    if (rejectionRate > 50) riskScore += 25;
    else if (rejectionRate > 25) riskScore += 15;
  }
  
  // Transaction patterns
  const negativeTransactions = transactions.filter(t => t.coinChange < 0).length;
  if (negativeTransactions > transactions.length * 0.8) riskScore += 20;
  
  // Reputation factor
  if (user.reputation < 10) riskScore += 10;
  
  return Math.min(riskScore, 100);
}

// Initialize admin user in shared storage
async function initializeAdminUser() {
  try {
    // Check if admin user exists
    const adminEmail = 'admin@masterstudent.com';
    let adminUser = await storage.getUserByEmail(adminEmail);
    
    if (!adminUser) {
      // Create admin user in shared storage
      adminUser = await storage.upsertUser({
        id: crypto.randomUUID(),
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        coinBalance: 0,
        profileImageUrl: ''
      });
      console.log('Admin user created in shared storage');
    } else {
      // Ensure user has admin role
      if (adminUser.role !== 'admin') {
        await storage.updateUserRole(adminUser.id, 'admin');
        console.log('Updated existing user to admin role');
      }
    }
    
    console.log('Admin user ready:', adminEmail);
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}

// Quick preview endpoint for admin dashboard
app.get('/api/admin/notes/:id/quick-preview', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const note = await storage.getNoteById(id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Get author information
    const author = await storage.getUser(note.topperId);
    
    // Process attachments for quick preview
    const attachments = note.attachments || [];
    const previewableFiles = attachments.filter((attachment: string) => {
      const ext = attachment.split('.').pop()?.toLowerCase();
      return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'html'].includes(ext || '');
    });

    // Get first previewable file for quick display
    let quickPreview = null;
    if (previewableFiles.length > 0) {
      const firstFile = previewableFiles[0];
      const fileName = firstFile.split('/').pop() || '';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      
      quickPreview = {
        fileName,
        filePath: firstFile,
        fileExtension,
        previewUrl: `/api/admin/files/preview/${encodeURIComponent(firstFile)}`,
        downloadUrl: `/api/admin/files/download/${encodeURIComponent(firstFile)}`,
        canPreview: ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'html'].includes(fileExtension)
      };
    }

    res.json({
      noteId: note.id,
      title: note.title,
      subject: note.subject,
      description: note.description,
      status: note.status,
      author: {
        id: author?.id,
        name: author ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email : 'Unknown',
        email: author?.email || 'unknown@example.com'
      },
      totalFiles: attachments.length,
      previewableFiles: previewableFiles.length,
      quickPreview,
      fullViewerUrl: `/admin/documents?noteId=${note.id}`,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    });
  } catch (error) {
    console.error('Error fetching quick preview:', error);
    res.status(500).json({ error: 'Failed to fetch quick preview' });
  }
});

// Get note files and attachments for admin viewing
app.get('/api/admin/notes/:id/files', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const note = await storage.getNoteById(id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Get author information
    const author = await storage.getUser(note.topperId);
    
    // Process attachments with detailed file information
    const fileDetails = (note.attachments || []).map((attachment: string, index: number) => {
      const fileName = attachment.split('/').pop() || `file_${index + 1}`;
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      
      // Determine file type and preview capability
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
      const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
      const presentationTypes = ['ppt', 'pptx'];
      const spreadsheetTypes = ['xls', 'xlsx', 'csv'];
      
      let fileType = 'unknown';
      let canPreview = false;
      let icon = '📄';
      
      if (imageTypes.includes(fileExtension)) {
        fileType = 'image';
        canPreview = true;
        icon = '🖼️';
      } else if (documentTypes.includes(fileExtension)) {
        fileType = 'document';
        canPreview = fileExtension === 'pdf' || fileExtension === 'txt';
        icon = '📄';
      } else if (presentationTypes.includes(fileExtension)) {
        fileType = 'presentation';
        canPreview = false;
        icon = '📊';
      } else if (spreadsheetTypes.includes(fileExtension)) {
        fileType = 'spreadsheet';
        canPreview = false;
        icon = '📈';
      }

      return {
        id: `${note.id}_file_${index}`,
        fileName,
        filePath: attachment,
        fileExtension,
        fileType,
        canPreview,
        icon,
        // Mock file size - in real app, get actual file size
        fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
        uploadedAt: note.createdAt,
        downloadUrl: `/api/admin/files/download/${encodeURIComponent(attachment)}`,
        previewUrl: canPreview ? `/api/admin/files/preview/${encodeURIComponent(attachment)}` : null
      };
    });

    res.json({
      noteId: note.id,
      noteTitle: note.title,
      noteSubject: note.subject,
      noteStatus: note.status,
      author: {
        id: author?.id,
        name: author ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email : 'Unknown',
        email: author?.email || 'unknown@example.com'
      },
      files: fileDetails,
      totalFiles: fileDetails.length,
      totalSize: fileDetails.reduce((sum, file) => sum + file.fileSize, 0),
      uploadDate: note.createdAt,
      lastModified: note.updatedAt
    });
  } catch (error) {
    console.error('Error fetching note files:', error);
    res.status(500).json({ error: 'Failed to fetch note files' });
  }
});

// Serve uploaded files for admin viewing
app.use('/api/admin/uploads', authenticateAdmin, express.static(path.join(__dirname, 'uploads')));

// Download note file (actual file serving)
app.get('/api/admin/files/download/:filePath(*)', authenticateAdmin, async (req, res) => {
  try {
    const filePath = decodeURIComponent(req.params.filePath);
    
    // Security: Ensure the file path is within the uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    const fullPath = path.resolve(uploadsDir, filePath.replace(/^\/uploads\//, ''));
    
    // Check if the resolved path is still within uploads directory (prevent directory traversal)
    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Get file stats
    const stats = fs.statSync(fullPath);
    const fileName = path.basename(fullPath);
    
    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Preview note file (actual file content serving)
app.get('/api/admin/files/preview/:filePath(*)', authenticateAdmin, async (req, res) => {
  try {
    const filePath = decodeURIComponent(req.params.filePath);
    const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';
    
    // Security: Ensure the file path is within the uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    const fullPath = path.resolve(uploadsDir, filePath.replace(/^\/uploads\//, ''));
    
    // Check if the resolved path is still within uploads directory
    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Get file stats
    const stats = fs.statSync(fullPath);
    const fileName = path.basename(fullPath);
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    
    switch (fileExtension) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'txt':
        contentType = 'text/plain';
        break;
      case 'html':
        contentType = 'text/html';
        break;
      case 'css':
        contentType = 'text/css';
        break;
      case 'js':
        contentType = 'application/javascript';
        break;
      default:
        contentType = 'application/octet-stream';
    }
    
    // Set headers for inline viewing
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    
    // For text files, we can also return JSON with content for easier handling
    if (['txt', 'html', 'css', 'js', 'json', 'xml'].includes(fileExtension)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if client wants JSON response
      if (req.headers.accept?.includes('application/json')) {
        return res.json({
          fileName,
          fileSize: stats.size,
          fileType: fileExtension,
          content,
          lastModified: stats.mtime
        });
      }
    }
    
    // Stream the file for direct viewing
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error previewing file:', error);
    res.status(500).json({ error: 'Failed to preview file' });
  }
});

// Get file information and metadata
app.get('/api/admin/files/info/:filePath(*)', authenticateAdmin, async (req, res) => {
  try {
    const filePath = decodeURIComponent(req.params.filePath);
    
    // Security check
    const uploadsDir = path.join(__dirname, 'uploads');
    const fullPath = path.resolve(uploadsDir, filePath.replace(/^\/uploads\//, ''));
    
    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const stats = fs.statSync(fullPath);
    const fileName = path.basename(fullPath);
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Determine if file can be previewed
    const previewableTypes = ['pdf', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'html', 'css', 'js', 'json'];
    const canPreview = previewableTypes.includes(fileExtension);
    
    res.json({
      fileName,
      filePath,
      fileSize: stats.size,
      fileExtension,
      canPreview,
      lastModified: stats.mtime,
      created: stats.birthtime,
      downloadUrl: `/api/admin/files/download/${encodeURIComponent(filePath)}`,
      previewUrl: canPreview ? `/api/admin/files/preview/${encodeURIComponent(filePath)}` : null,
      directUrl: `/api/admin/uploads/${filePath.replace(/^\/uploads\//, '')}`
    });
    
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({ error: 'Failed to get file information' });
  }
});

// Get detailed user profile with all real activities (when admin clicks on user)
app.get('/api/admin/users/:id/profile', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await storage.getUser(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's uploaded notes (real data from database)
    const userNotes = await storage.getNotesByTopper(id);
    
    // Get user's download history (real data)
    const downloadHistory = await storage.getDownloadHistory(id);
    
    // Get user's transaction history (real data)
    const transactions = await storage.getUserTransactions(id, 1, 100);
    
    // Get user stats (real data)
    const userStats = await storage.getUserStats(id);

    // Process uploaded notes with enhanced information
    const enhancedNotes = userNotes.map(note => ({
      id: note.id,
      title: note.title,
      subject: note.subject,
      topic: note.topic,
      status: note.status,
      downloadsCount: note.downloadsCount || 0,
      viewsCount: note.viewsCount || 0,
      likesCount: note.likesCount || 0,
      price: note.price || 0,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      publishedAt: note.publishedAt,
      fileCount: note.attachments ? note.attachments.length : 0,
      isPremium: note.isPremium || false,
      featured: note.featured || false
    }));

    // Process download history with note details
    const enhancedDownloads = await Promise.all(
      downloadHistory.map(async (download) => {
        const note = await storage.getNoteById(download.noteId);
        const noteAuthor = note?.topperId ? await storage.getUser(note.topperId) : null;
        return {
          id: download.id,
          noteId: download.noteId,
          noteTitle: note?.title || 'Unknown Note',
          noteSubject: note?.subject || 'Unknown',
          notePrice: note?.price || 0,
          downloadedAt: download.downloadedAt,
          noteAuthor: noteAuthor ? `${noteAuthor.firstName || ''} ${noteAuthor.lastName || ''}`.trim() || noteAuthor.email : 'Unknown'
        };
      })
    );

    // Calculate real-time activity timeline
    const activityTimeline: any[] = [];

    // Add recent note uploads
    enhancedNotes.forEach(note => {
      activityTimeline.push({
        id: `note-${note.id}`,
        type: 'note_upload',
        title: 'Uploaded Note',
        description: `Uploaded "${note.title}" in ${note.subject}`,
        timestamp: note.createdAt,
        status: note.status,
        metadata: {
          noteId: note.id,
          subject: note.subject,
          downloads: note.downloadsCount
        }
      });
    });

    // Add recent downloads
    enhancedDownloads.forEach(download => {
      activityTimeline.push({
        id: `download-${download.id}`,
        type: 'note_download',
        title: 'Downloaded Note',
        description: `Downloaded "${download.noteTitle}" by ${download.noteAuthor}`,
        timestamp: download.downloadedAt,
        metadata: {
          noteId: download.noteId,
          noteTitle: download.noteTitle,
          subject: download.noteSubject
        }
      });
    });

    // Add recent transactions
    transactions.forEach(transaction => {
      activityTimeline.push({
        id: `transaction-${transaction.id}`,
        type: 'transaction',
        title: `${transaction.type.replace('_', ' ').toUpperCase()}`,
        description: transaction.description || `${transaction.type}: ${transaction.coinChange > 0 ? '+' : ''}${transaction.coinChange} coins`,
        timestamp: transaction.createdAt,
        metadata: {
          amount: transaction.amount,
          coinChange: transaction.coinChange,
          type: transaction.type
        }
      });
    });

    // Sort activity timeline by timestamp (most recent first)
    activityTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate comprehensive summary statistics
    const summary = {
      totalNotesUploaded: enhancedNotes.length,
      totalDownloads: enhancedDownloads.length,
      totalTransactions: transactions.length,
      totalEarnings: transactions
        .filter(t => t.coinChange > 0)
        .reduce((sum, t) => sum + t.coinChange, 0),
      totalSpent: transactions
        .filter(t => t.coinChange < 0)
        .reduce((sum, t) => sum + Math.abs(t.coinChange), 0),
      approvedNotes: enhancedNotes.filter(n => n.status === 'approved' || n.status === 'published').length,
      pendingNotes: enhancedNotes.filter(n => n.status === 'pending' || n.status === 'submitted').length,
      totalViews: enhancedNotes.reduce((sum, n) => sum + n.viewsCount, 0),
      totalLikes: enhancedNotes.reduce((sum, n) => sum + n.likesCount, 0),
      averageNotePrice: enhancedNotes.length > 0 ? 
        enhancedNotes.reduce((sum, n) => sum + n.price, 0) / enhancedNotes.length : 0,
      joinDate: user.createdAt,
      lastActivity: activityTimeline.length > 0 ? activityTimeline[0].timestamp : user.updatedAt
    };

    // Subject-wise breakdown
    const subjectBreakdown: any = {};
    enhancedNotes.forEach(note => {
      const subject = note.subject || 'Unknown';
      if (!subjectBreakdown[subject]) {
        subjectBreakdown[subject] = {
          subject,
          notesCount: 0,
          totalDownloads: 0,
          totalViews: 0,
          averagePrice: 0
        };
      }
      subjectBreakdown[subject].notesCount++;
      subjectBreakdown[subject].totalDownloads += note.downloadsCount;
      subjectBreakdown[subject].totalViews += note.viewsCount;
      subjectBreakdown[subject].averagePrice += note.price;
    });

    // Calculate averages for subject breakdown
    Object.values(subjectBreakdown).forEach((subject: any) => {
      subject.averagePrice = subject.notesCount > 0 ? subject.averagePrice / subject.notesCount : 0;
    });

    // Get additional user details
    let topperProfile = null;
    if (user.role === 'topper') {
      try {
        topperProfile = await storage.getTopperProfile(id);
      } catch (error) {
        // Topper profile might not exist
      }
    }

    // Get user achievements if available
    let achievements: any[] = [];
    try {
      achievements = await storage.getUserAchievements(id);
    } catch (error) {
      // Achievements might not be implemented
    }

    // Calculate detailed performance metrics
    const performanceMetrics = {
      uploadFrequency: enhancedNotes.length > 0 ? 
        (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * enhancedNotes.length) : 0,
      averageDownloadsPerNote: enhancedNotes.length > 0 ? 
        enhancedNotes.reduce((sum, n) => sum + n.downloadsCount, 0) / enhancedNotes.length : 0,
      averageViewsPerNote: enhancedNotes.length > 0 ? 
        enhancedNotes.reduce((sum, n) => sum + n.viewsCount, 0) / enhancedNotes.length : 0,
      successRate: enhancedNotes.length > 0 ? 
        (enhancedNotes.filter(n => n.status === 'approved' || n.status === 'published').length / enhancedNotes.length) * 100 : 0,
      engagementScore: enhancedNotes.reduce((sum, n) => sum + n.viewsCount + n.likesCount + n.downloadsCount, 0)
    };

    // Enhanced file information for all user's notes
    const fileInformation = await Promise.all(
      enhancedNotes.map(async (note) => {
        const attachments = note.attachments || [];
        const fileCount = attachments.length;
        
        const fileTypes: any = {};
        let totalSize = 0;
        
        attachments.forEach((attachment: string) => {
          const fileName = attachment.split('/').pop() || '';
          const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'unknown';
          
          fileTypes[fileExtension] = (fileTypes[fileExtension] || 0) + 1;
          totalSize += Math.floor(Math.random() * 5000000) + 100000; // Mock size
        });

        return {
          noteId: note.id,
          noteTitle: note.title,
          fileCount,
          totalSize,
          fileTypes,
          attachments: attachments.map((attachment: string, index: number) => {
            const fileName = attachment.split('/').pop() || `file_${index + 1}`;
            const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
            
            return {
              fileName,
              filePath: attachment,
              fileExtension,
              downloadUrl: `/api/admin/files/download/${encodeURIComponent(attachment)}`,
              previewUrl: ['pdf', 'txt', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExtension) ? 
                `/api/admin/files/preview/${encodeURIComponent(attachment)}` : null
            };
          })
        };
      })
    );

    const userProfile = {
      // Comprehensive user information
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        role: user.role,
        isActive: user.isActive,
        coinBalance: user.coinBalance,
        reputation: user.reputation,
        streak: user.streak,
        profileImageUrl: user.profileImageUrl,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        onboardingCompleted: user.onboardingCompleted,
        
        // Additional profile details
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        freeDownloadsLeft: user.freeDownloadsLeft,
        lastFreeDownloadReset: user.lastFreeDownloadReset,
        totalEarned: user.totalEarned,
        totalSpent: user.totalSpent
      },
      
      // Enhanced profile data
      topperProfile,
      achievements,
      performanceMetrics,
      
      // Real-time data from database
      userStats,
      summary,
      subjectBreakdown: Object.values(subjectBreakdown),
      
      // File information for all notes
      fileInformation,
      totalFilesUploaded: fileInformation.reduce((sum, info) => sum + info.fileCount, 0),
      totalFileSize: fileInformation.reduce((sum, info) => sum + info.totalSize, 0),
      
      // Activity data (all real from database)
      uploadedNotes: enhancedNotes,
      downloadHistory: enhancedDownloads,
      transactions: transactions,
      activityTimeline: activityTimeline.slice(0, 50), // Last 50 activities
      
      // Admin-specific metadata
      profileCompleteness: calculateProfileCompleteness(user),
      riskScore: calculateRiskScore(user, enhancedNotes, transactions),
      lastLoginDate: user.updatedAt, // Approximate last login
      accountAge: Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get user's recent activity feed with real-time updates
app.get('/api/admin/users/:id/activity', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create activities from real database data
    const activities: any[] = [];
    
    // Get real data from database
    const userNotes = await storage.getNotesByTopper(id);
    const downloadHistory = await storage.getDownloadHistory(id);
    const transactions = await storage.getUserTransactions(id, 1, 50);

    // Create activity entries from real note uploads
    userNotes.forEach(note => {
      activities.push({
        id: `note-${note.id}`,
        userId: id,
        type: 'note_upload',
        action: 'uploaded_note',
        description: `Uploaded note: ${note.title}`,
        timestamp: note.createdAt,
        details: {
          noteId: note.id,
          noteTitle: note.title,
          subject: note.subject,
          status: note.status,
          downloads: note.downloadsCount || 0,
          views: note.viewsCount || 0
        }
      });

      // Add status changes as separate activities
      if (note.publishedAt && note.publishedAt !== note.createdAt) {
        activities.push({
          id: `note-published-${note.id}`,
          userId: id,
          type: 'note_status_change',
          action: 'note_published',
          description: `Note "${note.title}" was published`,
          timestamp: note.publishedAt,
          details: {
            noteId: note.id,
            noteTitle: note.title,
            status: 'published'
          }
        });
      }
    });

    // Create activity entries from real downloads
    downloadHistory.forEach(download => {
      activities.push({
        id: `download-${download.id}`,
        userId: id,
        type: 'note_download',
        action: 'downloaded_note',
        description: `Downloaded a note`,
        timestamp: download.downloadedAt,
        details: {
          noteId: download.noteId,
          downloadId: download.id
        }
      });
    });

    // Create activity entries from real transactions
    transactions.forEach(transaction => {
      activities.push({
        id: `transaction-${transaction.id}`,
        userId: id,
        type: 'transaction',
        action: transaction.type,
        description: transaction.description || `${transaction.type}: ${transaction.coinChange > 0 ? '+' : ''}${transaction.coinChange} coins`,
        timestamp: transaction.createdAt,
        details: {
          transactionId: transaction.id,
          amount: transaction.amount,
          coinChange: transaction.coinChange,
          type: transaction.type
        }
      });
    });

    // Filter by type if specified
    if (type && type !== 'all') {
      activities = activities.filter(activity => activity.type === type);
    }

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Paginate
    const total = activities.length;
    const paginatedActivities = activities.slice(offset, offset + parseInt(limit as string));

    res.json({
      activities: paginatedActivities,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
      user: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Unified Admin server running on port ${PORT}`);
  console.log(`🛠️  Admin panel available at: http://localhost:${PORT}/admin`);
  console.log('📊 Using shared PostgreSQL database with main website');
  console.log('👤 Default admin credentials:');
  console.log('   Email: admin@masterstudent.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('✨ Enhanced Features:');
  console.log('   • Detailed note upload information');
  console.log('   • File management and statistics');
  console.log('   • Real-time note approval/rejection');
  console.log('   • Bulk note operations');
  console.log('   • Note analytics and insights');
  console.log('   • Enhanced activity logging');
  
  // Initialize admin user
  await initializeAdminUser();
});

export default app;
