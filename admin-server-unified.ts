// Unified Admin Panel Backend Server - Uses same PostgreSQL database as main website
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import path from 'path';
import { storage } from "./server/storage";
import { db } from "./server/db";
import { users, notes, transactions, downloads, subscriptions } from "@shared/schema";
import { eq, desc, count, sum, and, gte, sql } from "drizzle-orm";

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
      approvedNotes: allNotes.filter(n => n.status === 'approved' || n.status === 'published').length,
      pendingNotes: adminStats.pendingReviews,
      totalDownloads: allNotes.reduce((sum, n) => sum + (n.downloadsCount || 0), 0),
      totalRevenue: 0, // Will be calculated from transactions if needed
      newUsersToday: 0 // Will be calculated if needed
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// User management - using shared storage
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, role, search } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let allUsers = await storage.getAllUsers();

    // Apply filters
    if (status) {
      allUsers = allUsers.filter(u => u.isActive === (status === 'active'));
    }
    
    if (role) {
      allUsers = allUsers.filter(u => u.role === role);
    }
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      allUsers = allUsers.filter(u => 
        u.email?.toLowerCase().includes(searchTerm) ||
        u.firstName?.toLowerCase().includes(searchTerm) ||
        u.lastName?.toLowerCase().includes(searchTerm)
      );
    }

    const total = allUsers.length;
    const paginatedUsers = allUsers.slice(offset, offset + parseInt(limit as string));

    res.json({
      users: paginatedUsers.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive !== false,
        coinBalance: user.coinBalance || 0,
        reputation: user.reputation || 0,
        createdAt: user.createdAt,
        profileImageUrl: user.profileImageUrl
      })),
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get specific user details
app.get('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await storage.getUser(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive !== false,
      coinBalance: user.coinBalance || 0,
      reputation: user.reputation || 0,
      createdAt: user.createdAt,
      profileImageUrl: user.profileImageUrl,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, isActive, coinBalance } = req.body;

    const existingUser = await storage.getUser(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await storage.upsertUser({
      ...existingUser,
      firstName,
      lastName,
      email,
      role,
      isActive,
      coinBalance: parseInt(coinBalance) || existingUser.coinBalance,
      updatedAt: new Date()
    });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Enhanced Notes management - using shared storage with detailed information
app.get('/api/admin/notes', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, subject, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let allNotes = await storage.getAllNotes();
    const allUsers = await storage.getAllUsers();
    const allDownloads = await storage.getAllDownloads();

    // Apply filters
    if (status) {
      allNotes = allNotes.filter(n => n.status === status);
    }
    
    if (subject) {
      allNotes = allNotes.filter(n => n.subject === subject);
    }
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      allNotes = allNotes.filter(n => 
        n.title?.toLowerCase().includes(searchTerm) ||
        n.description?.toLowerCase().includes(searchTerm) ||
        n.topic?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort notes
    allNotes.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    const total = allNotes.length;
    const paginatedNotes = allNotes.slice(offset, offset + parseInt(limit as string));

    const enhancedNotes = paginatedNotes.map(note => {
      const author = allUsers.find(u => u.id === note.topperId);
      const noteDownloads = allDownloads.filter(d => d.noteId === note.id);
      const uniqueDownloaders = new Set(noteDownloads.map(d => d.studentId)).size;
      
      // Calculate file size if attachments exist
      let totalFileSize = 0;
      let fileCount = 0;
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
        
        // Author information
        authorId: note.topperId,
        authorName: author ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email : 'Unknown',
        authorEmail: author?.email || 'unknown@example.com',
        authorRole: author?.role || 'student',
        
        // File information
        attachments: note.attachments || [],
        fileCount,
        totalFileSize: Math.round(totalFileSize * 100) / 100, // Round to 2 decimals
        thumbnailUrl: note.thumbnailUrl,
        
        // Engagement metrics
        downloadsCount: note.downloadsCount || 0,
        uniqueDownloaders,
        viewsCount: note.viewsCount || 0,
        likesCount: note.likesCount || 0,
        
        // Educational details
        categoryId: note.categoryId,
        classGrade: note.classGrade,
        difficulty: note.difficulty,
        estimatedTime: note.estimatedTime,
        tags: note.tags || [],
        
        // Timestamps
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        publishedAt: note.publishedAt,
        
        // Admin specific
        reviewerId: note.reviewerId,
        version: note.version || 1,
        slug: note.slug
      };
    });

    // Calculate statistics for this filtered set
    const stats = {
      totalNotes: total,
      pendingReview: allNotes.filter(n => n.status === 'submitted' || n.status === 'pending').length,
      approved: allNotes.filter(n => n.status === 'approved' || n.status === 'published').length,
      rejected: allNotes.filter(n => n.status === 'rejected').length,
      draft: allNotes.filter(n => n.status === 'draft').length,
      totalDownloads: allNotes.reduce((sum, n) => sum + (n.downloadsCount || 0), 0),
      totalViews: allNotes.reduce((sum, n) => sum + (n.viewsCount || 0), 0),
      averagePrice: allNotes.length > 0 ? allNotes.reduce((sum, n) => sum + (n.price || 0), 0) / allNotes.length : 0
    };

    res.json({
      notes: enhancedNotes,
      stats,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Approve note
app.post('/api/admin/notes/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const note = await storage.getNote(id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote = await storage.updateNote(id, {
      status: 'approved',
      publishedAt: new Date(),
      updatedAt: new Date()
    });

    res.json({ message: 'Note approved successfully', note: updatedNote });
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
    
    const note = await storage.getNote(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote = await storage.updateNote(id, {
      status: 'rejected',
      updatedAt: new Date()
    });

    res.json({ message: 'Note rejected successfully', note: updatedNote });
  } catch (error) {
    console.error('Error rejecting note:', error);
    res.status(500).json({ error: 'Failed to reject note' });
  }
});

// Transactions - using shared storage
app.get('/api/admin/transactions', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let allTransactions = await storage.getAllTransactions();
    const allUsers = await storage.getAllUsers();

    // Apply filters
    if (type) {
      allTransactions = allTransactions.filter(t => t.type === type);
    }

    const total = allTransactions.length;
    const paginatedTransactions = allTransactions.slice(offset, offset + parseInt(limit as string));

    const transactionsWithUsers = paginatedTransactions.map(transaction => {
      const user = allUsers.find(u => u.id === transaction.userId);
      return {
        ...transaction,
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown',
        userEmail: user?.email || 'unknown@example.com'
      };
    });

    res.json({
      transactions: transactionsWithUsers,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Analytics endpoints
app.get('/api/admin/analytics/user-growth', authenticateAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const allUsers = await storage.getAllUsers();
    
    let daysBack = 30;
    if (period === '7d') daysBack = 7;
    else if (period === '90d') daysBack = 90;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const filteredUsers = allUsers.filter(u => 
      u.createdAt && new Date(u.createdAt) >= cutoffDate
    );

    // Group by date
    const groupedData: { [key: string]: number } = {};
    filteredUsers.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt).toISOString().split('T')[0];
        groupedData[date] = (groupedData[date] || 0) + 1;
      }
    });

    const results = Object.entries(groupedData).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json(results);
  } catch (error) {
    console.error('Error fetching user growth analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user growth data' });
  }
});

