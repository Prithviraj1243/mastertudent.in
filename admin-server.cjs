// Admin Panel Backend Server - Node.js + Express + SQLite
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.ADMIN_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-admin-key';

// Database setup
const db = new sqlite3.Database('./admin_database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/admin', express.static(path.join(__dirname, 'client/src/admin panel')));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Initialize database tables
function initializeDatabase() {
    const tables = {
        users: `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'student',
                status TEXT DEFAULT 'active',
                subscription_type TEXT DEFAULT 'free',
                subscription_expires DATETIME,
                profile_image TEXT,
                phone TEXT,
                college TEXT,
                course TEXT,
                year INTEGER,
                total_earnings DECIMAL(10,2) DEFAULT 0,
                total_downloads INTEGER DEFAULT 0,
                rating DECIMAL(3,2) DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `,
        notes: `
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                subject TEXT NOT NULL,
                chapter TEXT,
                unit TEXT,
                file_path TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER,
                thumbnail TEXT,
                price DECIMAL(8,2) DEFAULT 0,
                user_id INTEGER NOT NULL,
                status TEXT DEFAULT 'pending',
                download_count INTEGER DEFAULT 0,
                rating DECIMAL(3,2) DEFAULT 0,
                rating_count INTEGER DEFAULT 0,
                tags TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                approved_at DATETIME,
                approved_by INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `,
        payments: `
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id TEXT UNIQUE NOT NULL,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency TEXT DEFAULT 'INR',
                status TEXT DEFAULT 'pending',
                payment_method TEXT,
                gateway_response TEXT,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                processed_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `,
        downloads: `
            CREATE TABLE IF NOT EXISTS downloads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                note_id INTEGER NOT NULL,
                download_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (note_id) REFERENCES notes (id)
            )
        `,
        ratings: `
            CREATE TABLE IF NOT EXISTS ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                note_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                review TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (note_id) REFERENCES notes (id)
            )
        `,
        admin_logs: `
            CREATE TABLE IF NOT EXISTS admin_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                target_type TEXT,
                target_id INTEGER,
                details TEXT,
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users (id)
            )
        `,
        system_settings: `
            CREATE TABLE IF NOT EXISTS system_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT,
                type TEXT DEFAULT 'string',
                description TEXT,
                updated_by INTEGER,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `
    };

    // Create tables
    Object.entries(tables).forEach(([tableName, query]) => {
        db.run(query, (err) => {
            if (err) {
                console.error(`Error creating ${tableName} table:`, err);
            } else {
                console.log(`${tableName} table ready`);
            }
        });
    });

    // Insert default admin user
    setTimeout(() => {
        const adminPassword = bcrypt.hashSync('admin123', 10);
        db.run(`
            INSERT OR IGNORE INTO users (name, email, password, role, status) 
            VALUES (?, ?, ?, ?, ?)
        `, ['Admin User', 'admin@masterstudent.com', adminPassword, 'admin', 'active']);

        // Insert default settings
        const defaultSettings = [
            ['site_name', 'MasterStudent', 'string', 'Site name'],
            ['site_description', 'India\'s top student notes marketplace', 'string', 'Site description'],
            ['monthly_price', '59', 'number', 'Monthly subscription price'],
            ['yearly_price', '499', 'number', 'Yearly subscription price'],
            ['commission_rate', '30', 'number', 'Commission rate percentage'],
            ['maintenance_mode', 'false', 'boolean', 'Maintenance mode status']
        ];

        defaultSettings.forEach(([key, value, type, description]) => {
            db.run(`
                INSERT OR IGNORE INTO system_settings (key, value, type, description) 
                VALUES (?, ?, ?, ?)
            `, [key, value, type, description]);
        });
    }, 1000);
}

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Logging middleware
const logAdminAction = (action, targetType = null, targetId = null, details = null) => {
    return (req, res, next) => {
        const adminId = req.admin?.id;
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        db.run(`
            INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [adminId, action, targetType, targetId, details, ipAddress]);
        
        next();
    };
};

// Routes

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

        db.get(`
            SELECT id, name, email, password, role 
            FROM users 
            WHERE email = ? AND role = 'admin'
        `, [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user || !await bcrypt.compare(password, user.password)) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Admin registration
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
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Admin with this email already exists' 
                });
            }

            // Hash password and create admin
            const hashedPassword = await bcrypt.hash(password, 10);
            
            db.run(`
                INSERT INTO users (name, email, password, role, status) 
                VALUES (?, ?, ?, 'admin', 'active')
            `, [name, email, hashedPassword], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Failed to create admin account' });
                }

                res.json({
                    success: true,
                    message: 'Admin account created successfully',
                    userId: this.lastID
                });
            });
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

// Today's statistics
app.get('/api/admin/stats/today', authenticateAdmin, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    const queries = {
        newUsers: `SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?`,
        notesUploaded: `SELECT COUNT(*) as count FROM notes WHERE DATE(created_at) = ?`,
        revenue: `SELECT SUM(amount) as count FROM payments WHERE DATE(created_at) = ? AND status = 'completed' AND type = 'subscription'`,
        pendingApprovals: `SELECT COUNT(*) as count FROM notes WHERE status = 'pending'`
    };

    const stats = {};
    let completed = 0;
    const total = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        const params = key === 'pendingApprovals' ? [] : [today];
        db.get(query, params, (err, result) => {
            if (!err) {
                stats[key] = result.count || 0;
            }
            completed++;
            if (completed === total) {
                res.json(stats);
            }
        });
    });
});

// Recent activity
app.get('/api/admin/activity/recent', authenticateAdmin, (req, res) => {
    const { limit = 10 } = req.query;
    
    db.all(`
        SELECT 
            'user_registered' as type,
            u.name as user_name,
            'New user registered: ' || u.name as description,
            u.created_at
        FROM users u
        WHERE u.created_at >= datetime('now', '-24 hours')
        
        UNION ALL
        
        SELECT 
            'note_uploaded' as type,
            u.name as user_name,
            'Note uploaded: ' || n.title as description,
            n.created_at
        FROM notes n
        JOIN users u ON n.user_id = u.id
        WHERE n.created_at >= datetime('now', '-24 hours')
        
        UNION ALL
        
        SELECT 
            'payment_made' as type,
            u.name as user_name,
            'Payment made: ₹' || p.amount as description,
            p.created_at
        FROM payments p
        JOIN users u ON p.user_id = u.id
        WHERE p.created_at >= datetime('now', '-24 hours')
        
        ORDER BY created_at DESC
        LIMIT ?
    `, [parseInt(limit)], (err, activities) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(activities || []);
    });
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

// Dashboard statistics
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
    const queries = {
        totalUsers: 'SELECT COUNT(*) as count FROM users',
        activeUsers: 'SELECT COUNT(*) as count FROM users WHERE status = "active"',
        premiumUsers: 'SELECT COUNT(*) as count FROM users WHERE subscription_type != "free"',
        totalNotes: 'SELECT COUNT(*) as count FROM notes',
        approvedNotes: 'SELECT COUNT(*) as count FROM notes WHERE status = "approved"',
        pendingNotes: 'SELECT COUNT(*) as count FROM notes WHERE status = "pending"',
        totalDownloads: 'SELECT SUM(download_count) as count FROM notes',
        totalRevenue: 'SELECT SUM(amount) as count FROM payments WHERE status = "completed" AND type = "subscription"',
        pendingWithdrawals: 'SELECT COUNT(*) as count FROM payments WHERE status = "pending" AND type = "withdrawal"'
    };

    const stats = {};
    let completed = 0;
    const total = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        db.get(query, (err, result) => {
            if (!err) {
                stats[key] = result.count || 0;
            }
            completed++;
            if (completed === total) {
                res.json(stats);
            }
        });
    });
});

// User management
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
    const { page = 1, limit = 50, status, role, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM users WHERE 1=1';
    let params = [];

    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }

    if (role) {
        query += ' AND role = ?';
        params.push(role);
    }

    if (search) {
        query += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        let countParams = [];

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        if (role) {
            countQuery += ' AND role = ?';
            countParams.push(role);
        }

        if (search) {
            countQuery += ' AND (name LIKE ? OR email LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }

        db.get(countQuery, countParams, (err, countResult) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({
                users: users.map(user => ({ ...user, password: undefined })),
                total: countResult.total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult.total / limit)
            });
        });
    });
});

app.get('/api/admin/users/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove password from response
        delete user.password;
        res.json(user);
    });
});

app.put('/api/admin/users/:id', authenticateAdmin, logAdminAction('update_user'), (req, res) => {
    const { id } = req.params;
    const { name, email, role, status, subscription_type } = req.body;

    db.run(`
        UPDATE users 
        SET name = ?, email = ?, role = ?, status = ?, subscription_type = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `, [name, email, role, status, subscription_type, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User updated successfully' });
    });
});

app.delete('/api/admin/users/:id', authenticateAdmin, logAdminAction('delete_user'), (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    });
});

// Notes management
app.get('/api/admin/notes', authenticateAdmin, (req, res) => {
    const { page = 1, limit = 50, status, subject, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
        SELECT n.*, u.name as author_name, u.email as author_email
        FROM notes n
        JOIN users u ON n.user_id = u.id
        WHERE 1=1
    `;
    let params = [];

    if (status) {
        query += ' AND n.status = ?';
        params.push(status);
    }

    if (subject) {
        query += ' AND n.subject = ?';
        params.push(subject);
    }

    if (search) {
        query += ' AND (n.title LIKE ? OR n.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, notes) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ notes });
    });
});

