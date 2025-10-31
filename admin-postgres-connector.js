// PostgreSQL Connector for Admin Panel
// This demonstrates how to connect the admin panel to the actual PostgreSQL database

const { Pool } = require('pg');

class PostgreSQLAdminStorage {
    constructor() {
        // Use the same DATABASE_URL as the main website
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    }

    async getUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await this.pool.query(query, [email]);
        return result.rows[0];
    }

    async getAdminStats() {
        const queries = {
            totalUsers: 'SELECT COUNT(*) as count FROM users',
            totalNotes: 'SELECT COUNT(*) as count FROM notes',
            activeSubscriptions: 'SELECT COUNT(*) as count FROM subscriptions WHERE status = $1',
            pendingReviews: 'SELECT COUNT(*) as count FROM notes WHERE status = $1'
        };

        const results = {};
        
        // Execute all queries
        const totalUsersResult = await this.pool.query(queries.totalUsers);
        results.totalUsers = parseInt(totalUsersResult.rows[0].count);

        const totalNotesResult = await this.pool.query(queries.totalNotes);
        results.totalNotes = parseInt(totalNotesResult.rows[0].count);

        const activeSubsResult = await this.pool.query(queries.activeSubscriptions, ['active']);
        results.activeSubscriptions = parseInt(activeSubsResult.rows[0].count);

        const pendingReviewsResult = await this.pool.query(queries.pendingReviews, ['submitted']);
        results.pendingReviews = parseInt(pendingReviewsResult.rows[0].count);

        return results;
    }

    async getUsers(filters = {}) {
        let query = `
            SELECT id, first_name, last_name, email, role, is_active, created_at, 
                   total_earned, coin_balance
            FROM users 
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;

        if (filters.role) {
            paramCount++;
            query += ` AND role = $${paramCount}`;
            params.push(filters.role);
        }

        if (filters.status) {
            paramCount++;
            if (filters.status === 'active') {
                query += ` AND is_active = $${paramCount}`;
                params.push(true);
            } else if (filters.status === 'inactive') {
                query += ` AND is_active = $${paramCount}`;
                params.push(false);
            }
        }

        if (filters.search) {
            paramCount++;
            query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${filters.search}%`);
        }

        query += ' ORDER BY created_at DESC';

        if (filters.limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
        }

        if (filters.offset) {
            paramCount++;
            query += ` OFFSET $${paramCount}`;
            params.push(filters.offset);
        }

        const result = await this.pool.query(query, params);
        return result.rows.map(user => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role,
            status: user.is_active ? 'active' : 'inactive',
            created_at: user.created_at,
            total_earnings: user.total_earned || 0,
            notes_count: 0 // Would need a JOIN to get this
        }));
    }

    async getAllNotesForAdmin(filters = {}) {
        let query = `
            SELECT n.*, u.first_name, u.last_name, u.email as author_email
            FROM notes n
            JOIN users u ON n.topper_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;

        if (filters.status) {
            paramCount++;
            query += ` AND n.status = $${paramCount}`;
            params.push(filters.status);
        }

        if (filters.subject) {
            paramCount++;
            query += ` AND n.subject = $${paramCount}`;
            params.push(filters.subject);
        }

        query += ' ORDER BY n.created_at DESC';

        if (filters.limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
        }

        if (filters.offset) {
            paramCount++;
            query += ` OFFSET $${paramCount}`;
            params.push(filters.offset);
        }

        const result = await this.pool.query(query, params);
        const notes = result.rows.map(note => ({
            ...note,
            authorName: `${note.first_name} ${note.last_name}`,
            authorEmail: note.author_email,
            authorRole: 'topper'
        }));

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM notes n WHERE 1=1';
        const countParams = [];
        let countParamCount = 0;

        if (filters.status) {
            countParamCount++;
            countQuery += ` AND n.status = $${countParamCount}`;
            countParams.push(filters.status);
        }

        if (filters.subject) {
            countParamCount++;
            countQuery += ` AND n.subject = $${countParamCount}`;
            countParams.push(filters.subject);
        }

        const countResult = await this.pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        return { notes, total };
    }

    async updateNoteStatus(id, status, reviewerId) {
        const query = `
            UPDATE notes 
            SET status = $1, reviewer_id = $2, updated_at = NOW()
            ${status === 'published' ? ', published_at = NOW()' : ''}
            WHERE id = $3
            RETURNING *
        `;
        const params = [status, reviewerId, id];
        const result = await this.pool.query(query, params);
        return result.rows[0];
    }

    async getUserActivity() {
        // This would query actual user activity logs from the database
        const query = `
            SELECT u.first_name, u.last_name, al.action, al.created_at, al.details
            FROM activity_logs al
            JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 20
        `;
        
        try {
            const result = await this.pool.query(query);
            return result.rows.map(row => ({
                userName: `${row.first_name} ${row.last_name}`,
                action: row.action,
                timestamp: row.created_at.toISOString()
            }));
        } catch (error) {
            // If activity_logs table doesn't exist, return empty array
            console.log('Activity logs table not found, returning empty activity');
            return [];
        }
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = { PostgreSQLAdminStorage };

// Usage example:
// const storage = new PostgreSQLAdminStorage();
// const stats = await storage.getAdminStats();
// console.log('Admin stats:', stats);
