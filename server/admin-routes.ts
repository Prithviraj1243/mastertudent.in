import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { users, notes, transactions } from "@shared/schema";
import { eq, desc, count, sum, and } from "drizzle-orm";

export function registerAdminRoutes(app: Express) {
  // Helper function to get user ID from request
  const getUserId = (req: any) => req.user?.id || req.user?.claims?.sub;

  // Admin middleware to check admin role
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admins only" });
      }
      
      next();
    } catch (error) {
      console.error("Admin middleware error:", error);
      res.status(500).json({ message: "Authorization check failed" });
    }
  };

  // Mock data generators for development
  const generateMockActivities = () => {
    const activities = [];
    const types = ['login', 'logout', 'upload', 'download', 'view', 'registration', 'subscription'];
    const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
    const emails = ['john@example.com', 'jane@example.com', 'mike@example.com', 'sarah@example.com', 'david@example.com'];
    
    for (let i = 0; i < 20; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomEmail = emails[Math.floor(Math.random() * emails.length)];
      
      activities.push({
        id: `activity-${i}`,
        type: randomType,
        description: `User ${randomType === 'login' ? 'logged in' : randomType === 'logout' ? 'logged out' : randomType === 'upload' ? 'uploaded a note' : randomType === 'download' ? 'downloaded a note' : randomType === 'view' ? 'viewed a note' : randomType === 'registration' ? 'registered' : 'subscribed'}`,
        userName: randomUser,
        userEmail: randomEmail,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
      });
    }
    
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const generateMockUploadRequests = () => {
    const uploads = [];
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
    const classes = ['9', '10', '11', '12'];
    const statuses = ['pending', 'approved', 'rejected', 'processing'];
    const uploaders = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'];
    
    for (let i = 0; i < 15; i++) {
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomUploader = uploaders[Math.floor(Math.random() * uploaders.length)];
      
      uploads.push({
        id: `upload-${i}`,
        title: `${randomSubject} Notes - Chapter ${Math.floor(Math.random() * 10) + 1}`,
        subject: randomSubject,
        classGrade: randomClass,
        status: randomStatus,
        uploaderName: randomUploader,
        createdAt: new Date(Date.now() - Math.random() * 604800000).toISOString(),
        fileCount: Math.floor(Math.random() * 5) + 1,
        totalSize: `${(Math.random() * 50).toFixed(1)} MB`,
        description: `Comprehensive notes covering key concepts in ${randomSubject} for Class ${randomClass}`
      });
    }
    
    return uploads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const generateMockUserSessions = () => {
    const sessions = [];
    const users = ['Emma Thompson', 'James Wilson', 'Olivia Brown', 'William Davis', 'Sophia Miller'];
    const emails = ['emma@example.com', 'james@example.com', 'olivia@example.com', 'william@example.com', 'sophia@example.com'];
    const locations = ['Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Chennai, India', 'Kolkata, India'];
    const devices = ['Chrome on Windows', 'Safari on Mac', 'Chrome on Android', 'Firefox on Linux', 'Edge on Windows'];
    
    for (let i = 0; i < 8; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomEmail = emails[Math.floor(Math.random() * emails.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const randomDevice = devices[Math.floor(Math.random() * devices.length)];
      
      sessions.push({
        id: `session-${i}`,
        userName: randomUser,
        userEmail: randomEmail,
        location: randomLocation,
        device: randomDevice,
        duration: `${Math.floor(Math.random() * 120) + 5} min`,
        lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString()
      });
    }
    
    return sessions;
  };

  // Admin activity endpoints
  app.get("/api/admin/activities", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      // In production, this would fetch from database
      const activities = generateMockActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/admin/upload-requests", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      // In production, this would fetch from database
      const uploads = generateMockUploadRequests();
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching upload requests:", error);
      res.status(500).json({ message: "Failed to fetch upload requests" });
    }
  });

  app.get("/api/admin/user-sessions", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      // In production, this would fetch from database
      const sessions = generateMockUserSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ message: "Failed to fetch user sessions" });
    }
  });

  // Admin stats endpoint
  app.get("/api/admin/stats", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      // Mock stats - in production, calculate from database
      const stats = {
        totalUsers: 1247,
        totalNotes: 3456,
        activeSubscriptions: 234,
        pendingReviews: 12,
        totalDownloads: 15678,
        monthlyRevenue: 234 * 59, // activeSubscriptions * price
        platformRating: 4.8
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Real Data Endpoints
  
  // Get all users with real data from website
  app.get("/api/admin/users", async (req, res) => {
    try {
      // Get real users from the storage system (actual website users)
      const realUsers = (storage as any).users || [];
      
      const formattedUsers = realUsers.map((user: any) => ({
        id: user.id,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0] || 'Unknown User',
        email: user.email || 'No email',
        role: user.role || 'student',
        isActive: user.isActive !== false,
        createdAt: user.createdAt || new Date(),
        coins: user.coinBalance || 0,
        totalEarned: user.totalEarned || 0,
        totalSpent: user.totalSpent || 0,
        reputation: user.reputation || 0,
        streak: user.streak || 0
      }));

      console.log(`Admin API: Fetched ${formattedUsers.length} real users from website`);
      res.json(formattedUsers);
    } catch (error) {
      console.error("Error fetching real users:", error);
      res.status(500).json({ error: "Failed to fetch users from website" });
    }
  });

  // Get user statistics from real website data
  app.get("/api/admin/user-stats", async (req, res) => {
    try {
      // Get real users from the storage system
      const realUsers = (storage as any).users || [];
      
      const totalUsers = realUsers.length;
      const activeUsers = realUsers.filter((u: any) => u.isActive !== false).length;
      const toppers = realUsers.filter((u: any) => u.role === 'topper').length;
      
      // Calculate new users today
      const today = new Date().toDateString();
      const newToday = realUsers.filter((u: any) => 
        u.createdAt && new Date(u.createdAt).toDateString() === today
      ).length;

      const stats = {
        totalUsers,
        activeUsers,
        toppers,
        newToday
      };

      console.log('Admin API: Real user stats from website:', stats);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching real user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats from website" });
    }
  });

  // Get all notes from real website data
  app.get("/api/admin/notes", async (req, res) => {
    try {
      // Use the proper storage method to get all notes for admin
      const { notes: realNotes } = await storage.getAllNotesForAdmin({
        limit: 100, // Get up to 100 notes
        offset: 0
      });

      console.log(`Admin API: Fetched ${realNotes.length} real notes from storage`);
      
      // Filter out any demo notes - only show notes that have been actually uploaded
      const userUploadedNotes = realNotes.filter((note: any) => {
        // Skip demo notes by checking if they have realistic data
        const isRealNote = note.title && 
                          !note.title.includes('Sample') && 
                          !note.title.includes('Demo') &&
                          note.createdAt;
        return isRealNote;
      });
      
      // Debug: Log each note's attachments
      userUploadedNotes.forEach((note: any) => {
        console.log(`Real note "${note.title}" attachments:`, note.attachments);
      });

      console.log(`Admin API: Showing ${userUploadedNotes.length} real user-uploaded notes`);
      res.json(userUploadedNotes);
    } catch (error) {
      console.error("Error fetching real notes:", error);
      res.status(500).json({ error: "Failed to fetch notes from storage" });
    }
  });

  // Get notes statistics from real website data
  app.get("/api/admin/note-stats", async (req, res) => {
    try {
      // Get real notes from the database
      const { notes: realNotes } = await storage.getAllNotesForAdmin({
        limit: 1000, // Get all notes for stats
        offset: 0
      });
      
      const totalNotes = realNotes.length;
      const approved = realNotes.filter((n: any) => n.status === 'approved' || n.status === 'published').length;
      const pending = realNotes.filter((n: any) => n.status === 'pending' || n.status === 'submitted').length;
      const totalDownloads = realNotes.reduce((sum: number, n: any) => sum + (n.downloadsCount || n.downloadCount || 0), 0);

      const stats = {
        totalNotes,
        approved,
        pending,
        totalDownloads
      };

      console.log('Admin API: Real note stats from website:', stats);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching real note stats:", error);
      res.status(500).json({ error: "Failed to fetch note stats from website" });
    }
  });

  // Get transactions from real website data
  app.get("/api/admin/transactions", async (req, res) => {
    try {
      // Get real transactions from the storage system
      const realTransactions = (storage as any).transactions || [];
      const realUsers = (storage as any).users || [];
      
      const formattedTransactions = realTransactions.map((transaction: any) => {
        // Find the user for this transaction
        const user = realUsers.find((u: any) => u.id === transaction.userId);
        const userName = user ? 
          (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0]) 
          : 'Unknown User';

        // Determine transaction type
        const type = transaction.type?.includes('earned') || transaction.type?.includes('reward') || transaction.type === 'coin_earned' ? 'earn' : 'spend';

        return {
          id: transaction.id,
          userId: transaction.userId,
          type: type,
          amount: transaction.amount || 0,
          description: transaction.description || transaction.type || 'Transaction',
          createdAt: transaction.createdAt || new Date(),
          user: userName,
          date: transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
        };
      });

      console.log(`Admin API: Fetched ${formattedTransactions.length} real transactions from website`);
      res.json(formattedTransactions);
    } catch (error) {
      console.error("Error fetching real transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions from website" });
    }
  });

  // Get coin statistics from real website data
  app.get("/api/admin/coin-stats", async (req, res) => {
    try {
      // Get real data from the storage system
      const realUsers = (storage as any).users || [];
      const realTransactions = (storage as any).transactions || [];
      
      // Calculate total coins in all user balances
      const totalCoins = realUsers.reduce((sum: number, u: any) => sum + (u.coinBalance || 0), 0);
      
      // Calculate earned coins (positive transactions)
      const earned = realTransactions
        .filter((t: any) => t.type?.includes('earned') || t.type?.includes('reward') || t.type === 'coin_earned')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      
      // Calculate spent coins (negative transactions)
      const spent = realTransactions
        .filter((t: any) => t.type?.includes('spent') || t.type === 'coin_spent' || t.type?.includes('download'))
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      const stats = {
        totalCoins,
        earned,
        spent
      };

      console.log('Admin API: Real coin stats from website:', stats);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching real coin stats:", error);
      res.status(500).json({ error: "Failed to fetch coin stats from website" });
    }
  });

  // Get real-time website activity
  app.get("/api/admin/activity", async (req, res) => {
    try {
      // Get recent activity from storage
      const activity = await storage.getUserActivity();
      
      console.log(`Admin API: Fetched ${activity.length} real activity records from website`);
      res.json(activity.slice(0, 50)); // Return latest 50 activities
    } catch (error) {
      console.error("Error fetching real activity:", error);
      res.status(500).json({ error: "Failed to fetch activity from website" });
    }
  });

  // Get detailed user information
  app.get("/api/admin/users/:id/details", async (req, res) => {
    try {
      const { id } = req.params;
      const userDetails = await storage.getUserDetailedInfo(id);
      
      if (!userDetails) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`Admin API: Fetched detailed info for user ${id}`);
      res.json(userDetails);
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  });

  // Get user sessions
  app.get("/api/admin/users/:id/sessions", async (req, res) => {
    try {
      const { id } = req.params;
      const sessions = await storage.getUserSessions(id);
      
      console.log(`Admin API: Fetched ${sessions.length} sessions for user ${id}`);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ error: "Failed to fetch user sessions" });
    }
  });

  // Get user activity
  app.get("/api/admin/users/:id/activity", async (req, res) => {
    try {
      const { id } = req.params;
      const activities = await storage.getUserActivityById(id);
      
      console.log(`Admin API: Fetched ${activities.length} activities for user ${id}`);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ error: "Failed to fetch user activity" });
    }
  });

  // Get individual note details
  app.get("/api/admin/notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const note = await storage.getNoteById(id);
      
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      // Get author information
      const author = await storage.getUser(note.topperId);

      const noteWithAuthor = {
        ...note,
        authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown Author',
        authorEmail: author?.email || 'No email',
        authorRole: author?.role || 'student'
      };

      console.log(`Admin API: Fetched note details for ${id}`);
      res.json(noteWithAuthor);
    } catch (error) {
      console.error("Error fetching note details:", error);
      res.status(500).json({ error: "Failed to fetch note details" });
    }
  });

  // Publish a note (admin action)
  app.put("/api/admin/notes/:id/publish", async (req, res) => {
    try {
      const { id } = req.params;
      const note = await storage.getNoteById(id);
      
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      if (note.status !== 'submitted') {
        return res.status(400).json({ error: "Note is not in submitted status" });
      }

      // Update note status to published
      await storage.updateNoteStatus(id, 'published');

      // Award 20 coins to the author for publishing
      await storage.updateUserCoins(note.topperId, 20);
      await storage.recordTransaction(
        note.topperId,
        'note_published',
        20,
        20,
        id,
        'Earned 20 coins for note being published'
      );

      // Record activity
      try {
        await storage.recordUserActivity(note.topperId, 'note_published', {
          noteId: id,
          noteTitle: note.title,
          coinsEarned: 20
        });
      } catch (error) {
        console.error('Failed to record publish activity:', error);
      }

      console.log(`Admin API: Published note ${id}, awarded 20 coins to user ${note.topperId}`);
      res.json({ success: true, message: "Note published successfully" });
    } catch (error) {
      console.error("Error publishing note:", error);
      res.status(500).json({ error: "Failed to publish note" });
    }
  });

  // Reject a note (admin action)
  app.put("/api/admin/notes/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const note = await storage.getNoteById(id);
      
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      if (note.status !== 'submitted') {
        return res.status(400).json({ error: "Note is not in submitted status" });
      }

      // Update note status to rejected
      await storage.updateNoteStatus(id, 'rejected');

      // Record activity
      try {
        await storage.recordUserActivity(note.topperId, 'note_rejected', {
          noteId: id,
          noteTitle: note.title,
          reason: reason || 'No reason provided'
        });
      } catch (error) {
        console.error('Failed to record reject activity:', error);
      }

      console.log(`Admin API: Rejected note ${id} with reason: ${reason}`);
      res.json({ success: true, message: "Note rejected successfully" });
    } catch (error) {
      console.error("Error rejecting note:", error);
      res.status(500).json({ error: "Failed to reject note" });
    }
  });

  // Debug endpoint to see raw notes data
  app.get("/api/admin/debug/notes", async (req, res) => {
    try {
      const realNotes = (storage as any).notes || [];
      console.log('Raw notes data:', JSON.stringify(realNotes, null, 2));
      res.json({
        count: realNotes.length,
        notes: realNotes.map((note: any) => ({
          id: note.id,
          title: note.title,
          attachments: note.attachments,
          attachmentsType: typeof note.attachments,
          attachmentsLength: note.attachments ? note.attachments.length : 'N/A'
        }))
      });
    } catch (error) {
      console.error("Error in debug endpoint:", error);
      res.status(500).json({ error: "Debug failed" });
    }
  });

  // Get website overview stats
  app.get("/api/admin/overview", async (req, res) => {
    try {
      const realUsers = (storage as any).users || [];
      const realNotes = (storage as any).notes || [];
      const realTransactions = (storage as any).transactions || [];
      
      // Calculate comprehensive stats
      const totalUsers = realUsers.length;
      const totalNotes = realNotes.length;
      const totalTransactions = realTransactions.length;
      const totalCoins = realUsers.reduce((sum: number, u: any) => sum + (u.coinBalance || 0), 0);
      const totalDownloads = realNotes.reduce((sum: number, n: any) => sum + (n.downloadsCount || n.downloadCount || 0), 0);
      
      // Active users (logged in recently or have activity)
      const activeUsers = realUsers.filter((u: any) => u.isActive !== false).length;
      
      // Recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recentActivity = realTransactions.filter((t: any) => 
        t.createdAt && new Date(t.createdAt) > yesterday
      ).length;

      const overview = {
        totalUsers,
        totalNotes,
        totalTransactions,
        totalCoins,
        totalDownloads,
        activeUsers,
        recentActivity,
        lastUpdated: new Date().toISOString()
      };

      console.log('Admin API: Real website overview:', overview);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching website overview:", error);
      res.status(500).json({ error: "Failed to fetch website overview" });
    }
  });
}
