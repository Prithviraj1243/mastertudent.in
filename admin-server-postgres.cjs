// Admin Panel Backend Server - Node.js + Express + PostgreSQL (Shared Database)
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const { body, validationResult } = require('express-validator');

// Import the shared storage system
const { createStorage } = require('./server/storage-factory.cjs');

const app = express();
const PORT = process.env.ADMIN_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-admin-key';

// Initialize shared storage
let storage;

async function initializeStorage() {
    try {
        storage = await createStorage();
        console.log('Connected to shared PostgreSQL database');
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/admin', express.static(path.join(__dirname, 'client/src/admin panel')));

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid token.' });
    }
};

// Admin login
app.post('/api/admin/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please check your input fields',
                errors: errors.array() 
            });
        }

        const { email, password } = req.body;

        // Get user from shared database
        const user = await storage.getUserByEmail(email);
        
        if (!user || user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Invalid credentials or insufficient permissions' });
        }

        // For demo purposes, check if it's the default admin
        if (email === 'admin@masterstudent.com' && password === 'admin123') {
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: user.role
                }
            });
        }

        // TODO: Implement proper password hashing for admin users
        res.status(401).json({ success: false, message: 'Invalid credentials' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Admin registration (creates admin user in shared database)
app.post('/api/admin/register', [
    body('name').isLength({ min: 2 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { name, email, password } = req.body;

        // Check if admin already exists
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Admin with this email already exists' 
            });
        }

        // Create admin user in shared database
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        const newUser = await storage.upsertUser({
            email,
            firstName,
            lastName,
            role: 'admin',
            profileImageUrl: '',
            // Note: In a real implementation, you'd hash the password and store it
            // For now, we'll rely on the default admin credentials
        });

        res.json({
            success: true,
            message: 'Admin account created successfully',
            userId: newUser.id
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Token verification
app.get('/api/admin/verify', authenticateAdmin, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.admin.id,
            email: req.admin.email,
            role: req.admin.role
        }
    });
});

// Dashboard statistics from shared database
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const stats = await storage.getAdminStats();
        
        // Get additional stats
        const allUsers = await storage.getUsers?.() || [];
        const allNotes = await storage.getAllNotesForAdmin?.() || { notes: [], total: 0 };
        
        const response = {
            totalUsers: stats.totalUsers || allUsers.length || 0,
            totalNotes: stats.totalNotes || allNotes.total || 0,
            activeSubscriptions: stats.activeSubscriptions || 0,
            pendingReviews: stats.pendingReviews || 0,
            pendingNotes: allNotes.notes.filter(n => n.status === 'submitted').length || 0,
            pendingPayments: 0, // TODO: Implement withdrawal requests
            totalRevenue: 0, // TODO: Calculate from transactions
            totalDownloads: allNotes.notes.reduce((sum, note) => sum + (note.downloadsCount || 0), 0) || 0
        };

        res.json(response);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to load statistics' });
    }
});

// Today's statistics
app.get('/api/admin/stats/today', authenticateAdmin, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Mock today's stats - in a real implementation, you'd query by date
        const stats = {
            newUsers: 0,
            notesUploaded: 0,
            revenue: 0,
            pendingApprovals: 0
        };

        res.json(stats);
    } catch (error) {
        console.error('Today stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to load today statistics' });
    }
});

// Recent activity from shared database
app.get('/api/admin/activity/recent', authenticateAdmin, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Get recent activity from shared storage
        const activities = await storage.getUserActivity?.() || [];
        
        // Format activities for admin panel
        const formattedActivities = activities.slice(0, parseInt(limit)).map(activity => ({
            type: activity.action,
            user_name: activity.userName,
            description: `${activity.userName} ${activity.action.replace('_', ' ')}`,
            created_at: activity.timestamp
        }));

        res.json(formattedActivities);
    } catch (error) {
        console.error('Activity error:', error);
        res.json([]); // Return empty array on error
    }
});

// User management from shared database
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, status, role, search } = req.query;
        
        // Get all users from shared storage
        // Note: The storage interface might not have pagination, so we'll implement it here
        const allUsers = await storage.getUsers?.() || [];
        
        let filteredUsers = allUsers;
        
        // Apply filters
        if (status && status !== '') {
            filteredUsers = filteredUsers.filter(user => {
                if (status === 'active') return user.isActive;
                if (status === 'inactive') return !user.isActive;
                return true;
            });
        }
        
        if (role && role !== '') {
            filteredUsers = filteredUsers.filter(user => user.role === role);
        }
        
        if (search && search !== '') {
            const searchLower = search.toLowerCase();
            filteredUsers = filteredUsers.filter(user => 
                user.firstName?.toLowerCase().includes(searchLower) ||
                user.lastName?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower)
            );
        }
        
        // Pagination
        const offset = (page - 1) * limit;
        const paginatedUsers = filteredUsers.slice(offset, offset + parseInt(limit));
        
        // Format users for admin panel
        const formattedUsers = paginatedUsers.map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            status: user.isActive ? 'active' : 'inactive',
            created_at: user.createdAt,
            notes_count: 0, // TODO: Get from notes
            total_earnings: user.totalEarned || 0
        }));

        res.json({
            users: formattedUsers,
            total: filteredUsers.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(filteredUsers.length / limit)
        });
    } catch (error) {
        console.error('Users error:', error);
        res.status(500).json({ success: false, message: 'Failed to load users' });
    }
});

// Notes management from shared database
app.get('/api/admin/notes', authenticateAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, status, subject, search } = req.query;
        
        // Get notes from shared storage
        const result = await storage.getAllNotesForAdmin?.({
            status,
            subject,
            limit: parseInt(limit),
            offset: (page - 1) * limit
        }) || { notes: [], total: 0 };

        res.json({ notes: result.notes, total: result.total });
    } catch (error) {
        console.error('Notes error:', error);
        res.status(500).json({ success: false, message: 'Failed to load notes' });
    }
});

// Approve note
app.post('/api/admin/notes/:id/approve', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.admin.id;

        await storage.updateNoteStatus(id, 'published', adminId);
        res.json({ success: true, message: 'Note approved successfully' });
    } catch (error) {
        console.error('Approve note error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve note' });
    }
});

// Reject note
app.post('/api/admin/notes/:id/reject', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        await storage.updateNoteStatus(id, 'rejected');
        res.json({ success: true, message: 'Note rejected successfully' });
    } catch (error) {
        console.error('Reject note error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject note' });
    }
});

// System status
app.get('/api/admin/system/status', authenticateAdmin, (req, res) => {
    const status = {
        server: 'online',
        database: 'connected',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    };
    
    res.json(status);
});

// Serve admin panel routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/src/admin panel/admin-login-fiery.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/src/admin panel/admin-login-fiery.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/src/admin panel/admin-dashboard-fiery.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Initialize and start server
async function startServer() {
    try {
        await initializeStorage();
        
        // Create default admin user if it doesn't exist
        try {
            const adminUser = await storage.getUserByEmail('admin@masterstudent.com');
            if (!adminUser) {
                await storage.upsertUser({
                    email: 'admin@masterstudent.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'admin',
                    profileImageUrl: ''
                });
                console.log('Created default admin user');
            }
        } catch (error) {
            console.log('Admin user setup:', error.message);
        }
        
        app.listen(PORT, () => {
            console.log(`Admin server running on port ${PORT}`);
            console.log(`Admin panel available at: http://localhost:${PORT}/admin`);
            console.log('Connected to shared PostgreSQL database');
            console.log('Default admin credentials:');
            console.log('Email: admin@masterstudent.com');
            console.log('Password: admin123');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
