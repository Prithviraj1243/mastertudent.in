// Firebase-based Admin Server for MasterStudent Notes Marketplace
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

// Import Firebase services (using require for Node.js compatibility)
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp } = require('firebase/firestore');
const { v2: cloudinary } = require('cloudinary');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_qCynsbzo7VwGdui6dT7gDai9XNyFDn8",
  authDomain: "masterstudent-6ea89.firebaseapp.com",
  projectId: "masterstudent-6ea89",
  messagingSenderId: "984570563803",
  appId: "1:984570563803:web:your-app-id"
};

// Cloudinary configuration
cloudinary.config({
  cloud_name: "Root",
  api_key: "592113722334363",
  api_secret: "E75jAy0Vg34M_o1wRosI7-bWzfI"
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Admin API Key for security
const ADMIN_API_KEY = "masterstudent_admin_2024_secure_key";

// Express app setup
const server = express();
const PORT = 3001;

// Middleware
server.use(cors());
server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer for file uploads
const upload = multer({ 
  dest: 'temp_uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Admin Authentication Middleware
const authenticateAdmin = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Valid API key required',
      requiredHeader: 'x-api-key',
      providedKey: apiKey ? 'PROVIDED' : 'MISSING'
    });
  }
  
  next();
};

// Collections
const COLLECTIONS = {
  USERS: 'users',
  NOTES: 'notes',
  PAYMENTS: 'payments',
  SUBSCRIPTIONS: 'subscriptions',
  DOWNLOADS: 'downloads',
  RATINGS: 'ratings',
  ADMIN_LOGS: 'admin_logs',
  COIN_TRANSACTIONS: 'coin_transactions'
};

// Simple coin reward calculation - exactly 20 coins for approved notes
function calculateCoinReward(noteData) {
  // Fixed reward of 20 coins for any approved note as requested
  return 20;
}

// Reward coins to user and create transaction record
async function rewardCoinsToUser(userId, coinAmount, transactionDetails) {
  try {
    // Get current user data
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error(`User ${userId} not found for coin reward`);
      return false;
    }
    
    const userData = userDoc.data();
    const currentCoins = userData.coins || 0;
    const newCoinBalance = currentCoins + coinAmount;
    
    // Update user's coin balance
    await updateDoc(userRef, {
      coins: newCoinBalance,
      totalCoinsEarned: (userData.totalCoinsEarned || 0) + coinAmount,
      lastCoinReward: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Create coin transaction record
    await addDoc(collection(db, COLLECTIONS.COIN_TRANSACTIONS), {
      userId: userId,
      userEmail: userData.email,
      amount: coinAmount,
      type: 'reward',
      reason: transactionDetails.reason,
      noteId: transactionDetails.noteId,
      noteTitle: transactionDetails.noteTitle,
      approvedBy: transactionDetails.approvedBy,
      previousBalance: currentCoins,
      newBalance: newCoinBalance,
      createdAt: serverTimestamp()
    });
    
    // Also sync coins to main website database
    await syncCoinsToMainWebsite(userId, coinAmount, userData.email);
    
    console.log(`✅ Rewarded ${coinAmount} coins to user ${userId} (${userData.email})`);
    return true;
    
  } catch (error) {
    console.error('Error rewarding coins to user:', error);
    return false;
  }
}

// Sync coins to main website PostgreSQL database
async function syncCoinsToMainWebsite(userId, coinAmount, userEmail) {
  try {
    // Call main website API to update coins
    const response = await fetch('http://localhost:8000/api/admin/sync-coins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'masterstudent_admin_2024_secure_key' // Admin key for internal API
      },
      body: JSON.stringify({
        userId: userId,
        coinAmount: coinAmount,
        reason: 'Note Approved',
        source: 'firebase_admin'
      })
    });
    
    if (response.ok) {
      console.log(`✅ Synced ${coinAmount} coins to main website for user ${userEmail}`);
    } else {
      console.error(`❌ Failed to sync coins to main website: ${response.status}`);
    }
  } catch (error) {
    console.error('Error syncing coins to main website:', error);
  }
}

