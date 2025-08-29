import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";

// Stripe is optional - only initialize if key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get topper profile if user is a topper
      let topperProfile = null;
      if (user.role === 'topper') {
        topperProfile = await storage.getTopperProfile(user.id);
      }

      res.json({ ...user, topperProfile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Subscription routes
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { plan } = req.body; // 'monthly' or 'yearly'

    try {
      // Check if Stripe is configured
      if (!stripe) {
        return res.status(503).json({ 
          error: "Payment processing is currently unavailable. Stripe integration is not configured." 
        });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user already has active subscription
      const existingSubscription = await storage.getActiveSubscription(userId);
      if (existingSubscription) {
        return res.json({ 
          message: "Already subscribed",
          subscription: existingSubscription 
        });
      }

      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email!,
          name: `${user.firstName} ${user.lastName}`.trim(),
        });
        await storage.updateUserStripeInfo(userId, customer.id, '');
      }

      // Price IDs - these need to be set in environment
      const priceId = plan === 'yearly' ? process.env.STRIPE_YEARLY_PRICE_ID : process.env.STRIPE_MONTHLY_PRICE_ID;
      
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription to database
      const renewalDate = new Date();
      if (plan === 'yearly') {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      } else {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      }

      await storage.createSubscription({
        studentId: userId,
        plan,
        startDate: new Date(),
        renewalDate,
        status: 'active',
        gateway: 'stripe',
        gatewayCustomerId: customer.id,
        gatewaySubId: subscription.id,
      });

      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Subscription error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Notes routes
  app.get('/api/notes', async (req, res) => {
    try {
      const { subject, classGrade, search, categoryId, page = '1', limit = '20' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const { notes, total } = await storage.getPublishedNotes({
        subject: subject as string,
        classGrade: classGrade as string,
        search: search as string,
        categoryId: categoryId as string,
        limit: parseInt(limit as string),
        offset,
      });

      res.json({ notes, total, page: parseInt(page as string), limit: parseInt(limit as string) });
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get('/api/notes/:id', async (req, res) => {
    try {
      const note = await storage.getNoteById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      // Get feedback for the note
      const feedbackList = await storage.getFeedbackByNote(note.id);
      
      res.json({ ...note, feedback: feedbackList });
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post('/api/notes', isAuthenticated, upload.array('files'), async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'topper' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Only toppers can upload notes" });
      }

      const { title, subject, topic, classGrade, description, categoryId } = req.body;
      const files = req.files as Express.Multer.File[];

      // Process uploaded files
      const attachments = files.map(file => `/uploads/${file.filename}`);

      const note = await storage.createNote({
        title,
        subject,
        topic,
        classGrade,
        description,
        attachments,
        topperId: userId,
        status: 'draft',
        categoryId: categoryId || null, // Optional for backward compatibility
      });

      res.json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.put('/api/notes/:id/submit', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const note = await storage.getNoteById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      if (note.topperId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Update note status to submitted
      const updatedNote = await storage.updateNoteStatus(req.params.id, 'submitted');

      // Create review task
      await storage.createReviewTask({
        noteId: req.params.id,
        status: 'open',
      });

      res.json(updatedNote);
    } catch (error) {
      console.error("Error submitting note:", error);
      res.status(500).json({ message: "Failed to submit note" });
    }
  });

  app.post('/api/notes/:id/download', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check subscription
      const subscription = await storage.getActiveSubscription(userId);
      if (!subscription) {
        return res.status(403).json({ message: "Active subscription required" });
      }

      const note = await storage.getNoteById(req.params.id);
      if (!note || note.status !== 'published') {
        return res.status(404).json({ message: "Note not found" });
      }

      // Record download
      await storage.recordDownload(userId, req.params.id);

      res.json({ message: "Download recorded", downloadUrl: note.attachments });
    } catch (error) {
      console.error("Error downloading note:", error);
      res.status(500).json({ message: "Failed to download note" });
    }
  });

  // Feedback routes
  app.post('/api/notes/:id/feedback', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { rating, comment } = req.body;
    
    try {
      // Check if user already gave feedback
      const existingFeedback = await storage.getFeedbackByStudent(userId, req.params.id);
      if (existingFeedback) {
        return res.status(400).json({ message: "Feedback already provided" });
      }

      const feedback = await storage.createFeedback({
        noteId: req.params.id,
        studentId: userId,
        rating,
        comment,
      });

      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  // Review routes (for reviewers/admins)
  app.get('/api/review/queue', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'reviewer' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const tasks = await storage.getReviewTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching review queue:", error);
      res.status(500).json({ message: "Failed to fetch review queue" });
    }
  });

  app.put('/api/review/:id/approve', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'reviewer' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const task = await storage.updateReviewTask(req.params.id, {
        status: 'approved',
        decidedAt: new Date(),
        reviewerId: userId,
      });

      // Update note status to approved/published
      const note = await storage.updateNoteStatus(task.noteId, 'published', userId);

      res.json({ task, note });
    } catch (error) {
      console.error("Error approving note:", error);
      res.status(500).json({ message: "Failed to approve note" });
    }
  });

  app.put('/api/review/:id/reject', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { comments } = req.body;
    
    try {
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'reviewer' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const task = await storage.updateReviewTask(req.params.id, {
        status: 'rejected',
        comments: comments || [],
        decidedAt: new Date(),
        reviewerId: userId,
      });

      // Update note status to rejected
      const note = await storage.updateNoteStatus(task.noteId, 'rejected', userId);

      res.json({ task, note });
    } catch (error) {
      console.error("Error rejecting note:", error);
      res.status(500).json({ message: "Failed to reject note" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/topper', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'topper') {
        return res.status(403).json({ message: "Access denied" });
      }

      const analytics = await storage.getTopperAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Follow routes
  app.post('/api/follow/:topperId', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const follow = await storage.followTopper(userId, req.params.topperId);
      res.json(follow);
    } catch (error) {
      console.error("Error following topper:", error);
      res.status(500).json({ message: "Failed to follow topper" });
    }
  });

  app.delete('/api/follow/:topperId', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      await storage.unfollowTopper(userId, req.params.topperId);
      res.json({ message: "Unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing topper:", error);
      res.status(500).json({ message: "Failed to unfollow topper" });
    }
  });

  // Coin System Routes

  // Get user's coin balance and stats
  app.get('/api/coins/balance', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        coinBalance: user.coinBalance,
        freeDownloadsLeft: user.freeDownloadsLeft,
        totalEarned: user.totalEarned,
        totalSpent: user.totalSpent,
        reputation: user.reputation,
        streak: user.streak
      });
    } catch (error) {
      console.error("Error fetching coin balance:", error);
      res.status(500).json({ message: "Failed to fetch coin balance" });
    }
  });

  // Track note view and award coins
  app.post('/api/notes/:noteId/view', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { noteId } = req.params;
    
    try {
      const note = await storage.getNote(noteId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      // Don't award coins for viewing own notes
      if (note.topperId === userId) {
        await storage.incrementNoteViews(noteId);
        return res.json({ coinsEarned: 0, message: "View recorded" });
      }

      // Check if user already viewed this note today
      const hasViewedToday = await storage.hasUserViewedNoteToday(userId, noteId);
      
      let coinsEarned = 0;
      if (!hasViewedToday) {
        // Award 1 coin for first view of the day
        coinsEarned = 1;
        await storage.recordNoteView(userId, noteId, coinsEarned);
        await storage.updateUserCoins(userId, coinsEarned);
        
        // Also award coins to the note creator
        await storage.updateUserCoins(note.topperId, coinsEarned);
        await storage.recordTransaction(note.topperId, 'coin_earned', coinsEarned, coinsEarned, noteId, 'Earned from note view');
      }

      await storage.incrementNoteViews(noteId);
      await storage.recordTransaction(userId, 'coin_earned', coinsEarned, coinsEarned, noteId, 'Earned from viewing note');

      res.json({ coinsEarned, message: coinsEarned > 0 ? "Coins earned!" : "View recorded" });
    } catch (error) {
      console.error("Error recording note view:", error);
      res.status(500).json({ message: "Failed to record view" });
    }
  });

  // Like/unlike a note
  app.post('/api/notes/:noteId/like', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { noteId } = req.params;
    
    try {
      const isLiked = await storage.toggleNoteLike(userId, noteId);
      const likesCount = await storage.getNoteLikesCount(noteId);

      res.json({ isLiked, likesCount });
    } catch (error) {
      console.error("Error toggling note like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Download note (with coin deduction or free download)
  app.post('/api/notes/:noteId/download', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { noteId } = req.params;
    
    try {
      const user = await storage.getUser(userId);
      const note = await storage.getNote(noteId);
      
      if (!user || !note) {
        return res.status(404).json({ message: "User or note not found" });
      }

      // Check if user has already downloaded this note
      const hasDownloaded = await storage.hasUserDownloaded(userId, noteId);
      if (hasDownloaded) {
        return res.json({ message: "Already downloaded", downloaded: true });
      }

      let usedFreeDownload = false;
      let coinsSpent = 0;

      // Reset free downloads if it's a new day
      await storage.resetDailyFreeDownloads(userId);

      // Check if user can use free download
      if (user.freeDownloadsLeft > 0) {
        usedFreeDownload = true;
        await storage.useFreeDowload(userId);
        await storage.recordTransaction(userId, 'download_free', 0, 0, noteId, 'Free download used');
      } else if (user.coinBalance >= note.price) {
        // Use coins to download
        coinsSpent = note.price;
        await storage.updateUserCoins(userId, -coinsSpent);
        await storage.recordTransaction(userId, 'download_paid', coinsSpent, -coinsSpent, noteId, 'Paid download with coins');
        
        // Award coins to note creator (50% of price)
        const creatorEarnings = Math.floor(coinsSpent * 0.5);
        await storage.updateUserCoins(note.topperId, creatorEarnings);
        await storage.recordTransaction(note.topperId, 'coin_earned', creatorEarnings, creatorEarnings, noteId, 'Earned from note download');
      } else {
        return res.status(400).json({ 
          message: "Insufficient coins and no free downloads left",
          required: note.price,
          current: user.coinBalance
        });
      }

      // Record the download
      await storage.recordDownload(userId, noteId);
      await storage.incrementNoteDownloads(noteId);

      res.json({ 
        message: "Download successful",
        usedFreeDownload,
        coinsSpent,
        downloaded: true
      });
    } catch (error) {
      console.error("Error downloading note:", error);
      res.status(500).json({ message: "Failed to download note" });
    }
  });

  // Get coin packages for purchase
  app.get('/api/coins/packages', async (req, res) => {
    try {
      const packages = await storage.getCoinPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching coin packages:", error);
      res.status(500).json({ message: "Failed to fetch coin packages" });
    }
  });

  // Get transaction history
  app.get('/api/coins/transactions', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { page = 1, limit = 20 } = req.query;
    
    try {
      const transactions = await storage.getUserTransactions(userId, parseInt(page as string), parseInt(limit as string));
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get leaderboard
  app.get('/api/leaderboard', async (req, res) => {
    const { type = 'earnings', limit = 50 } = req.query;
    
    try {
      const leaderboard = await storage.getLeaderboard(type as string, parseInt(limit as string));
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get daily challenges
  app.get('/api/challenges/daily', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const challenges = await storage.getDailyChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching daily challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Complete daily challenge
  app.post('/api/challenges/:challengeId/complete', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { challengeId } = req.params;
    
    try {
      const result = await storage.completeDailyChallenge(userId, challengeId);
      if (result.completed) {
        res.json({ message: "Challenge completed!", coinsEarned: result.coinsEarned });
      } else {
        res.json({ message: "Challenge not yet completed", progress: result.progress });
      }
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(500).json({ message: "Failed to complete challenge" });
    }
  });

  // Educational categories routes
  app.get('/api/educational-categories', async (req, res) => {
    try {
      const categories = await storage.getEducationalCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching educational categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Complete onboarding
  app.post('/api/complete-onboarding', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { categoryIds } = req.body;

    try {
      // Save user's educational preferences
      if (categoryIds && categoryIds.length > 0) {
        await storage.saveUserEducationalPreferences(userId, categoryIds);
      }

      // Mark onboarding as completed
      await storage.completeUserOnboarding(userId);

      res.json({ message: "Onboarding completed successfully" });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Get user educational preferences
  app.get('/api/user-educational-preferences', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    try {
      const preferences = await storage.getUserEducationalPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // SEO Sitemap route
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = 'https://masterstudent.replit.app';
      
      // Get all published notes for sitemap
      const { notes } = await storage.getPublishedNotes({ limit: 1000, offset: 0 });
      const categories = await storage.getEducationalCategories();
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/catalog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;

      // Add category pages
      categories?.forEach((category: any) => {
        const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
        sitemap += `
  <url>
    <loc>${baseUrl}/category/${categorySlug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });

      // Add individual note pages
      notes.forEach((note: any) => {
        const lastMod = note.updatedAt || note.createdAt || note.publishedAt;
        sitemap += `
  <url>
    <loc>${baseUrl}/notes/${note.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <lastmod>${new Date(lastMod).toISOString().split('T')[0]}</lastmod>
  </url>`;
      });

      sitemap += `
</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).json({ message: 'Failed to generate sitemap' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Basic file serving - in production, use proper file storage service
    const filePath = path.join(__dirname, '..', 'uploads', req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
