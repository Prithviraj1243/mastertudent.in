// Firebase-based Admin Server for MasterStudent Notes Marketplace
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
      requiredHeader: 'x-api-key'
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
  ADMIN_LOGS: 'admin_logs'
};

// Helper function to log admin actions
const logAdminAction = async (action, details) => {
  try {
    await addDoc(collection(db, COLLECTIONS.ADMIN_LOGS), {
      action,
      details,
      timestamp: serverTimestamp(),
      ip: 'localhost' // You can get real IP from req.ip
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
        <title>MasterStudent Admin Panel</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; }
            .api-key { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .endpoints { background: #f8f9fa; padding: 20px; border-radius: 5px; }
            .endpoint { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #007bff; }
            code { background: #f1f1f1; padding: 2px 5px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 MasterStudent Admin Panel</h1>
            <p>Firebase + Cloudinary Integration Active</p>
            
            <div class="api-key">
                <h3>🔑 API Key Required</h3>
                <p>Add this header to all requests:</p>
                <code>x-api-key: ${ADMIN_API_KEY}</code>
            </div>
            
            <div class="endpoints">
                <h3>📊 Available Endpoints</h3>
                
                <div class="endpoint">
                    <strong>GET /admin/users</strong> - Get all users
                </div>
                
                <div class="endpoint">
                    <strong>GET /admin/notes</strong> - Get all notes
                </div>
                
                <div class="endpoint">
                    <strong>GET /admin/payments</strong> - Get all payments
                </div>
                
                <div class="endpoint">
                    <strong>GET /admin/subscriptions</strong> - Get all subscriptions
                </div>
                
                <div class="endpoint">
                    <strong>POST /admin/upload</strong> - Upload file to Cloudinary
                </div>
                
                <div class="endpoint">
                    <strong>GET /admin/stats</strong> - Get dashboard statistics
                </div>
                
                <div class="endpoint">
                    <strong>GET /admin/logs</strong> - Get admin activity logs
                </div>
            </div>
            
            <p style="text-align: center; margin-top: 30px; color: #666;">
                🔥 Powered by Firebase & Cloudinary
            </p>
        </div>
    </body>
    </html>
  `);
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
      users
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
      notes
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
      payments
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
      subscriptions
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
      folder: "masterstudent/notes"
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    await logAdminAction('FILE_UPLOAD', `Uploaded file: ${result.public_id}`);

    res.json({
      success: true,
      file: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes
      }
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
      activeSubscriptions: subscriptionsSnap.docs.filter(doc => doc.data().status === 'active').length
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
      logs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
  }
});

// Health check
server.get('/admin/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      firebase: 'connected',
      cloudinary: 'connected'
    }
  });
});

// Create temp_uploads directory if it doesn't exist
if (!fs.existsSync('temp_uploads')) {
  fs.mkdirSync('temp_uploads');
}

// Start server
server.listen(PORT, () => {
  console.log(`🎓 MasterStudent Admin Panel running on port ${PORT}`);
  console.log(`🔗 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`🔑 API Key: ${ADMIN_API_KEY}`);
  console.log(`🔥 Firebase Project: masterstudent-6ea89`);
  console.log(`☁️  Cloudinary: Root`);
});

module.exports = server;