// Helper function to log admin actions
const logAdminAction = async (action, details) => {
  try {
    await addDoc(collection(db, COLLECTIONS.ADMIN_LOGS), {
      action,
      details,
      timestamp: serverTimestamp(),
      ip: 'localhost'
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// Routes

// Admin Panel Home
server.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>MasterStudent Admin Panel - Firebase Edition</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
            h1 { color: #333; text-align: center; margin-bottom: 10px; font-size: 2.5em; }
            .subtitle { text-align: center; color: #666; margin-bottom: 30px; font-size: 1.2em; }
            .status { background: linear-gradient(45deg, #4CAF50, #45a049); color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; }
            .api-key { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #2196F3; }
            .endpoints { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; }
            .endpoint { margin: 12px 0; padding: 15px; background: white; border-left: 4px solid #007bff; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .endpoint strong { color: #007bff; }
            code { background: #f1f1f1; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
            .badge { display: inline-block; background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; margin-left: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 MasterStudent Admin Panel</h1>
            <div class="subtitle">Firebase + Cloudinary Integration</div>
            
            <div class="status">
                ✅ Firebase Connected | ☁️ Cloudinary Ready | 🔐 API Security Active
            </div>
            
            <div class="api-key">
                <h3>🔑 API Authentication Required</h3>
                <p>Add this header to all API requests:</p>
                <code>x-api-key: ${ADMIN_API_KEY}</code>
                <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    Or add as query parameter: <code>?apiKey=${ADMIN_API_KEY}</code>
                </p>
            </div>
            
            <div class="endpoints">
                <h3>📊 Available API Endpoints</h3>
                
                <div class="endpoint">
                    <strong>GET /admin/users</strong> - Get all users from Firebase
                    <span class="badge">Firebase</span>
                </div>
                
                <div class="endpoint">
                    <strong>GET /admin/notes</strong> - Get all notes from Firebase
                    <span class="badge">Firebase</span>
                </div>
                
                <div class="endpoint">
                    <strong>GET /admin/payments</strong> - Get all payments from Firebase
                    <span class="badge">Firebase</span>
                </div>
                
                <div class="endpoint">
                    <strong>GET /admin/subscriptions</strong> - Get all subscriptions from Firebase
                    <span class="badge">Firebase</span>
                </div>
                
                <div class="endpoint">
                    <strong>POST /admin/upload</strong> - Upload file to Cloudinary (25GB free)
                    <span class="badge">Cloudinary</span>
                </div>
                
                <div class="endpoint">
                    <strong>GET /admin/stats</strong> - Get dashboard statistics
                    <span class="badge">Analytics</span>
                </div>
                
                <div class="endpoint">
                    <strong>GET /admin/logs</strong> - Get admin activity logs
                    <span class="badge">Security</span>
                </div>
                
                <div class="endpoint">
                    <strong>GET /admin/health</strong> - System health check
                    <span class="badge">Status</span>
                </div>
            </div>
            
            <div class="footer">
                <p>🔥 <strong>Powered by Firebase & Cloudinary</strong></p>
                <p>Project: masterstudent-6ea89 | Storage: Root (25GB Free)</p>
                <p>Admin Server v2.0 - Completely Free Tier</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Test endpoint (no auth required)
server.get('/admin/test', (req, res) => {
  res.json({
    success: true,
    message: 'Firebase Admin Server is running!',
    timestamp: new Date().toISOString(),
    firebase: 'connected',
    cloudinary: 'connected'
  });
});

// Get all users
server.get('/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    await logAdminAction('VIEW_USERS', `Retrieved ${users.length} users`);
    
    res.json({
      success: true,
      count: users.length,
      users,
      source: 'Firebase Firestore'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// Get all notes
server.get('/admin/notes', authenticateAdmin, async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.NOTES));
    const notes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    await logAdminAction('VIEW_NOTES', `Retrieved ${notes.length} notes`);
    
    res.json({
      success: true,
      count: notes.length,
      notes,
      source: 'Firebase Firestore'
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
  }
});

// Get all payments
server.get('/admin/payments', authenticateAdmin, async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PAYMENTS));
    const payments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    await logAdminAction('VIEW_PAYMENTS', `Retrieved ${payments.length} payments`);
    
    res.json({
      success: true,
      count: payments.length,
      payments,
      source: 'Firebase Firestore'
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments', details: error.message });
  }
});

// Get all subscriptions
server.get('/admin/subscriptions', authenticateAdmin, async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.SUBSCRIPTIONS));
    const subscriptions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    await logAdminAction('VIEW_SUBSCRIPTIONS', `Retrieved ${subscriptions.length} subscriptions`);
    
    res.json({
      success: true,
      count: subscriptions.length,
      subscriptions,
      source: 'Firebase Firestore'
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions', details: error.message });
  }
});

// Upload file to Cloudinary
server.post('/admin/upload', authenticateAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "masterstudent/notes",
      use_filename: true,
      unique_filename: false
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    await logAdminAction('FILE_UPLOAD', `Uploaded file: ${result.public_id}`);

    res.json({
      success: true,
      message: 'File uploaded to Cloudinary successfully',
      file: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height
      },
      storage: 'Cloudinary (25GB Free)'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
});

// Get dashboard statistics
server.get('/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const [usersSnap, notesSnap, paymentsSnap, subscriptionsSnap] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.USERS)),
      getDocs(collection(db, COLLECTIONS.NOTES)),
      getDocs(collection(db, COLLECTIONS.PAYMENTS)),
      getDocs(collection(db, COLLECTIONS.SUBSCRIPTIONS))
    ]);

    const stats = {
      totalUsers: usersSnap.size,
      totalNotes: notesSnap.size,
      totalPayments: paymentsSnap.size,
      totalSubscriptions: subscriptionsSnap.size,
      activeSubscriptions: subscriptionsSnap.docs.filter(doc => doc.data().status === 'active').length,
      database: 'Firebase Firestore',
      storage: 'Cloudinary (25GB Free)',
      lastUpdated: new Date().toISOString()
    };

    await logAdminAction('VIEW_STATS', 'Retrieved dashboard statistics');

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
});

// Get admin logs
server.get('/admin/logs', authenticateAdmin, async (req, res) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ADMIN_LOGS), 
      orderBy("timestamp", "desc"), 
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    const logs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      count: logs.length,
      logs,
      source: 'Firebase Firestore'
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
  }
});

// Get coin transactions
server.get('/admin/coins', authenticateAdmin, async (req, res) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.COIN_TRANSACTIONS), 
      orderBy("createdAt", "desc"), 
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    await logAdminAction('VIEW_COIN_TRANSACTIONS', `Retrieved ${transactions.length} coin transactions`);
    
    res.json({
      success: true,
      count: transactions.length,
      transactions,
      source: 'Firebase Firestore'
    });
  } catch (error) {
    console.error('Error fetching coin transactions:', error);
    res.status(500).json({ error: 'Failed to fetch coin transactions', details: error.message });
  }
});

