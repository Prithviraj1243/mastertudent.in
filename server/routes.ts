import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { sendWelcomeEmail } from "./sendgrid";
// Firebase sync functions commented out - module not found
// import { 
//   syncUserToFirebase, 
//   syncNoteToFirebase, 
//   syncPaymentToFirebase,
//   syncSubscriptionToFirebase,
//   updateUserActivity 
// } from "./firebase-sync";
import dodoPayments from "./dodo-payments";
import { sendChatMessage, suggestedQuestions } from "./chatbot";
import crypto from "crypto";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadMultipleToSupabase } from "./supabase-storage";

// Helper function to get user ID from request
function getUserId(req: any): string {
  // Try req.user first (passport), then session.userId (Supabase)
  return req.user?.id || req.user?.sub || req.session?.userId || '';
}

// Stripe is optional - only initialize if key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

// Configure multer for file uploads
// Use /tmp directory for Render deployment (persistent uploads/ doesn't work on Render)
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp/uploads' : 'uploads/';

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
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
        lastSeen: new Date(),
        isOnline: true,
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
        
        // Sync user to Firebase (async, don't wait for it) - DISABLED
        // syncUserToFirebase({
        //   id: newUser.id,
        //   email: newUser.email,
        //   name: `${newUser.firstName} ${newUser.lastName}`,
        //   provider: 'email',
        //   subscription: 'free',
        //   isEmailVerified: false,
        //   createdAt: new Date().toISOString()
        // }).catch((syncError: any) => {
        //   console.error('Firebase sync error:', syncError);
        // });
        
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

  // Sync Supabase user with our database (NEW - Much easier!)
  app.post("/api/auth/sync-supabase-user", async (req, res) => {
    const { email, firstName, lastName, profileImageUrl, role, supabaseUserId } = req.body;

    console.log('🔄 Sync request received:', { email, firstName, lastName, role });

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      // Check if user exists in our database
      console.log('📊 Checking if user exists in database...');
      let user = await storage.getUserByEmail(email);
      console.log('✅ Database query successful. User found:', !!user);

      if (!user) {
        console.log('➕ Creating new user from Supabase auth...');
        const newUserData = {
          id: crypto.randomUUID(),
          email: email,
          firstName: firstName || email.split('@')[0],
          lastName: lastName || '',
          profileImageUrl: profileImageUrl || '',
          role: role || 'student',
          loginProvider: 'google',
          onboardingCompleted: true,
        };
        console.log('📝 New user data:', newUserData);
        
        user = await storage.upsertUser(newUserData);
        console.log('✅ User created successfully:', user.id);
      } else {
        console.log('✅ Existing user found:', user.id);
        // Update last_seen for existing user
        await storage.updateUserLastSeen(user.id, true);
      }

      // Set session
      req.session.userId = user.id;
      req.session.supabaseUserId = supabaseUserId;
      console.log('🔐 Session set for user:', user.id);
      
      req.session.save((sessionError: any) => {
        if (sessionError) {
          console.error("❌ Session save error during Supabase sync:", sessionError);
          return res.status(500).json({ message: "Failed to persist login session" });
        }

        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
          },
        });
      });
    } catch (error) {
      console.error("❌ Supabase user sync error:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Sync error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Google OAuth using Supabase Auth (OLD - keeping for backwards compatibility)
  app.post("/api/auth/google-supabase", async (req, res) => {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    try {
      // Decode the Google JWT token (no verification needed - Google already verified it)
      const { default: jwt } = await import('jsonwebtoken');
      const decoded = jwt.decode(credential) as any;
      
      if (!decoded || !decoded.email) {
        return res.status(401).json({ message: "Invalid Google token" });
      }

      console.log('Google user authenticated:', decoded.email);
      
      const googleUser = {
        email: decoded.email,
        given_name: decoded.given_name || decoded.email.split('@')[0],
        family_name: decoded.family_name || '',
        picture: decoded.picture || '',
      };
      
      // Check if user exists in our database
      let user = await storage.getUserByEmail(googleUser.email);

      if (!user) {
        console.log('Creating new user in database...');
        // Create new user in our database
        user = await storage.upsertUser({
          id: crypto.randomUUID(),
          email: googleUser.email,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          profileImageUrl: googleUser.picture,
          role: role || 'student',
          loginProvider: 'google',
          onboardingCompleted: true,
          lastSeen: new Date(),
          isOnline: true,
        });
        console.log('User created:', user.id);
      } else {
        console.log('Existing user found:', user.id);
        // Update last_seen for existing user
        await storage.updateUserLastSeen(user.id, true);
      }

      // Set session
      req.session.userId = user.id;

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Google Supabase OAuth error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Authentication error" 
      });
    }
  });


  // Get current user info endpoint
  app.get("/api/auth/me", async (req: any, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Decode the token
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        const user = await storage.getUser(decoded.id);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        return res.json({
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role
        });
      } catch (decodeError) {
        return res.status(401).json({ message: "Invalid token" });
      }
    } catch (error) {
      console.error("Auth me error:", error);
      res.status(500).json({ message: "Failed to get user info" });
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

        // Upload files to Supabase Storage
        console.log('📤 Uploading files to Supabase Storage...');
        const uploadResults = await uploadMultipleToSupabase(files, userId, subject);
        
        // Check for upload errors
        const failedUploads = uploadResults.filter(r => !r.success);
        if (failedUploads.length > 0) {
          console.error('❌ Upload failures:', failedUploads);
          return res.status(500).json({ 
            message: "Failed to upload some files to storage",
            errors: failedUploads.map(f => f.error)
          });
        }
        
        // Get file URLs from Supabase
        const attachments = uploadResults
          .filter(r => r.success && r.fileUrl)
          .map(r => r.fileUrl!);
        
        console.log('✅ Files uploaded to Supabase:', attachments.length);
        
        // Clean up temporary local files
        files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Error deleting temp file:', err);
          }
        });

        // Create note with submitted status (ready for review)
        // Only use categoryId if it's not a fallback/emergency category
        const validCategoryId = categoryId && !categoryId.startsWith('emergency-') && !categoryId.startsWith('fallback-') 
          ? categoryId 
          : null;
        
        const note = await storage.createNote({
          title,
          subject,
          topic: chapter || unit || topic, // Use chapter/unit if provided, fallback to topic
          classGrade,
          description,
          attachments,
          topperId: userId, // All users can upload, but we keep this field for compatibility
          status: "submitted", // Submit directly for review
          categoryId: validCategoryId,
        });

        // NO COINS YET - User will get 20 coins ONLY after admin approval

        // Create review task for admin approval
        await storage.createReviewTask({
          noteId: note.id,
          status: "open",
        });

        // Update user stats
        await storage.updateUserStats(userId, { subject, noteId: note.id });

        // Record activity
        try {
          await storage.recordUserActivity(userId, 'note_uploaded', {
            noteId: note.id,
            noteTitle: title,
            subject,
            classGrade,
            coinsEarned: 0, // No coins yet - will get after approval
            fileCount: files.length
          });
        } catch (error) {
          console.error('Failed to record upload activity:', error);
        }

        // Sync note to Firebase (async, don't wait for it) - DISABLED
        // const noteUser = await storage.getUser(userId);
        // syncNoteToFirebase({
        //   id: note.id,
        //   title,
        //   description,
        //   subject,
        //   category: classGrade,
        //   userId,
        //   userEmail: noteUser?.email || 'unknown',
        //   fileName: files.map(f => f.originalname).join(', '),
        //   fileSize: files.reduce((total, f) => total + f.size, 0),
        //   fileType: files[0]?.mimetype || 'unknown',
        //   filePath: attachments[0] || '',
        //   price: 0,
        //   isPremium: false,
        //   tags: [subject, classGrade].filter(Boolean),
        //   createdAt: new Date().toISOString(),
        //   uploadIP: req.ip,
        //   uploadUserAgent: req.get('User-Agent')
        // }).catch((syncError: any) => {
        //   console.error('Firebase note sync error:', syncError);
        // });

        res.json({
          ...note,
          coinsEarned: 0,
          message: "Notes uploaded successfully! You'll earn 20 coins after admin approval."
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


  // Uploader Profile Routes
  app.get("/api/uploader/stats", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "topper") {
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
      if (!user || user.role !== "topper") {
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
        if (!user || user.role !== "topper") {
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

        // Record activity
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

        // Record activity
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

  // Get user download history
  app.get("/api/user/downloads", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const downloads = await storage.getDownloadHistory(userId);
      
      // Enrich download data with note information
      const enrichedDownloads = await Promise.all(
        downloads.map(async (download: any) => {
          try {
            const note = await storage.getNote(download.noteId);
            return {
              id: download.id,
              noteId: download.noteId,
              noteTitle: note?.title || 'Unknown Note',
              downloadedAt: download.downloadedAt,
              subject: note?.subject,
              price: note?.price || 0,
            };
          } catch (error) {
            return {
              id: download.id,
              noteId: download.noteId,
              noteTitle: 'Unknown Note',
              downloadedAt: download.downloadedAt,
              subject: 'Unknown',
              price: 0,
            };
          }
        })
      );

      res.json(enrichedDownloads);
    } catch (error) {
      console.error("Error fetching download history:", error);
      res.status(500).json({ message: "Failed to fetch download history" });
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

  // Dodo Payments - Initiate payment for note download
  app.post(
    "/api/notes/:noteId/dodo-payment",
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

        // Generate unique order ID
        const orderId = `note-${noteId}-${userId}-${Date.now()}`;
        const amount = Math.round(note.price * 100); // Convert to paise

        // Create payment request with Dodo
        const paymentResponse = await dodoPayments.createPayment({
          projectId: process.env.DODO_PROJECT_ID || '',
          amount,
          currency: 'INR',
          orderId,
          customerEmail: user.email || '',
          customerPhone: user.phone || '',
          description: `Download: ${note.title}`,
          returnUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/download-notes?payment=success&orderId=${orderId}`,
          notifyUrl: `${process.env.SERVER_URL || 'http://localhost:8000'}/api/dodo-webhook`
        });

        if (!paymentResponse.success) {
          return res.status(400).json({
            success: false,
            error: paymentResponse.error || 'Failed to create payment'
          });
        }

        // Store pending payment info
        await storage.recordTransaction(
          userId,
          'download_pending',
          note.price,
          0,
          noteId,
          `Pending Dodo payment for note download - Order: ${orderId}`
        );

        res.json({
          success: true,
          paymentUrl: paymentResponse.paymentUrl,
          transactionId: paymentResponse.transactionId,
          orderId
        });
      } catch (error: any) {
        console.error("Dodo payment error:", error);
        res.status(500).json({
          success: false,
          error: error.message || 'Payment initiation failed'
        });
      }
    }
  );

  // Dodo Payments - Webhook for payment confirmation
  app.post("/api/dodo-webhook", async (req: any, res) => {
    try {
      const { transactionId, orderId, status, amount, signature } = req.body;

      // Verify webhook signature
      const isValid = dodoPayments.verifyWebhookSignature(
        {
          transactionId,
          orderId,
          status,
          amount,
          currency: 'INR',
          timestamp: new Date().toISOString()
        },
        signature
      );

      if (!isValid) {
        console.warn('Invalid Dodo webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      if (status === 'success') {
        // Extract userId and noteId from orderId format: note-{noteId}-{userId}-{timestamp}
        const parts = orderId.split('-');
        if (parts.length >= 3) {
          const noteId = parts[1];
          const userId = parts[2];

          const user = await storage.getUser(userId);
          const note = await storage.getNote(noteId);

          if (user && note) {
            // Check if already downloaded
            const hasDownloaded = await storage.hasUserDownloaded(userId, noteId);
            if (!hasDownloaded) {
              // Record the download
              await storage.recordDownload(userId, noteId);
              await storage.incrementNoteDownloads(noteId);

              // Update transaction status
              await storage.recordTransaction(
                userId,
                'download_paid',
                note.price,
                -note.price,
                noteId,
                `Dodo payment successful - Transaction: ${transactionId}`
              );

              // Award coins to note creator (50% of price)
              const creatorEarnings = Math.floor(note.price * 0.5);
              await storage.updateUserCoins(note.topperId, creatorEarnings);
              await storage.recordTransaction(
                note.topperId,
                'coin_earned',
                creatorEarnings,
                creatorEarnings,
                noteId,
                'Earned from note download (Dodo payment)'
              );

              // Record activity
              try {
                await storage.recordUserActivity(userId, 'note_downloaded', {
                  noteId,
                  noteTitle: note?.title || 'Unknown Note',
                  usedFreeDownload: false,
                  coinsSpent: note.price,
                  downloadType: 'paid',
                  paymentGateway: 'dodo',
                  transactionId
                });
              } catch (error) {
                console.error('Failed to record download activity:', error);
              }
            }
          }
        }
      } else if (status === 'failed') {
        // Handle failed payment
        const parts = orderId.split('-');
        if (parts.length >= 3) {
          const userId = parts[2];
          await storage.recordTransaction(
            userId,
            'download_failed',
            0,
            0,
            '',
            `Dodo payment failed - Order: ${orderId}`
          );
        }
      }

      res.json({ success: true, message: 'Webhook processed' });
    } catch (error: any) {
      console.error('Dodo webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Verify Dodo payment status
  app.get(
    "/api/dodo-payment/:transactionId/status",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const { transactionId } = req.params;

        const result = await dodoPayments.verifyPayment(transactionId);

        res.json(result);
      } catch (error: any) {
        console.error("Payment status check error:", error);
        res.status(500).json({
          success: false,
          error: error.message || 'Status check failed'
        });
      }
    }
  );


  // ===== CHATBOT ROUTES =====
  
  // Send message to chatbot
  app.post("/api/chatbot/chat", async (req: any, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Use user ID if authenticated, otherwise use a guest ID
      const userId = req.user?.id || `guest-${Date.now()}`;
      
      const response = await sendChatMessage(userId, message);
      
      res.json({
        success: true,
        message: response,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      console.error("Chatbot error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to process message",
      });
    }
  });

  // Get suggested questions
  app.get("/api/chatbot/suggestions", (req, res) => {
    try {
      res.json({
        success: true,
        suggestions: suggestedQuestions,
      });
    } catch (error: any) {
      console.error("Error fetching suggestions:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch suggestions",
      });
    }
  });

  // Chatbot health check
  app.get("/api/chatbot/health", (req, res) => {
    try {
      const hasApiKey = !!process.env.GEMINI_API_KEY;
      res.json({
        success: true,
        status: "healthy",
        geminiConfigured: hasApiKey,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: "unhealthy",
      });
    }
  });


  // Health check endpoint
  app.get("/api/health", (req, res) => {
    try {
      res.json({
        status: "healthy",
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
      });
    }
  });

  // ===== ADMIN ROUTES =====
  // Review queue route for toppers/reviewers
  app.get("/api/review/queue", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only toppers and admins can access review queue
      if (user.role !== "topper" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Topper or Admin only" });
      }

      // Get notes pending review
      const { notes } = await storage.getAllNotesForAdmin({
        status: "submitted",
        limit: 50,
        offset: 0,
      });

      res.json(notes);
    } catch (error) {
      console.error("Error fetching review queue:", error);
      res.status(500).json({ message: "Failed to fetch review queue" });
    }
  });

  // Admin routes - protected by authentication and admin role check
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Admin dashboard stats endpoint (no auth check - uses admin session)
  app.get("/api/admin/dashboard-stats", async (req: any, res) => {
    try {
      // Check admin session
      const isAdminAuthenticated = req.session?.adminAccountId && req.session?.isAdmin;
      
      if (!isAdminAuthenticated) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      // Get all stats
      const allUsers = await storage.getAllUsers();
      const allNotesResult = await storage.getAllNotesForAdmin({ limit: 10000 });
      const allNotes = allNotesResult.notes;
      const allDownloads = await storage.getAllDownloads();
      
      // Calculate stats
      const totalUsers = allUsers.length;
      const totalNotes = allNotes.length;
      const totalDownloads = allDownloads.length;
      const approvedNotes = allNotes.filter((n: any) => n.status === 'approved').length;
      const rejectedNotes = allNotes.filter((n: any) => n.status === 'rejected').length;
      const pendingApprovals = allNotes.filter((n: any) => n.status === 'submitted').length;
      const activeUsers = allUsers.filter((u: any) => u.isOnline).length;
      
      // Calculate total revenue (sum of all coins earned)
      const totalRevenue = allUsers.reduce((sum: number, u: any) => sum + (u.totalEarned || 0), 0);

      // Get recent activity (last 10 activities)
      const recentNotes = allNotes
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((note: any) => {
          const uploader = allUsers.find((u: any) => u.id === note.uploaderId);
          return {
            id: note.id,
            type: 'note_upload',
            title: note.title,
            user: uploader ? `${uploader.firstName} ${uploader.lastName}`.trim() || uploader.email : 'Unknown User',
            time: note.createdAt,
            status: note.status
          };
        });

      const recentDownloads = allDownloads
        .sort((a: any, b: any) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime())
        .slice(0, 5)
        .map((download: any) => {
          const note = allNotes.find((n: any) => n.id === download.noteId);
          const user = allUsers.find((u: any) => u.id === download.userId);
          return {
            id: download.id,
            type: 'download',
            title: note?.title || 'Unknown Note',
            user: user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'Unknown User',
            time: download.downloadedAt,
          };
        });

      // Merge and sort recent activity
      const recentActivity = [...recentNotes, ...recentDownloads]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);

      // Get top performing notes (by download count)
      const noteDownloadCounts = allDownloads.reduce((acc: any, download: any) => {
        acc[download.noteId] = (acc[download.noteId] || 0) + 1;
        return acc;
      }, {});

      const topNotes = allNotes
        .filter((note: any) => note.status === 'approved')
        .map((note: any) => ({
          id: note.id,
          title: note.title,
          subject: note.subject,
          downloads: noteDownloadCounts[note.id] || 0,
          uploader: allUsers.find((u: any) => u.id === note.uploaderId)?.firstName || 'Unknown',
          rating: note.rating || 0,
        }))
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 5);

      res.json({
        totalUsers,
        totalNotes,
        approvedNotes,
        rejectedNotes,
        totalDownloads,
        totalRevenue,
        pendingApprovals,
        activeUsers,
        recentActivity,
        topNotes
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get all users for admin
  app.get("/api/admin/users", async (req: any, res) => {
    try {
      // Check if admin is authenticated (using separate admin session)
      console.log('Admin session check:', { 
        adminAccountId: req.session?.adminAccountId, 
        isAdmin: req.session?.isAdmin,
        session: req.session 
      });
      const isAdminAuthenticated = req.session?.adminAccountId && req.session?.isAdmin;
      
      if (!isAdminAuthenticated) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const allUsers = await storage.getAllUsers();
      
      // Enrich user data with stats
      const enrichedUsers = await Promise.all(
        allUsers.map(async (user: any) => {
          const userNotes = await storage.getNotesByUser(user.id);
          const downloads = await storage.getDownloadHistory(user.id);
          
          return {
            ...user,
            totalUploads: userNotes.length,
            totalDownloads: downloads.length,
            status: user.status || 'active',
          };
        })
      );
      
      res.json(enrichedUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all notes for admin (including pending reviews)
  app.get("/api/admin/notes", async (req: any, res) => {
    try {
      // Check if admin is authenticated (using session)
      const isAdmin = req.session?.adminAccountId && req.session?.isAdmin;
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const { status, subject, search, page = "1", limit = "20" } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      console.log(`📋 Admin fetching notes - Status: ${status}, Search: "${search}", Page: ${page}`);

      const { notes, total } = await storage.getAllNotesForAdmin({
        status: status as string,
        subject: subject as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset,
      });

      console.log(`✅ Fetched ${notes.length} notes out of ${total} total`);

      res.json({
        notes,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    } catch (error) {
      console.error("❌ Error fetching admin notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  // ========== EARNINGS & WITHDRAWAL ROUTES ==========
  
  // Get earnings stats
  app.get("/api/earnings/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get pending withdrawals total
      const pendingWithdrawals = await storage.getPendingWithdrawalsTotal(userId);
      const totalWithdrawn = await storage.getTotalWithdrawn(userId);

      res.json({
        coinBalance: user.coinBalance || 0,
        totalEarned: user.totalEarned || 0,
        pendingWithdrawals,
        totalWithdrawn,
        availableForWithdrawal: Math.max(0, (user.coinBalance || 0) - pendingWithdrawals),
      });
    } catch (error) {
      console.error("Error fetching earnings stats:", error);
      res.status(500).json({ message: "Failed to fetch earnings stats" });
    }
  });

  // Get withdrawal requests
  app.get("/api/earnings/withdrawals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const withdrawals = await storage.getWithdrawalRequests(userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  // Get earning transactions
  app.get("/api/earnings/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const transactions = await storage.getEarningTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Request withdrawal
  app.post("/api/earnings/withdraw", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { coins, amount, upiId, bankDetails } = req.body;

      // Validate minimum withdrawal
      const COINS_PER_RUPEE = 20;
      const MINIMUM_WITHDRAWAL_COINS = 200;
      const MINIMUM_WITHDRAWAL_RUPEES = MINIMUM_WITHDRAWAL_COINS / COINS_PER_RUPEE;
      if (coins < MINIMUM_WITHDRAWAL_COINS) {
        return res.status(400).json({ 
          message: `Minimum withdrawal is ${MINIMUM_WITHDRAWAL_COINS} coins (₹${MINIMUM_WITHDRAWAL_RUPEES})` 
        });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check available balance (excluding pending withdrawals)
      const pendingWithdrawals = await storage.getPendingWithdrawalsTotal(userId);
      const availableBalance = (user.coinBalance || 0) - pendingWithdrawals;

      if (coins > availableBalance) {
        return res.status(400).json({ 
          message: "Insufficient balance. You have pending withdrawal requests." 
        });
      }

      if (!upiId && !bankDetails) {
        return res.status(400).json({ 
          message: "Please provide either UPI ID or bank details" 
        });
      }

      // Create withdrawal request
      let parsedBankDetails: any = undefined;
      if (bankDetails) {
        try {
          parsedBankDetails = typeof bankDetails === 'string' ? JSON.parse(bankDetails) : bankDetails;
        } catch {
          parsedBankDetails = { text: String(bankDetails) };
        }
      }
      const withdrawal = await storage.createWithdrawalRequest({
        topperId: userId,
        amount,
        coins,
        upiId: upiId || undefined,
        bankDetails: parsedBankDetails,
        status: 'pending',
      });

      // Create notification
      await storage.createNotification({
        userId,
        type: "withdrawal_requested",
        title: "Withdrawal Request Submitted",
        body: `Your request to withdraw ₹${amount} (${coins} coins) is being processed.`,
        link: `/earnings`,
      });

      // Notify all admins so request is visible in admin workflows.
      try {
        const allUsers = await storage.getAllUsers();
        const admins = allUsers.filter((u: any) => u.role === "admin");
        await Promise.all(
          admins.map((admin: any) =>
            storage.createNotification({
              userId: admin.id,
              type: "admin_withdrawal_request",
              title: "New Withdrawal Request",
              body: `${user.email || "A user"} requested withdrawal of ₹${amount} (${coins} coins).`,
              link: `/admin/coins`,
            })
          )
        );
      } catch (notifyError) {
        console.error("Failed to create admin withdrawal notifications:", notifyError);
      }

      res.json({
        success: true,
        withdrawal,
        message: "Withdrawal request submitted successfully",
      });
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      res.status(500).json({ message: "Failed to create withdrawal request" });
    }
  });

  // Approve note (admin only) - Awards 20 coins to uploader
  app.post("/api/admin/notes/:noteId/approve", async (req: any, res) => {
    try {
      // Check if admin is authenticated (using session)
      const isAdmin = req.session?.adminAccountId && req.session?.isAdmin;
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const note = await storage.getNoteById(req.params.noteId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      // Prevent duplicate rewards/approvals for already processed notes
      if (note.status !== "submitted") {
        return res.status(400).json({
          message: `Only submitted notes can be approved. Current status: ${note.status}`,
        });
      }

      // Update note status to approved
      const updatedNote = await storage.updateNoteStatus(req.params.noteId, "approved");

      // Award 20 coins to the uploader for approved note
      await storage.updateUserCoins(note.topperId, 20);
      
      // Record transaction
      await storage.recordTransaction(
        note.topperId,
        "coin_earned",
        20,
        20,
        note.id,
        "Earned 20 coins for note approval"
      );

      // Create notification for uploader
      await storage.createNotification({
        userId: note.topperId,
        type: "note_approved",
        title: "Note Approved! 🎉",
        body: `Your note "${note.title}" has been approved! You earned 20 coins.`,
        link: `/note-detail/${note.id}`,
      });

      // Update review task status
      const reviewTask = await storage.getReviewTaskByNoteId(req.params.noteId);
      if (reviewTask) {
        await storage.updateReviewTaskStatus(reviewTask.id, "approved");
      }

      // Log admin activity
      try {
        await storage.recordAdminActivity(userId, 'note_approved', 'note', req.params.noteId, {
          noteTitle: note.title,
          uploader: note.topperId,
          coinsAwarded: 20
        });
      } catch (error) {
        console.error('Failed to log admin activity:', error);
      }

      res.json({ 
        success: true, 
        note: updatedNote,
        message: "Note approved successfully! User awarded 20 coins.",
        coinsAwarded: 20
      });
    } catch (error) {
      console.error("Error approving note:", error);
      res.status(500).json({ message: "Failed to approve note" });
    }
  });

  // Reject note (admin only)
  app.post("/api/admin/notes/:noteId/reject", async (req: any, res) => {
    const { reason } = req.body;

    try {
      // Check if admin is authenticated (using session)
      const isAdmin = req.session?.adminAccountId && req.session?.isAdmin;
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const note = await storage.getNoteById(req.params.noteId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      // Update note status to rejected
      const updatedNote = await storage.updateNoteStatus(req.params.noteId, "rejected");

      // Create notification for uploader
      await storage.createNotification({
        userId: note.topperId,
        type: "note_rejected",
        title: "Note Rejected",
        body: `Your note "${note.title}" was rejected. Reason: ${reason || "Quality standards not met"}`,
        link: `/upload-notes`,
      });

      // Update review task status
      const reviewTask = await storage.getReviewTaskByNoteId(req.params.noteId);
      if (reviewTask) {
        await storage.updateReviewTaskStatus(reviewTask.id, "rejected");
      }

      // Log admin activity
      try {
        await storage.recordAdminActivity(userId, 'note_rejected', 'note', req.params.noteId, {
          noteTitle: note.title,
          uploader: note.topperId,
          reason: reason || "Not specified"
        });
      } catch (error) {
        console.error('Failed to log admin activity:', error);
      }

      res.json({ 
        success: true, 
        note: updatedNote,
        message: "Note rejected successfully."
      });
    } catch (error) {
      console.error("Error rejecting note:", error);
      res.status(500).json({ message: "Failed to reject note" });
    }
  });

  // ========== ADMIN WITHDRAWAL MANAGEMENT ==========
  app.get("/api/admin/withdrawals", async (req: any, res) => {
    try {
      const isAdmin = req.session?.adminAccountId && req.session?.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const withdrawals = await storage.getAllWithdrawalRequests();
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching admin withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawal requests" });
    }
  });

  app.post("/api/admin/withdrawals/:id/approve", async (req: any, res) => {
    try {
      const isAdmin = req.session?.adminAccountId && req.session?.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const adminId = req.session.adminAccountId;
      const withdrawal = await storage.approveWithdrawalRequest(req.params.id, adminId);

      await storage.createNotification({
        userId: withdrawal.topperId,
        type: "withdrawal_approved",
        title: "Withdrawal Approved",
        body: `Your withdrawal request for ₹${withdrawal.amount} has been approved. Payout will be processed within 24 hours.`,
        link: "/earnings",
      });

      res.json({ success: true, withdrawal });
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      res.status(500).json({ message: "Failed to approve withdrawal request" });
    }
  });

  app.post("/api/admin/withdrawals/:id/reject", async (req: any, res) => {
    try {
      const isAdmin = req.session?.adminAccountId && req.session?.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const adminId = req.session.adminAccountId;
      const reason = req.body?.reason || "Request rejected by admin";
      const withdrawal = await storage.rejectWithdrawalRequest(req.params.id, adminId, reason);

      await storage.createNotification({
        userId: withdrawal.topperId,
        type: "withdrawal_rejected",
        title: "Withdrawal Rejected",
        body: `Your withdrawal request for ₹${withdrawal.amount} was rejected. Reason: ${reason}`,
        link: "/earnings",
      });

      res.json({ success: true, withdrawal });
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      res.status(500).json({ message: "Failed to reject withdrawal request" });
    }
  });

  // Update teacher credentials for a note (admin only)
  app.put("/api/admin/notes/:noteId/teacher-credentials", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const { noteId } = req.params;
    const { teacherId, teacherPassword } = req.body;

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const updatedNote = await storage.updateNoteTeacherCredentials(noteId, teacherId, teacherPassword);
      
      res.json({
        success: true,
        message: "Teacher credentials updated successfully",
        note: updatedNote
      });
    } catch (error) {
      console.error("Error updating teacher credentials:", error);
      res.status(500).json({ message: "Failed to update teacher credentials" });
    }
  });

  // Get user activity for admin
  app.get("/api/admin/user-activity", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const activity = await storage.getUserActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Update user role (admin only, or for first-time setup)
  app.post("/api/admin/update-user-role", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const { targetUserId, newRole } = req.body;

    try {
      const user = await storage.getUser(userId);
      
      // Allow if current user is admin, OR if no admin exists yet (first-time setup)
      const allUsers = await storage.getAllUsers();
      const hasAdmin = allUsers.some(u => u.role === "admin");
      
      if (!hasAdmin || (user && user.role === "admin")) {
        if (!targetUserId || !newRole) {
          return res.status(400).json({ message: "targetUserId and newRole are required" });
        }

        const updatedUser = await storage.updateUserRole(targetUserId, newRole);
        res.json({ success: true, user: updatedUser });
      } else {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Secure Admin Promotion - Requires Admin ID + Password (NO AUTH REQUIRED - Uses email)
  app.post("/api/admin/promote-to-admin", async (req: any, res) => {
    const { adminPromotionId, adminPromotionPassword, userEmail } = req.body;

    try {
      // Validate input
      if (!adminPromotionId || !adminPromotionPassword) {
        return res.status(400).json({ 
          success: false,
          message: "Admin Promotion ID and Password are required" 
        });
      }

      if (!userEmail) {
        return res.status(400).json({ 
          success: false,
          message: "User email is required" 
        });
      }

      // Get secure credentials from environment
      const ADMIN_PROMOTION_ID = process.env.ADMIN_PROMOTION_ID || 'MASTER_ADMIN_2025';
      const ADMIN_PROMOTION_PASSWORD = process.env.ADMIN_PROMOTION_PASSWORD || 'SecureAdmin@2025';

      // Debug logging
      console.log('🔍 Admin promotion attempt:', {
        userEmail,
        providedId: adminPromotionId,
        providedPassword: adminPromotionPassword,
        expectedId: ADMIN_PROMOTION_ID,
        expectedPassword: ADMIN_PROMOTION_PASSWORD,
        idMatch: adminPromotionId === ADMIN_PROMOTION_ID,
        passwordMatch: adminPromotionPassword === ADMIN_PROMOTION_PASSWORD
      });

      // Verify credentials
      if (adminPromotionId !== ADMIN_PROMOTION_ID || adminPromotionPassword !== ADMIN_PROMOTION_PASSWORD) {
        console.log('❌ Failed admin promotion attempt:', { 
          userEmail, 
          providedId: adminPromotionId,
          idMatch: adminPromotionId === ADMIN_PROMOTION_ID,
          passwordMatch: adminPromotionPassword === ADMIN_PROMOTION_PASSWORD
        });
        return res.status(401).json({ 
          success: false,
          message: "Invalid Admin Promotion credentials. Access denied." 
        });
      }

      // Get user by email
      const user = await storage.getUserByEmail(userEmail);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found with this email" 
        });
      }

      // Check if user is already an admin
      if (user.role === "admin") {
        return res.json({ 
          success: true,
          message: "You are already an admin!",
          user 
        });
      }

      // Promote user to admin
      const updatedUser = await storage.updateUserRole(user.id, "admin");
      
      console.log('✅ User promoted to admin:', {
        userId: updatedUser.id,
        email: updatedUser.email,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`
      });

      // Set session for user
      req.session.userId = updatedUser.id;
      req.session.isAdmin = true;

      res.json({ 
        success: true, 
        message: "Congratulations! You are now an admin with full access.",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to promote user to admin: " + (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  });

  // Make current user admin (for first-time setup only - DEPRECATED)
  app.post("/api/admin/make-me-admin", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      // Check if any admin exists
      const allUsers = await storage.getAllUsers();
      const hasAdmin = allUsers.some(u => u.role === "admin");
      
      if (hasAdmin) {
        return res.status(403).json({ message: "Admin already exists. Use /api/admin/promote-to-admin with proper credentials." });
      }

      // Make current user admin (only works if no admin exists)
      const updatedUser = await storage.updateUserRole(userId, "admin");
      res.json({ 
        success: true, 
        message: "You are now an admin!",
        user: updatedUser 
      });
    } catch (error) {
      console.error("Error making user admin:", error);
      res.status(500).json({ message: "Failed to make user admin" });
    }
  });

  // Admin Login Endpoint (Separate authentication from main website)
  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Username and password are required" 
      });
    }

    try {
      // Get admin account from admin_accounts table
      const adminAccount = await storage.getAdminByUsername(username);
      
      if (!adminAccount) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      // Check if account is active
      if (!adminAccount.isActive) {
        return res.status(403).json({
          success: false,
          message: "Admin account is deactivated",
        });
      }

      // Verify password
      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.default.compare(password, adminAccount.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      // Update last login
      await storage.updateAdminLastLogin(adminAccount.id);

      // Create admin session token
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

      await storage.createAdminSession({
        adminAccountId: adminAccount.id,
        token: sessionToken,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        expiresAt,
      });

      // Set separate admin session (doesn't affect main website session)
      req.session.adminAccountId = adminAccount.id;
      req.session.adminToken = sessionToken;
      req.session.isAdmin = true;

      console.log('✅ Admin logged in:', { username, id: adminAccount.id });

      // Save session before sending response
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ success: false, message: "Session save failed" });
        }
        
        res.json({
          success: true,
          message: "Admin login successful",
          token: sessionToken,
          admin: {
            id: adminAccount.id,
            username: adminAccount.username,
            email: adminAccount.email,
            fullName: adminAccount.fullName,
          },
        });
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ 
        success: false,
        message: "Admin login failed" 
      });
    }
  });

  // Admin Logout Endpoint (Separate from main website)
  app.post("/api/admin/logout", async (req, res) => {
    try {
      const adminToken = req.session.adminToken;
      
      if (adminToken) {
        // Invalidate admin session
        await storage.deleteAdminSession(adminToken);
      }

      // Clear only admin session data (keeps main website session intact)
      delete req.session.adminAccountId;
      delete req.session.adminToken;
      delete req.session.isAdmin;

      res.json({
        success: true,
        message: "Admin logged out successfully",
      });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ 
        success: false,
        message: "Admin logout failed" 
      });
    }
  });

  // Setup first admin account (one-time setup endpoint)
  app.post("/api/admin/setup-first-admin", async (req, res) => {
    try {
      // Check if any admin accounts exist
      const existingAdmins = await storage.getAllAdmins();
      
      if (existingAdmins && existingAdmins.length > 0) {
        return res.status(403).json({
          success: false,
          message: "Admin accounts already exist. Use /api/admin/reset-default-admin to reset password."
        });
      }

      // Create first admin account
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('Admin@123', 10);
      
      const adminId = crypto.randomUUID();
      await storage.createAdmin({
        id: adminId,
        username: 'admin',
        email: 'admin@masterstudent.in',
        password: hashedPassword,
        fullName: 'System Administrator',
        isActive: true,
      });

      res.json({
        success: true,
        message: "First admin account created successfully",
        credentials: {
          username: "admin",
          password: "Admin@123",
          note: "Please change this password after first login"
        }
      });
    } catch (error) {
      console.error("Setup admin error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to create admin account" 
      });
    }
  });

  // Reset default admin password (for development/testing)
  app.post("/api/admin/reset-default-admin", async (req, res) => {
    try {
      const adminAccount = await storage.getAdminByUsername('admin');
      
      if (!adminAccount) {
        return res.status(404).json({
          success: false,
          message: "Admin account 'admin' not found"
        });
      }

      // Reset password to default
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('Admin@123', 10);
      
      await storage.updateAdminPassword(adminAccount.id, hashedPassword);

      res.json({
        success: true,
        message: "Admin password reset successfully",
        credentials: {
          username: "admin",
          password: "Admin@123"
        }
      });
    } catch (error) {
      console.error("Reset admin error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to reset admin password" 
      });
    }
  });

  // Admin Session Check
  app.get("/api/admin/check-session", async (req, res) => {
    try {
      const adminToken = req.session.adminToken;
      
      if (!adminToken) {
        return res.json({ authenticated: false });
      }

      const session = await storage.getAdminSession(adminToken);
      
      if (!session || new Date() > new Date(session.expiresAt)) {
        // Session expired
        delete req.session.adminAccountId;
        delete req.session.adminToken;
        delete req.session.isAdmin;
        return res.json({ authenticated: false });
      }

      // Get admin account
      const adminAccount = await storage.getAdminById(session.adminAccountId);
      
      if (!adminAccount || !adminAccount.isActive) {
        return res.json({ authenticated: false });
      }

      // Update last activity
      await storage.updateAdminSessionActivity(adminToken);

      res.json({
        authenticated: true,
        admin: {
          id: adminAccount.id,
          username: adminAccount.username,
          email: adminAccount.email,
          fullName: adminAccount.fullName,
        },
      });
    } catch (error) {
      console.error("Admin session check error:", error);
      res.json({ authenticated: false });
    }
  });

  // Force admin (for development - remove in production!)
  app.post("/api/admin/force-admin", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      // Make current user admin (bypasses the "admin exists" check)
      const updatedUser = await storage.updateUserRole(userId, "admin");
      res.json({ 
        success: true, 
        message: "You are now an admin!",
        user: updatedUser 
      });
    } catch (error) {
      console.error("Error making user admin:", error);
      res.status(500).json({ message: "Failed to make user admin" });
    }
  });

  // Seed test notes (for development - remove in production!)
  app.post("/api/admin/seed-notes", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);

    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      // Create test notes
      const testNotes = [
        {
          title: "Physics Chapter 1 - Motion",
          subject: "physics" as const,
          description: "Complete notes on motion and kinematics for Class 11",
          status: "published" as const,
          topperId: userId,
          categoryId: "general",
          attachments: ["sample-physics-notes.pdf"],
        },
        {
          title: "Mathematics - Calculus Basics",
          subject: "mathematics" as const,
          description: "Introduction to derivatives and integrals",
          status: "published" as const,
          topperId: userId,
          categoryId: "general",
          attachments: ["sample-1.pdf"],
        },
        {
          title: "Chemistry - Organic Chemistry",
          subject: "chemistry" as const,
          description: "Organic chemistry fundamentals and reactions",
          status: "published" as const,
          topperId: userId,
          categoryId: "general",
          attachments: ["sample-2.pdf"],
        },
      ];

      const createdNotes = [];
      for (const noteData of testNotes) {
        const note = await storage.createNote(noteData as any);
        createdNotes.push(note);
      }

      res.json({
        success: true,
        message: `Created ${createdNotes.length} test notes!`,
        notes: createdNotes,
      });
    } catch (error) {
      console.error("Error seeding notes:", error);
      res.status(500).json({ message: "Failed to seed notes" });
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

  const httpServer = createServer(app);
  return httpServer;
}