// Activity logs endpoint
app.get('/api/admin/logs/activity', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    // Get recent user activities from shared storage
    const allUsers = await storage.getAllUsers();
    const allNotes = await storage.getAllNotes();
    const allTransactions = await storage.getAllTransactions();

    // Create activity logs from real data
    const activities: any[] = [];

    // Recent user registrations
    allUsers.slice(-20).forEach(user => {
      if (user.createdAt) {
        activities.push({
          id: `user-${user.id}`,
          type: 'registration',
          description: 'User registered',
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          userEmail: user.email,
          timestamp: user.createdAt,
          ipAddress: '192.168.1.1' // Mock IP
        });
      }
    });

    // Recent note uploads
    allNotes.slice(-20).forEach(note => {
      if (note.createdAt) {
        const author = allUsers.find(u => u.id === note.topperId);
        activities.push({
          id: `note-${note.id}`,
          type: 'upload',
          description: `Uploaded note: ${note.title}`,
          userName: author ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email : 'Unknown',
          userEmail: author?.email || 'unknown@example.com',
          timestamp: note.createdAt,
          ipAddress: '192.168.1.1' // Mock IP
        });
      }
    });

    // Recent transactions
    allTransactions.slice(-20).forEach(transaction => {
      if (transaction.createdAt) {
        const user = allUsers.find(u => u.id === transaction.userId);
        activities.push({
          id: `transaction-${transaction.id}`,
          type: transaction.type,
          description: `${transaction.type}: ${transaction.amount} coins`,
          userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown',
          userEmail: user?.email || 'unknown@example.com',
          timestamp: transaction.createdAt,
          ipAddress: '192.168.1.1' // Mock IP
        });
      }
    });

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
  res.sendFile(path.join(__dirname, 'client/src/admin panel/admin-dashboard.html'));
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

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
        await storage.upsertUser({
          ...adminUser,
          role: 'admin'
        });
        console.log('Updated existing user to admin role');
      }
    }
    
    console.log('Admin user ready:', adminEmail);
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Unified Admin server running on port ${PORT}`);
  console.log(`Admin panel available at: http://localhost:${PORT}/admin`);
  console.log('Using shared PostgreSQL database with main website');
  console.log('Default admin credentials:');
  console.log('Email: admin@masterstudent.com');
  console.log('Password: admin123');
  
  // Initialize admin user
  await initializeAdminUser();
});

export default app;
