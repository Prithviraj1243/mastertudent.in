// Admin API - Backend Integration for Database Operations
class AdminAPI {
    constructor() {
        this.baseURL = '/api/admin';
        this.token = localStorage.getItem('adminToken');
    }

    // Authentication
    async login(credentials) {
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                this.token = data.token;
            }
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Admin Registration
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Token Verification
    async verifyToken() {
        try {
            const response = await fetch(`${this.baseURL}/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        this.token = null;
        window.location.href = '/admin/login';
    }

    // Get Current Admin User
    getCurrentUser() {
        const userStr = localStorage.getItem('adminUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Generic API call method
    async apiCall(endpoint, method = 'GET', data = null) {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    // Dashboard Statistics
    async getDashboardStats() {
        return await this.apiCall('/stats');
    }

    // Today's Statistics
    async getTodayStats() {
        return await this.apiCall('/stats/today');
    }

    // Real-time Activity
    async getRecentActivity(limit = 10) {
        return await this.apiCall(`/activity/recent?limit=${limit}`);
    }

    // System Health Check
    async getSystemStatus() {
        return await this.apiCall('/system/status');
    }

    // User Management
    async getUsers(page = 1, limit = 50, filters = {}) {
        const params = new URLSearchParams({
            page,
            limit,
            ...filters
        });
        return await this.apiCall(`/users?${params}`);
    }

    async getUserById(userId) {
        return await this.apiCall(`/users/${userId}`);
    }

    async createUser(userData) {
        return await this.apiCall('/users', 'POST', userData);
    }

    async updateUser(userId, userData) {
        return await this.apiCall(`/users/${userId}`, 'PUT', userData);
    }

    async deleteUser(userId) {
        return await this.apiCall(`/users/${userId}`, 'DELETE');
    }

    async bulkDeleteUsers(userIds) {
        return await this.apiCall('/users/bulk-delete', 'POST', { userIds });
    }

    async exportUsers(format = 'csv') {
        const response = await fetch(`${this.baseURL}/users/export?format=${format}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        return response.blob();
    }

    // Notes Management
    async getNotes(page = 1, limit = 50, filters = {}) {
        const params = new URLSearchParams({
            page,
            limit,
            ...filters
        });
        return await this.apiCall(`/notes?${params}`);
    }

    async getNoteById(noteId) {
        return await this.apiCall(`/notes/${noteId}`);
    }

    async approveNote(noteId) {
        return await this.apiCall(`/notes/${noteId}/approve`, 'POST');
    }

    async rejectNote(noteId, reason) {
        return await this.apiCall(`/notes/${noteId}/reject`, 'POST', { reason });
    }

    async deleteNote(noteId) {
        return await this.apiCall(`/notes/${noteId}`, 'DELETE');
    }

    async bulkApproveNotes(noteIds) {
        return await this.apiCall('/notes/bulk-approve', 'POST', { noteIds });
    }

    async exportNotes(format = 'csv') {
        const response = await fetch(`${this.baseURL}/notes/export?format=${format}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        return response.blob();
    }

    // Payment Management
    async getPayments(page = 1, limit = 50, filters = {}) {
        const params = new URLSearchParams({
            page,
            limit,
            ...filters
        });
        return await this.apiCall(`/payments?${params}`);
    }

    async getPaymentById(paymentId) {
        return await this.apiCall(`/payments/${paymentId}`);
    }

    async approveWithdrawal(paymentId) {
        return await this.apiCall(`/payments/${paymentId}/approve`, 'POST');
    }

    async rejectWithdrawal(paymentId, reason) {
        return await this.apiCall(`/payments/${paymentId}/reject`, 'POST', { reason });
    }

    async getPaymentStats(period = '30d') {
        return await this.apiCall(`/payments/stats?period=${period}`);
    }

    // Analytics
    async getAnalytics(type, period = '30d') {
        return await this.apiCall(`/analytics/${type}?period=${period}`);
    }

    async getUserGrowthData(period = '30d') {
        return await this.apiCall(`/analytics/user-growth?period=${period}`);
    }

    async getRevenueData(period = '30d') {
        return await this.apiCall(`/analytics/revenue?period=${period}`);
    }

    async getSubjectPopularity() {
        return await this.apiCall('/analytics/subjects');
    }

    async getDownloadStats(period = '30d') {
        return await this.apiCall(`/analytics/downloads?period=${period}`);
    }

    // Database Management
    async getDatabaseInfo() {
        return await this.apiCall('/database/info');
    }

    async backupDatabase() {
        return await this.apiCall('/database/backup', 'POST');
    }

    async restoreDatabase(backupId) {
        return await this.apiCall('/database/restore', 'POST', { backupId });
    }

    async optimizeDatabase() {
        return await this.apiCall('/database/optimize', 'POST');
    }

    async getTableInfo(tableName) {
        return await this.apiCall(`/database/tables/${tableName}`);
    }

    async exportTable(tableName, format = 'csv') {
        const response = await fetch(`${this.baseURL}/database/tables/${tableName}/export?format=${format}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        return response.blob();
    }

    async optimizeTable(tableName) {
        return await this.apiCall(`/database/tables/${tableName}/optimize`, 'POST');
    }

    // System Settings
    async getSettings() {
        return await this.apiCall('/settings');
    }

    async updateSettings(settings) {
        return await this.apiCall('/settings', 'PUT', settings);
    }

    async getSystemHealth() {
        return await this.apiCall('/system/health');
    }

    async clearCache() {
        return await this.apiCall('/system/cache/clear', 'POST');
    }

    // Activity Logs
    async getActivityLogs(page = 1, limit = 50) {
        return await this.apiCall(`/logs/activity?page=${page}&limit=${limit}`);
    }

    async getErrorLogs(page = 1, limit = 50) {
        return await this.apiCall(`/logs/errors?page=${page}&limit=${limit}`);
    }

    // Reports
    async generateReport(type, params = {}) {
        return await this.apiCall('/reports/generate', 'POST', { type, params });
    }

    async getReportStatus(reportId) {
        return await this.apiCall(`/reports/${reportId}/status`);
    }

    async downloadReport(reportId) {
        const response = await fetch(`${this.baseURL}/reports/${reportId}/download`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        return response.blob();
    }

    // Notifications
    async getNotifications() {
        return await this.apiCall('/notifications');
    }

    async markNotificationRead(notificationId) {
        return await this.apiCall(`/notifications/${notificationId}/read`, 'POST');
    }

    async sendBulkNotification(notification) {
        return await this.apiCall('/notifications/bulk', 'POST', notification);
    }
}

// Database Schema and Operations
class DatabaseManager {
    constructor(apiInstance) {
        this.api = apiInstance;
        this.schema = {
            users: {
                id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                name: 'TEXT NOT NULL',
                email: 'TEXT UNIQUE NOT NULL',
                password: 'TEXT NOT NULL',
                role: 'TEXT DEFAULT "student"',
                status: 'TEXT DEFAULT "active"',
                subscription_type: 'TEXT DEFAULT "free"',
                subscription_expires: 'DATETIME',
                profile_image: 'TEXT',
                phone: 'TEXT',
                college: 'TEXT',
                course: 'TEXT',
                year: 'INTEGER',
                total_earnings: 'DECIMAL(10,2) DEFAULT 0',
                total_downloads: 'INTEGER DEFAULT 0',
                rating: 'DECIMAL(3,2) DEFAULT 0',
                created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
                updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
            },
            notes: {
                id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                title: 'TEXT NOT NULL',
                description: 'TEXT',
                subject: 'TEXT NOT NULL',
                chapter: 'TEXT',
                unit: 'TEXT',
                file_path: 'TEXT NOT NULL',
                file_type: 'TEXT NOT NULL',
                file_size: 'INTEGER',
                thumbnail: 'TEXT',
                price: 'DECIMAL(8,2) DEFAULT 0',
                user_id: 'INTEGER NOT NULL',
                status: 'TEXT DEFAULT "pending"',
                download_count: 'INTEGER DEFAULT 0',
                rating: 'DECIMAL(3,2) DEFAULT 0',
                rating_count: 'INTEGER DEFAULT 0',
                tags: 'TEXT',
                created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
                updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
                approved_at: 'DATETIME',
                approved_by: 'INTEGER'
            },
            payments: {
                id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                transaction_id: 'TEXT UNIQUE NOT NULL',
                user_id: 'INTEGER NOT NULL',
                type: 'TEXT NOT NULL', // subscription, withdrawal, commission
                amount: 'DECIMAL(10,2) NOT NULL',
                currency: 'TEXT DEFAULT "INR"',
                status: 'TEXT DEFAULT "pending"',
                payment_method: 'TEXT',
                gateway_response: 'TEXT',
                description: 'TEXT',
                created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
                processed_at: 'DATETIME'
            },
            downloads: {
                id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                user_id: 'INTEGER NOT NULL',
                note_id: 'INTEGER NOT NULL',
                download_date: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
                ip_address: 'TEXT',
                user_agent: 'TEXT'
            },
            ratings: {
                id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                user_id: 'INTEGER NOT NULL',
                note_id: 'INTEGER NOT NULL',
                rating: 'INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5)',
                review: 'TEXT',
                created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
            },
            sessions: {
                id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                user_id: 'INTEGER NOT NULL',
                session_token: 'TEXT UNIQUE NOT NULL',
                ip_address: 'TEXT',
                user_agent: 'TEXT',
                created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
                expires_at: 'DATETIME NOT NULL',
                last_activity: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
            },
            admin_logs: {
                id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                admin_id: 'INTEGER NOT NULL',
                action: 'TEXT NOT NULL',
                target_type: 'TEXT', // user, note, payment, etc.
                target_id: 'INTEGER',
                details: 'TEXT',
                ip_address: 'TEXT',
                created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
            },
            system_settings: {
                id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
                key: 'TEXT UNIQUE NOT NULL',
                value: 'TEXT',
                type: 'TEXT DEFAULT "string"',
                description: 'TEXT',
                updated_by: 'INTEGER',
                updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
            }
        };
    }

    // Database operations
    async createTables() {
        const queries = Object.entries(this.schema).map(([tableName, columns]) => {
            const columnDefs = Object.entries(columns)
                .map(([colName, colDef]) => `${colName} ${colDef}`)
                .join(', ');
            return `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`;
        });

        for (const query of queries) {
            await this.api.apiCall('/database/execute', 'POST', { query });
        }
    }

    async seedData() {
        // Insert default admin user
        const adminUser = {
            name: 'Admin User',
            email: 'admin@masterstudent.com',
            password: '$2b$10$hashedpassword', // Should be properly hashed
            role: 'admin',
            status: 'active'
        };

        await this.api.apiCall('/database/execute', 'POST', {
            query: 'INSERT OR IGNORE INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            params: [adminUser.name, adminUser.email, adminUser.password, adminUser.role, adminUser.status]
        });

        // Insert default system settings
        const defaultSettings = [
            { key: 'site_name', value: 'MasterStudent', description: 'Site name' },
            { key: 'site_description', value: 'India\'s top student notes marketplace', description: 'Site description' },
            { key: 'monthly_price', value: '59', type: 'number', description: 'Monthly subscription price' },
            { key: 'yearly_price', value: '499', type: 'number', description: 'Yearly subscription price' },
            { key: 'commission_rate', value: '30', type: 'number', description: 'Commission rate percentage' },
            { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Maintenance mode status' }
        ];

        for (const setting of defaultSettings) {
            await this.api.apiCall('/database/execute', 'POST', {
                query: 'INSERT OR IGNORE INTO system_settings (key, value, type, description) VALUES (?, ?, ?, ?)',
                params: [setting.key, setting.value, setting.type || 'string', setting.description]
            });
        }
    }

    // Data analysis methods
    async getUserStats() {
        const queries = [
            'SELECT COUNT(*) as total FROM users',
            'SELECT COUNT(*) as active FROM users WHERE status = "active"',
            'SELECT COUNT(*) as premium FROM users WHERE subscription_type != "free"',
            'SELECT COUNT(*) as new_today FROM users WHERE DATE(created_at) = DATE("now")'
        ];

        const results = {};
        for (const query of queries) {
            const result = await this.api.apiCall('/database/query', 'POST', { query });
            Object.assign(results, result[0]);
        }
        return results;
    }

    async getNotesStats() {
        const queries = [
            'SELECT COUNT(*) as total FROM notes',
            'SELECT COUNT(*) as approved FROM notes WHERE status = "approved"',
            'SELECT COUNT(*) as pending FROM notes WHERE status = "pending"',
            'SELECT SUM(download_count) as total_downloads FROM notes'
        ];

        const results = {};
        for (const query of queries) {
            const result = await this.api.apiCall('/database/query', 'POST', { query });
            Object.assign(results, result[0]);
        }
        return results;
    }

    async getRevenueStats() {
        const query = `
            SELECT 
                SUM(CASE WHEN type = 'subscription' THEN amount ELSE 0 END) as subscription_revenue,
                SUM(CASE WHEN type = 'commission' THEN amount ELSE 0 END) as commission_revenue,
                COUNT(CASE WHEN type = 'subscription' THEN 1 END) as subscription_count,
                COUNT(CASE WHEN type = 'withdrawal' AND status = 'pending' THEN 1 END) as pending_withdrawals
            FROM payments 
            WHERE status = 'completed'
        `;
        
        const result = await this.api.apiCall('/database/query', 'POST', { query });
        return result[0];
    }

    async getTopPerformers(limit = 10) {
        const query = `
            SELECT u.name, u.email, u.total_earnings, 
                   COUNT(n.id) as notes_count,
                   AVG(n.rating) as avg_rating
            FROM users u
            LEFT JOIN notes n ON u.id = n.user_id
            WHERE u.role = 'topper'
            GROUP BY u.id
            ORDER BY u.total_earnings DESC
            LIMIT ?
        `;
        
        return await this.api.apiCall('/database/query', 'POST', { 
            query, 
            params: [limit] 
        });
    }

    async getPopularSubjects() {
        const query = `
            SELECT subject, 
                   COUNT(*) as notes_count,
                   SUM(download_count) as total_downloads,
                   AVG(rating) as avg_rating
            FROM notes 
            WHERE status = 'approved'
            GROUP BY subject
            ORDER BY total_downloads DESC
        `;
        
        return await this.api.apiCall('/database/query', 'POST', { query });
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminAPI, DatabaseManager };
} else {
    window.AdminAPI = AdminAPI;
    window.DatabaseManager = DatabaseManager;
}