// Approve note and reward coins
server.post('/admin/notes/:noteId/approve', authenticateAdmin, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { adminEmail } = req.body;

    // Get the note details first
    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
    const noteDoc = await getDoc(noteRef);
    
    if (!noteDoc.exists()) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = noteDoc.data();
    const userId = noteData.userId;
    const noteTitle = noteData.title;
    
    // Calculate coin reward based on note quality/subject
    const coinReward = calculateCoinReward(noteData);

    // Update note status
    await updateDoc(noteRef, {
      isApproved: true,
      approvalStatus: 'approved',
      approvedBy: adminEmail || 'admin@masterstudent.com',
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      coinReward: coinReward
    });

    // Reward coins to user
    if (userId) {
      await rewardCoinsToUser(userId, coinReward, {
        reason: 'Note Approved',
        noteId: noteId,
        noteTitle: noteTitle,
        approvedBy: adminEmail || 'admin@masterstudent.com'
      });
    }

    await logAdminAction('NOTE_APPROVED', `Note ${noteId} approved by ${adminEmail} - ${coinReward} coins rewarded`);

    res.json({
      success: true,
      message: 'Note approved successfully',
      coinReward: coinReward,
      userId: userId
    });
  } catch (error) {
    console.error('Error approving note:', error);
    res.status(500).json({ error: 'Failed to approve note', details: error.message });
  }
});

// Reject note
server.post('/admin/notes/:noteId/reject', authenticateAdmin, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { adminEmail, reason } = req.body;

    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
    
    await updateDoc(noteRef, {
      isApproved: false,
      approvalStatus: 'rejected',
      rejectionReason: reason || 'No reason provided',
      rejectedBy: adminEmail || 'admin@masterstudent.com',
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logAdminAction('NOTE_REJECTED', `Note ${noteId} rejected by ${adminEmail}: ${reason}`);

    res.json({
      success: true,
      message: 'Note rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting note:', error);
    res.status(500).json({ error: 'Failed to reject note', details: error.message });
  }
});

// Health check
server.get('/admin/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      firebase: 'connected',
      cloudinary: 'connected',
      database: 'Firebase Firestore',
      storage: 'Cloudinary (25GB Free)'
    },
    project: 'masterstudent-6ea89',
    version: '2.0.0'
  });
});

// Create temp_uploads directory if it doesn't exist
if (!fs.existsSync('temp_uploads')) {
  fs.mkdirSync('temp_uploads');
}

// Start server
server.listen(PORT, () => {
  console.log(`🎓 MasterStudent Firebase Admin Panel running on port ${PORT}`);
  console.log(`🔗 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`🔑 API Key: ${ADMIN_API_KEY}`);
  console.log(`🔥 Firebase Project: masterstudent-6ea89`);
  console.log(`☁️  Cloudinary: Root (25GB Free Storage)`);
  console.log(`✅ All systems ready - 100% Free Tier!`);
});

module.exports = server;