app.post('/api/admin/notes/:id/approve', authenticateAdmin, logAdminAction('approve_note'), (req, res) => {
    const { id } = req.params;
    const adminId = req.admin.id;

    db.run(`
        UPDATE notes 
        SET status = 'approved', approved_at = CURRENT_TIMESTAMP, approved_by = ?
        WHERE id = ?
    `, [adminId, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note approved successfully' });
    });
});

app.post('/api/admin/notes/:id/reject', authenticateAdmin, logAdminAction('reject_note'), (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    db.run(`
        UPDATE notes 
        SET status = 'rejected'
        WHERE id = ?
    `, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note rejected successfully' });
    });
});

// Payments management
app.get('/api/admin/payments', authenticateAdmin, (req, res) => {
    const { page = 1, limit = 50, status, type } = req.query;
    const offset = (page - 1) * limit;

    let query = `
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM payments p
        JOIN users u ON p.user_id = u.id
        WHERE 1=1
    `;
    let params = [];

    if (status) {
        query += ' AND p.status = ?';
        params.push(status);
    }

    if (type) {
        query += ' AND p.type = ?';
        params.push(type);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, payments) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ payments });
    });
});

// Analytics
app.get('/api/admin/analytics/user-growth', authenticateAdmin, (req, res) => {
    const { period = '30d' } = req.query;
    
    let dateFilter = '';
    if (period === '7d') {
        dateFilter = "AND created_at >= date('now', '-7 days')";
    } else if (period === '30d') {
        dateFilter = "AND created_at >= date('now', '-30 days')";
    } else if (period === '90d') {
        dateFilter = "AND created_at >= date('now', '-90 days')";
    }

    db.all(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE 1=1 ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date
    `, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
    });
});

app.get('/api/admin/analytics/revenue', authenticateAdmin, (req, res) => {
    const { period = '30d' } = req.query;
    
    let dateFilter = '';
    if (period === '7d') {
        dateFilter = "AND created_at >= date('now', '-7 days')";
    } else if (period === '30d') {
        dateFilter = "AND created_at >= date('now', '-30 days')";
    } else if (period === '90d') {
        dateFilter = "AND created_at >= date('now', '-90 days')";
    }

    db.all(`
        SELECT DATE(created_at) as date, SUM(amount) as revenue
        FROM payments
        WHERE status = 'completed' AND type = 'subscription' ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date
    `, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
    });
});

app.get('/api/admin/analytics/subjects', authenticateAdmin, (req, res) => {
    db.all(`
        SELECT subject, 
               COUNT(*) as notes_count,
               SUM(download_count) as total_downloads,
               AVG(rating) as avg_rating
        FROM notes 
        WHERE status = 'approved'
        GROUP BY subject
        ORDER BY total_downloads DESC
    `, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
    });
});

// Database management
app.get('/api/admin/database/info', authenticateAdmin, (req, res) => {
    // Get database file size
    const dbPath = './admin_database.db';
    let dbSize = 0;
    
    try {
        const stats = fs.statSync(dbPath);
        dbSize = Math.round(stats.size / (1024 * 1024) * 100) / 100; // MB
    } catch (error) {
        console.error('Error getting database size:', error);
    }

    // Get table information
    db.all(`
        SELECT name, sql 
        FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `, (err, tables) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        const tableInfo = [];
        let completed = 0;

        if (tables.length === 0) {
            return res.json({
                size: dbSize,
                tables: tableInfo,
                lastBackup: null
            });
        }

        tables.forEach(table => {
            db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, result) => {
                if (!err) {
                    tableInfo.push({
                        name: table.name,
                        records: result.count,
                        size: 'N/A' // SQLite doesn't provide per-table size easily
                    });
                }
                completed++;
                if (completed === tables.length) {
                    res.json({
                        size: dbSize,
                        tables: tableInfo,
                        lastBackup: null // Implement backup tracking
                    });
                }
            });
        });
    });
});

app.post('/api/admin/database/backup', authenticateAdmin, logAdminAction('database_backup'), (req, res) => {
    const backupPath = `./backups/backup_${Date.now()}.db`;
    const backupDir = './backups';

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // Copy database file
    try {
        fs.copyFileSync('./admin_database.db', backupPath);
        res.json({ 
            message: 'Database backup created successfully',
            backupPath: backupPath
        });
    } catch (error) {
        res.status(500).json({ error: 'Backup failed' });
    }
});

// System settings
app.get('/api/admin/settings', authenticateAdmin, (req, res) => {
    db.all('SELECT * FROM system_settings ORDER BY key', (err, settings) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        const settingsObj = {};
        settings.forEach(setting => {
            let value = setting.value;
            if (setting.type === 'number') {
                value = parseFloat(value);
            } else if (setting.type === 'boolean') {
                value = value === 'true';
            }
            settingsObj[setting.key] = value;
        });

        res.json(settingsObj);
    });
});

app.put('/api/admin/settings', authenticateAdmin, logAdminAction('update_settings'), (req, res) => {
    const settings = req.body;
    const adminId = req.admin.id;

    const updates = Object.entries(settings).map(([key, value]) => {
        return new Promise((resolve, reject) => {
            db.run(`
                UPDATE system_settings 
                SET value = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
                WHERE key = ?
            `, [String(value), adminId, key], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
    });

    Promise.all(updates)
        .then(() => {
            res.json({ message: 'Settings updated successfully' });
        })
        .catch(error => {
            res.status(500).json({ error: 'Failed to update settings' });
        });
});

// Activity logs
app.get('/api/admin/logs/activity', authenticateAdmin, (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    db.all(`
        SELECT al.*, u.name as admin_name
        FROM admin_logs al
        JOIN users u ON al.admin_id = u.id
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)], (err, logs) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ logs });
    });
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/src/admin panel/admin-login.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/src/admin panel/admin-login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/src/admin panel/admin-dashboard.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Admin server running on port ${PORT}`);
    console.log(`Admin panel available at: http://localhost:${PORT}/admin`);
    console.log('Default admin credentials:');
    console.log('Email: admin@masterstudent.com');
    console.log('Password: admin123');
});

module.exports = app;
