import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { sendWelcomeEmail } from "./sendgrid";
import { registerAdminRoutes } from "./admin-routes";
import { 
  syncUserToFirebase, 
  syncNoteToFirebase, 
  syncPaymentToFirebase,
  syncSubscriptionToFirebase,
  updateUserActivity 
} from "./firebase-sync";
import crypto from "crypto";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";

// Helper function to get user ID from request
function getUserId(req: any): string {
  return req.user?.id || req.user?.sub || '';
}

// Stripe is optional - only initialize if key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  registerAdminRoutes(app);
  
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Server start timestamp for cache busting
  const serverStartTime = Date.now();

  // Cache control middleware for HTML and API responses
  app.use((req, res, next) => {
    // Apply no-cache to all HTML requests (including root "/")
    if (req.method === "GET" && req.headers.accept?.includes("text/html")) {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
    }
    // Apply no-cache to all API requests
    if (req.path.startsWith("/api/")) {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
    }
    next();
  });

  // Simple debug route - register first to ensure it works
  app.get("/api/debug", (req, res) => {
    console.log("Debug endpoint hit!");
    res.json({ 
      message: "Debug endpoint working!", 
      timestamp: Date.now(),
      method: req.method,
      path: req.path,
      url: req.url
    });
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Auth middleware
  setupAuth(app);

  // Version endpoint for cache busting
  app.get("/api/version", (req, res) => {
    res.json({ version: serverStartTime, timestamp: Date.now() });
  });

  // Test endpoint
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!", timestamp: Date.now() });
  });

  // Login page redirect
  app.get("/api/login", (req, res) => {
    res.redirect("/#/login");
  });

  // Create admin user (development only)
  app.post("/api/create-admin", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user exists
      let user = await storage.getUserByEmail(email);
      
      if (user) {
        // Update existing user to admin
        const updatedUser = await storage.upsertUser({
          ...user,
          role: 'admin'
        });
        res.json({ success: true, message: "User updated to admin", user: updatedUser });
      } else {
        // Create new admin user
        const newUser = await storage.upsertUser({
          id: crypto.randomUUID(),
          email: email,
          firstName: firstName || 'Admin',
          lastName: lastName || 'User',
          profileImageUrl: '',
          role: 'admin',
          onboardingCompleted: true,
        });
        res.json({ success: true, message: "Admin user created", user: newUser });
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    console.log("Registration endpoint hit:", req.body);
    try {
      const { firstName, lastName, email, phone, password, selectedGoals } = req.body;
      
      // Basic validation
      if (!firstName || !lastName || !email || !password) {
        console.log("Validation failed - missing fields");
        return res.status(400).json({ message: "All fields are required" });
      }
      
      if (!email.includes('@')) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      // Create new user
      const newUser = await storage.upsertUser({
        id: crypto.randomUUID(),
        email: email,
        firstName: firstName,
        lastName: lastName,
        profileImageUrl: '',
        role: 'student',
        onboardingCompleted: true, // Mark as completed since they went through our flow
      });
      
      // Store additional data if needed (goals, phone, etc.)
      // You can extend the user schema or create additional tables for this
      
      console.log("User created successfully:", newUser.id);
      
      // Auto-login the user after registration
      req.logIn(newUser, (err) => {
        if (err) {
          console.error('Auto-login error:', err);
          return res.status(500).json({ message: 'Registration successful but login failed' });
        }
        
        console.log("User logged in successfully");
        
        // Send welcome email (async, don't wait for it)
        sendWelcomeEmail(email, firstName).catch(emailError => {
          console.error('Welcome email error:', emailError);
        });
        
        // Sync user to Firebase (async, don't wait for it)
        syncUserToFirebase({
          id: newUser.id,
          email: newUser.email,
          name: `${newUser.firstName} ${newUser.lastName}`,
          provider: 'email',
          subscription: 'free',
          isEmailVerified: false,
          createdAt: new Date().toISOString()
        }).catch(syncError => {
          console.error('Firebase sync error:', syncError);
        });
        
        res.json({ 
          success: true, 
          user: { 
            id: newUser.id, 
            email: newUser.email, 
            firstName: newUser.firstName,
            lastName: newUser.lastName 
          } 
        });
      });
      
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed: " + (error instanceof Error ? error.message : 'Unknown error') });
    }
  });

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      // Handle both new email-based auth and old OIDC auth
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get topper profile if user is a topper
      let topperProfile = null;
      if (user.role === "topper") {
        topperProfile = await storage.getTopperProfile(user.id);
      }

      res.json({ ...user, topperProfile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Subscription routes
  app.post(
    "/api/create-subscription",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);
      const { plan } = req.body; // 'monthly' or 'yearly'

      try {
        // Check if Stripe is configured
        if (!stripe) {
          return res.status(503).json({
            error:
              "Payment processing is currently unavailable. Stripe integration is not configured.",
          });
        }

        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Check if user already has active subscription
        const existingSubscription =
          await storage.getActiveSubscription(userId);
        if (existingSubscription) {
          return res.json({
            message: "Already subscribed",
            subscription: existingSubscription,
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
          await storage.updateUserStripeInfo(userId, customer.id, "");
        }

        // Price IDs - these need to be set in environment
        const priceId =
          plan === "yearly"
            ? process.env.STRIPE_YEARLY_PRICE_ID
            : process.env.STRIPE_MONTHLY_PRICE_ID;

        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: priceId }],
          payment_behavior: "default_incomplete",
          expand: ["latest_invoice.payment_intent"],
        });

        // Save subscription to database
        const renewalDate = new Date();
        if (plan === "yearly") {
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        } else {
          renewalDate.setMonth(renewalDate.getMonth() + 1);
        }

        await storage.createSubscription({
          studentId: userId,
          plan,
          startDate: new Date(),
          renewalDate,
          status: "active",
          gateway: "stripe",
          gatewayCustomerId: customer.id,
          gatewaySubId: subscription.id,
        });

        await storage.updateUserStripeInfo(
          userId,
          customer.id,
          subscription.id,
        );

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent
            ?.client_secret,
        });
      } catch (error: any) {
        console.error("Subscription error:", error);
        res.status(400).json({ error: error.message });
      }
    },
  );

  // Get user's subscription
  app.get("/api/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const subscription = await storage.getActiveSubscription(userId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Get user's downloads
  app.get("/api/downloads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const downloads = await storage.getDownloadHistory(userId);
      res.json({ downloads });
    } catch (error) {
      console.error("Error fetching downloads:", error);
      res.status(500).json({ message: "Failed to fetch downloads" });
    }
  });

  // Notes routes
  app.get("/api/notes", async (req, res) => {
    try {
      const {
        subject,
        classGrade,
        search,
        categoryId,
        page = "1",
        limit = "20",
      } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const { notes, total } = await storage.getPublishedNotes({
        subject: subject as string,
        classGrade: classGrade as string,
        search: search as string,
        categoryId: categoryId as string,
        limit: parseInt(limit as string),
        offset,
      });

      res.json({
        notes,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
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

  app.post(
    "/api/notes",
    isAuthenticated,
    upload.array("files"),
    async (req: any, res) => {
      const userId = getUserId(req);

      try {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const { title, subject, topic, classGrade, description, categoryId, chapter, unit } =
          req.body;
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
          return res.status(400).json({ message: "At least one file is required" });
        }

        // Process uploaded files with better organization
        const attachments = files.map((file) => {
          // Create organized file path: /uploads/userId/subject/filename
          const organizedPath = `/uploads/${userId}/${subject}/${file.filename}`;
          
          // Ensure directory exists
          const uploadDir = path.join(process.cwd(), 'uploads', userId, subject);
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          // Move file to organized location
          const oldPath = file.path;
          const newPath = path.join(process.cwd(), organizedPath.substring(1)); // Remove leading slash
          
          try {
            fs.renameSync(oldPath, newPath);
          } catch (err) {
            console.error('Error moving file:', err);
            // If move fails, keep original path
            return `/uploads/${file.filename}`;
          }
          
          return organizedPath;
        });

        // Create note with submitted status (ready for review)
        const note = await storage.createNote({
          title,
          subject,
          topic: chapter || unit || topic, // Use chapter/unit if provided, fallback to topic
          classGrade,
          description,
          attachments,
          topperId: userId, // All users can upload, but we keep this field for compatibility
          status: "submitted", // Submit directly for review
          categoryId: categoryId || null,
        });

        // Award 20 coins immediately for upload
        await storage.updateUserCoins(userId, 20);
        
        // Record transaction
        await storage.recordTransaction(
          userId,
          "upload_reward",
          20,
          20,
          note.id,
          "Earned 20 coins for uploading notes"
        );

        // Create review task for admin approval
        await storage.createReviewTask({
          noteId: note.id,
          status: "open",
        });

        // Update user stats
        await storage.updateUserStats(userId, { subject, noteId: note.id });

        // Record activity for admin panel
        try {
          await storage.recordUserActivity(userId, 'note_uploaded', {
            noteId: note.id,
            noteTitle: title,
            subject,
            classGrade,
            coinsEarned: 20,
            fileCount: files.length
          });
        } catch (error) {
          console.error('Failed to record upload activity:', error);
        }

        // Sync note to Firebase for admin panel (async, don't wait for it)
        const noteUser = await storage.getUser(userId);
        syncNoteToFirebase({
          id: note.id,
          title,
          description,
          subject,
          category: classGrade,
          userId,
          userEmail: noteUser?.email || 'unknown',
          fileName: files.map(f => f.originalname).join(', '),
          fileSize: files.reduce((total, f) => total + f.size, 0),
          fileType: files[0]?.mimetype || 'unknown',
          filePath: attachments[0] || '',
          price: 0,
          isPremium: false,
          tags: [subject, classGrade].filter(Boolean),
          createdAt: new Date().toISOString(),
          uploadIP: req.ip,
          uploadUserAgent: req.get('User-Agent')
        }).catch(syncError => {
          console.error('Firebase note sync error:', syncError);
        });

        res.json({
          ...note,
          coinsEarned: 20,
          message: "Notes uploaded successfully! You earned 20 coins."
        });
      } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ message: "Failed to create note" });
      }
    },
  );

  app.put("/api/notes/:id/submit", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const note = await storage.getNoteById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      if (note.topperId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Update note status to submitted
      const updatedNote = await storage.updateNoteStatus(
        req.params.id,
        "submitted",
      );

      // Create review task
      await storage.createReviewTask({
        noteId: req.params.id,
        status: "open",
      });

      res.json(updatedNote);
    } catch (error) {
      console.error("Error submitting note:", error);
      res.status(500).json({ message: "Failed to submit note" });
    }
  });

  app.post(
    "/api/notes/:id/download",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);

      try {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Check subscription
        const subscription = await storage.getActiveSubscription(userId);
        if (!subscription) {
          return res
            .status(403)
            .json({ message: "Active subscription required" });
        }

        const note = await storage.getNoteById(req.params.id);
        if (!note || note.status !== "published") {
          return res.status(404).json({ message: "Note not found" });
        }

        // Record download
        await storage.recordDownload(userId, req.params.id);

        res.json({
          message: "Download recorded",
          downloadUrl: note.attachments,
        });
      } catch (error) {
        console.error("Error downloading note:", error);
        res.status(500).json({ message: "Failed to download note" });
      }
    },
  );

  // Feedback routes
  app.post(
    "/api/notes/:id/feedback",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);
      const { rating, comment } = req.body;

      try {
        // Check if user already gave feedback
        const existingFeedback = await storage.getFeedbackByStudent(
          userId,
          req.params.id,
        );
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
    },
  );

  // Review routes (for reviewers/admins)
  app.get("/api/review/queue", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const tasks = await storage.getReviewTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching review queue:", error);
      res.status(500).json({ message: "Failed to fetch review queue" });
    }
  });

  app.put("/api/review/:id/approve", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const task = await storage.updateReviewTask(req.params.id, {
        status: "approved",
        decidedAt: new Date(),
        reviewerId: userId,
      });

      // Update note status to approved/published
      const note = await storage.updateNoteStatus(
        task.noteId,
        "published",
        userId,
      );

      res.json({ task, note });
    } catch (error) {
      console.error("Error approving note:", error);
      res.status(500).json({ message: "Failed to approve note" });
    }
  });

  app.put("/api/review/:id/reject", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const { comments } = req.body;

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const task = await storage.updateReviewTask(req.params.id, {
        status: "rejected",
        comments: comments || [],
        decidedAt: new Date(),
        reviewerId: userId,
      });

      // Update note status to rejected
      const note = await storage.updateNoteStatus(
        task.noteId,
        "rejected",
        userId,
      );

      res.json({ task, note });
    } catch (error) {
      console.error("Error rejecting note:", error);
      res.status(500).json({ message: "Failed to reject note" });
    }
  });

  // Uploader Profile Routes
  app.get("/api/uploader/stats", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "topper" && user.role !== "admin")) {
        return res
          .status(403)
          .json({ message: "Access denied - Toppers only" });
      }

      const stats = await storage.getUploaderStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching uploader stats:", error);
      res.status(500).json({ message: "Failed to fetch uploader stats" });
    }
  });

  app.get("/api/withdrawals", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "topper" && user.role !== "admin")) {
        return res
          .status(403)
          .json({ message: "Access denied - Toppers only" });
      }

      const withdrawals = await storage.getWithdrawalRequests(userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      res.status(500).json({ message: "Failed to fetch withdrawal requests" });
    }
  });

  app.post(
    "/api/withdrawals/request",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);
      const { amount, coins, bankDetails, upiId } = req.body;

      try {
        const user = await storage.getUser(userId);
        if (!user || (user.role !== "topper" && user.role !== "admin")) {
          return res
            .status(403)
            .json({ message: "Access denied - Toppers only" });
        }

        // Check minimum withdrawal amount
        if (amount < 200) {
          return res
            .status(400)
            .json({ message: "Minimum withdrawal amount is ₹200" });
        }

        // Check wallet balance (assuming 1 rupee = 20 coins)
        const walletBalance = Math.floor(user.totalEarned / 20);
        if (amount > walletBalance) {
          return res
            .status(400)
            .json({ message: "Insufficient wallet balance" });
        }

        const withdrawal = await storage.createWithdrawalRequest({
          topperId: userId,
          amount,
          coins,
          bankDetails,
          upiId,
          status: "pending",
        });

        res.json(withdrawal);
      } catch (error) {
        console.error("Error creating withdrawal request:", error);
        res
          .status(500)
          .json({ message: "Failed to create withdrawal request" });
      }
    },
  );

  // Admin withdrawal management endpoints
  app.get("/api/admin/withdrawals", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admins only" });
      }

      const withdrawals = await storage.getAllWithdrawalRequests();
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching all withdrawal requests:", error);
      res.status(500).json({ message: "Failed to fetch withdrawal requests" });
    }
  });

  app.patch(
    "/api/admin/withdrawals/:id/approve",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);
      const { id } = req.params;

      try {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res
            .status(403)
            .json({ message: "Access denied - Admins only" });
        }

        const withdrawal = await storage.approveWithdrawalRequest(id, userId);
        res.json(withdrawal);
      } catch (error) {
        console.error("Error approving withdrawal request:", error);
        res
          .status(500)
          .json({ message: "Failed to approve withdrawal request" });
      }
    },
  );

  app.patch(
    "/api/admin/withdrawals/:id/reject",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);
      const { id } = req.params;
      const { rejectionReason } = req.body;

      try {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res
            .status(403)
            .json({ message: "Access denied - Admins only" });
        }

        const withdrawal = await storage.rejectWithdrawalRequest(
          id,
          userId,
          rejectionReason,
        );
        res.json(withdrawal);
      } catch (error) {
        console.error("Error rejecting withdrawal request:", error);
        res
          .status(500)
          .json({ message: "Failed to reject withdrawal request" });
      }
    },
  );

  app.patch(
    "/api/admin/withdrawals/:id/settle",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);
      const { id } = req.params;
      const { settlementComments } = req.body;

      try {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res
            .status(403)
            .json({ message: "Access denied - Admins only" });
        }

        const withdrawal = await storage.settleWithdrawalRequest(
          id,
          userId,
          settlementComments,
        );
        res.json(withdrawal);
      } catch (error) {
        console.error("Error settling withdrawal request:", error);
        res
          .status(500)
          .json({ message: "Failed to settle withdrawal request" });
      }
    },
  );

  // Analytics routes
  app.get("/api/analytics/topper", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "topper") {
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
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Get all notes for admin (including pending reviews)
  app.get("/api/admin/notes", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { status, subject, page = "1", limit = "20" } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Get all notes (not just published ones)
      const { notes, total } = await storage.getAllNotesForAdmin({
        status: status as string,
        subject: subject as string,
        limit: parseInt(limit as string),
        offset,
      });

      res.json({
        notes,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    } catch (error) {
      console.error("Error fetching admin notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  // Real-time user activity endpoints
  app.get("/api/admin/user-activity", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const activity = await storage.getUserActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  app.get("/api/user/my-activity", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const activity = await storage.getUserActivityById(userId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Follow routes
  app.post("/api/follow/:topperId", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const follow = await storage.followTopper(userId, req.params.topperId);
      res.json(follow);
    } catch (error) {
      console.error("Error following topper:", error);
      res.status(500).json({ message: "Failed to follow topper" });
    }
  });

  app.delete(
    "/api/follow/:topperId",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);

      try {
        await storage.unfollowTopper(userId, req.params.topperId);
        res.json({ message: "Unfollowed successfully" });
      } catch (error) {
        console.error("Error unfollowing topper:", error);
        res.status(500).json({ message: "Failed to unfollow topper" });
      }
    },
  );

  // Coin System Routes

  // Admin endpoint to sync coins from Firebase admin system
  app.post("/api/admin/sync-coins", async (req: any, res) => {
    const adminKey = req.headers['x-admin-key'];
    
    // Verify admin key
    if (adminKey !== 'masterstudent_admin_2024_secure_key') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { userId, coinAmount, reason, source } = req.body;
    
    if (!userId || !coinAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    try {
      // Update user's coin balance in PostgreSQL
      await storage.updateUserCoins(userId, coinAmount);
      
      // Record the transaction
      await storage.recordTransaction(
        userId,
        'reward',
        0, // No money amount
        coinAmount,
        undefined, // No specific note ID
        `${reason} (${source})`
      );
      
      console.log(`✅ Synced ${coinAmount} coins to user ${userId} from ${source}`);
      
      res.json({
        success: true,
        message: 'Coins synced successfully',
        userId,
        coinAmount
      });
    } catch (error) {
      console.error('Error syncing coins:', error);
      res.status(500).json({ message: 'Failed to sync coins' });
    }
  });

  // Get user's coin balance and stats
  app.get("/api/coins/balance", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        coinBalance: user.coinBalance || 0,
        freeDownloadsLeft: user.freeDownloadsLeft || 3,
        totalEarned: user.totalEarned || 0,
        totalSpent: user.totalSpent || 0,
        reputation: user.reputation || 0,
        streak: user.streak || 0,
      });
    } catch (error) {
      console.error("Error fetching coin balance:", error);
      res.status(500).json({ message: "Failed to fetch coin balance" });
    }
  });

  // Get real user profile statistics
  app.get("/api/profile/stats", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's uploaded notes count
      const userNotes = await storage.getNotesByUser(userId);
      const notesUploaded = userNotes.length;
      
      // Get user's download history
      const downloads = await storage.getDownloadHistory(userId);
      const totalDownloads = downloads.length;
      
      // Calculate average rating from user's notes (using averageRating field)
      const notesWithRatings = userNotes.filter((note: any) => note.averageRating && note.averageRating > 0);
      const averageRating = notesWithRatings.length > 0 
        ? notesWithRatings.reduce((sum: number, note: any) => sum + (note.averageRating || 0), 0) / notesWithRatings.length
        : 0;
      
      // Get approved notes count (status = 'approved' or 'published')
      const approvedNotes = userNotes.filter((note: any) => note.status === 'approved' || note.status === 'published').length;
      
      // Get pending notes count (status = 'submitted')
      const pendingNotes = userNotes.filter((note: any) => note.status === 'submitted').length;

      res.json({
        notesUploaded,
        approvedNotes,
        pendingNotes,
        totalDownloads,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        coinBalance: user.coinBalance || 0,
        totalEarned: user.totalEarned || 0,
        totalSpent: user.totalSpent || 0,
        reputation: user.reputation || 0,
        streak: user.streak || 0,
        freeDownloadsLeft: user.freeDownloadsLeft || 3
      });
    } catch (error) {
      console.error("Error fetching profile stats:", error);
      res.status(500).json({ message: "Failed to fetch profile stats" });
    }
  });

  // Track note view and award coins
  app.post(
    "/api/notes/:noteId/view",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);
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

        // Award coins for viewing (only once per day per note)
        const hasViewedToday = await storage.hasUserViewedNoteToday(userId, noteId);
        let coinsEarned = 0;
        
        if (!hasViewedToday) {
          coinsEarned = 2; // 2 coins for viewing a note
          await storage.updateUserCoins(userId, coinsEarned);
          await storage.recordNoteView(userId, noteId, coinsEarned);
          await storage.recordTransaction(userId, 'coin_earned', 0, coinsEarned, noteId, `Earned ${coinsEarned} coins for viewing note`);
        }

        // Increment view count
        await storage.incrementNoteViews(noteId);

        // Record activity for admin panel
        try {
          await storage.recordUserActivity(userId, 'note_viewed', {
            noteId,
            noteTitle: note?.title || 'Unknown Note',
            coinsEarned
          });
        } catch (error) {
          console.error('Failed to record note view activity:', error);
        }

        res.json({
          coinsEarned,
          message: coinsEarned > 0 ? "Coins earned!" : "View recorded",
        });
      } catch (error) {
        console.error("Error recording note view:", error);
        res.status(500).json({ message: "Failed to record view" });
      }
    },
  );

  // Like/unlike a note
  app.post(
    "/api/notes/:noteId/like",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);
      const { noteId } = req.params;

      try {
        const isLiked = await storage.toggleNoteLike(userId, noteId);
        const likesCount = await storage.getNoteLikesCount(noteId);

        res.json({ isLiked, likesCount });
      } catch (error) {
        console.error("Error toggling note like:", error);
        res.status(500).json({ message: "Failed to toggle like" });
      }
    },
  );

  // Download note (with coin deduction or free download)
  app.post(
    "/api/notes/:noteId/download",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);
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
          await storage.recordTransaction(
            userId,
            "download_free",
            0,
            0,
            noteId,
            "Free download used",
          );
        } else if (user.coinBalance >= note.price) {
          // Use coins to download
          coinsSpent = note.price;
          await storage.updateUserCoins(userId, -coinsSpent);
          await storage.recordTransaction(
            userId,
            "download_paid",
            coinsSpent,
            -coinsSpent,
            noteId,
            "Paid download with coins",
          );

          // Award coins to note creator (50% of price)
          const creatorEarnings = Math.floor(coinsSpent * 0.5);
          await storage.updateUserCoins(note.topperId, creatorEarnings);
          await storage.recordTransaction(
            note.topperId,
            "coin_earned",
            creatorEarnings,
            creatorEarnings,
            noteId,
            "Earned from note download",
          );
        } else {
          return res.status(400).json({
            message: "Insufficient coins and no free downloads left",
            required: note.price,
            current: user.coinBalance,
          });
        }

        // Record the download
        await storage.recordDownload(userId, noteId);
        await storage.incrementNoteDownloads(noteId);

        // Record activity for admin panel
        try {
          await storage.recordUserActivity(userId, 'note_downloaded', {
            noteId,
            noteTitle: note?.title || 'Unknown Note',
            usedFreeDownload,
            coinsSpent,
            downloadType: usedFreeDownload ? 'free' : 'paid'
          });
        } catch (error) {
          console.error('Failed to record download activity:', error);
        }

        res.json({
          message: "Download successful",
          usedFreeDownload,
          coinsSpent,
          downloaded: true,
        });
      } catch (error) {
        console.error("Error downloading note:", error);
        res.status(500).json({ message: "Failed to download note" });
      }
    },
  );

  // Get coin packages for purchase
  app.get("/api/coins/packages", async (req, res) => {
    try {
      const packages = await storage.getCoinPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching coin packages:", error);
      res.status(500).json({ message: "Failed to fetch coin packages" });
    }
  });

  // Get transaction history
  app.get("/api/coins/transactions", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const { page = 1, limit = 20 } = req.query;

    try {
      const transactions = await storage.getUserTransactions(
        userId,
        parseInt(page as string),
        parseInt(limit as string),
      );
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    const { type = "earnings", limit = 50 } = req.query;

    try {
      const leaderboard = await storage.getLeaderboard(
        type as string,
        parseInt(limit as string),
      );
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get daily challenges
  app.get("/api/challenges/daily", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const challenges = await storage.getDailyChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching daily challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Complete daily challenge
  app.post(
    "/api/challenges/:challengeId/complete",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);
      const { challengeId } = req.params;

      try {
        const result = await storage.completeDailyChallenge(
          userId,
          challengeId,
        );
        if (result.completed) {
          res.json({
            message: "Challenge completed!",
            coinsEarned: result.coinsEarned,
          });
        } else {
          res.json({
            message: "Challenge not yet completed",
            progress: result.progress,
          });
        }
      } catch (error) {
        console.error("Error completing challenge:", error);
        res.status(500).json({ message: "Failed to complete challenge" });
      }
    },
  );

  // Educational categories routes with fallback
  app.get("/api/educational-categories", async (req, res) => {
    const categoryType = req.query.categoryType as string;

    try {
      const raw = await storage.getEducationalCategories();
      let categories = Array.isArray(raw) ? raw : [];

      // Filter by categoryType if provided
      if (categoryType) {
        categories = categories.filter(
          (cat) => cat.categoryType === categoryType,
        );
      }

      // If database is empty or no categories match filter, provide fallback categories
      if (categories.length === 0) {
        categories = [
          {
            id: "fallback-1",
            name: "Class 9th CBSE",
            description: "Class 9 CBSE Board",
            categoryType: "school",
            classLevel: "9",
            board: "CBSE",
            isActive: true,
            displayOrder: 10,
            icon: "📔",
            color: "#3B82F6",
          },
          {
            id: "fallback-2",
            name: "Class 10th CBSE",
            description: "Class 10 CBSE Board with Board Exams",
            categoryType: "school",
            classLevel: "10",
            board: "CBSE",
            isActive: true,
            displayOrder: 13,
            icon: "📕",
            color: "#3B82F6",
          },
          {
            id: "fallback-3",
            name: "Class 11th CBSE Science",
            description: "Class 11 CBSE Science Stream (PCM/PCB)",
            categoryType: "school",
            classLevel: "11",
            board: "CBSE",
            isActive: true,
            displayOrder: 16,
            icon: "🔬",
            color: "#F59E0B",
          },
          {
            id: "fallback-4",
            name: "Class 12th CBSE Science",
            description: "Class 12 CBSE Science Stream (PCM/PCB)",
            categoryType: "school",
            classLevel: "12",
            board: "CBSE",
            isActive: true,
            displayOrder: 20,
            icon: "🎓",
            color: "#F59E0B",
          },
          {
            id: "fallback-5",
            name: "JEE Main",
            description: "Joint Entrance Examination - Main",
            categoryType: "competitive_exam",
            examType: "JEE_Main",
            isActive: true,
            displayOrder: 30,
            icon: "⚙️",
            color: "#059669",
          },
          {
            id: "fallback-6",
            name: "NEET UG",
            description:
              "National Eligibility cum Entrance Test - Undergraduate",
            categoryType: "competitive_exam",
            examType: "NEET_UG",
            isActive: true,
            displayOrder: 32,
            icon: "🩺",
            color: "#7C3AED",
          },
        ];

        // Filter fallback categories by categoryType if provided
        if (categoryType) {
          categories = categories.filter(
            (cat) => cat.categoryType === categoryType,
          );
        }
      }

      res.json(categories);
    } catch (error) {
      console.error("Error fetching educational categories:", error);

      // Even if there's an error, provide basic categories
      const fallbackCategories = [
        {
          id: "emergency-1",
          name: "Class 10th CBSE",
          description: "Class 10 CBSE Board",
          categoryType: "school",
          isActive: true,
          displayOrder: 1,
          icon: "📚",
          color: "#3B82F6",
        },
        {
          id: "emergency-2",
          name: "Class 12th CBSE",
          description: "Class 12 CBSE Board",
          categoryType: "school",
          isActive: true,
          displayOrder: 2,
          icon: "🎓",
          color: "#F59E0B",
        },
        {
          id: "emergency-3",
          name: "JEE Main",
          description: "Joint Entrance Examination",
          categoryType: "competitive_exam",
          isActive: true,
          displayOrder: 3,
          icon: "⚙️",
          color: "#059669",
        },
      ];

      // Filter emergency fallback categories by categoryType if provided
      if (categoryType) {
        return res.json(
          fallbackCategories.filter((cat) => cat.categoryType === categoryType),
        );
      }

      res.json(fallbackCategories);
    }
  });

  // Complete onboarding
  app.post(
    "/api/complete-onboarding",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);
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
    },
  );

  // Get user educational preferences
  app.get(
    "/api/user-educational-preferences",
    isAuthenticated,
    async (req: any, res) => {
      const userId = getUserId(req);

      try {
        const preferences = await storage.getUserEducationalPreferences(userId);
        res.json(preferences);
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        res.status(500).json({ message: "Failed to fetch preferences" });
      }
    },
  );

  // Get user stats for home page
  app.get("/api/user/stats", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Get user subject-wise stats
  app.get("/api/user/subject-stats", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const subjectStats = await storage.getUserSubjectStats(userId);
      res.json(subjectStats);
    } catch (error) {
      console.error("Error fetching subject stats:", error);
      res.status(500).json({ message: "Failed to fetch subject stats" });
    }
  });

  // Update user stats after upload
  app.post("/api/user/stats/update", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const { subject, noteId } = req.body;

    try {
      await storage.updateUserStats(userId, { subject, noteId });
      res.json({ message: "Stats updated successfully" });
    } catch (error) {
      console.error("Error updating user stats:", error);
      res.status(500).json({ message: "Failed to update user stats" });
    }
  });

  // SEO Sitemap route
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://masterstudent.in";

      // Get all published notes for sitemap
      const { notes } = await storage.getPublishedNotes({
        limit: 1000,
        offset: 0,
      });
      const categories = await storage.getEducationalCategories();

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/catalog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>`;

      // Add category pages
      categories?.forEach((category: any) => {
        const categorySlug = category.name.toLowerCase().replace(/\s+/g, "-");
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
    <lastmod>${new Date(lastMod).toISOString().split("T")[0]}</lastmod>
  </url>`;
      });

      sitemap += `
</urlset>`;

      res.set("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).json({ message: "Failed to generate sitemap" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    // Basic file serving - in production, use proper file storage service
    const filePath = path.join(__dirname, "..", "uploads", req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // Register admin routes
  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
