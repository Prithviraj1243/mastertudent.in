// Bridge to connect admin panel to main website storage via HTTP API
const fetch = require('node-fetch');

class MainWebsiteStorageBridge {
    constructor() {
        this.baseURL = 'http://127.0.0.1:8000/api';
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error.message);
            return null;
        }
    }

    async getUserByEmail(email) {
        // Since we can't directly access user by email via API, we'll simulate
        if (email === 'admin@masterstudent.com') {
            return {
                id: '1',
                email: 'admin@masterstudent.com',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                isActive: true,
                createdAt: new Date(),
                totalEarned: 0
            };
        }
        return null;
    }

    async upsertUser(userData) {
        // For admin panel, we'll just return the user data
        return {
            id: userData.id || Date.now().toString(),
            ...userData,
            isActive: true,
            createdAt: new Date(),
            totalEarned: 0
        };
    }

    async getAdminStats() {
        // Get real stats from main website
        const overview = await this.makeRequest('/admin/overview');
        const userStats = await this.makeRequest('/admin/user-stats');
        const noteStats = await this.makeRequest('/admin/note-stats');
        
        if (overview || userStats || noteStats) {
            return {
                totalUsers: overview?.totalUsers || userStats?.totalUsers || 0,
                totalNotes: overview?.totalNotes || noteStats?.totalNotes || 0,
                activeSubscriptions: overview?.activeUsers || 0,
                pendingReviews: noteStats?.pending || 0,
                pendingNotes: noteStats?.pending || 0,
                pendingPayments: 0,
                totalRevenue: 0,
                totalDownloads: overview?.totalDownloads || noteStats?.totalDownloads || 0
            };
        }

        // Fallback stats
        return {
            totalUsers: 1,
            totalNotes: 0,
            activeSubscriptions: 0,
            pendingReviews: 0
        };
    }

    async getUserActivity() {
        // Try to get real activity from main website
        const activity = await this.makeRequest('/admin/activity');
        if (activity && Array.isArray(activity)) {
            return activity.map(act => ({
                userName: act.userName || 'Unknown User',
                action: act.action || 'unknown_action',
                timestamp: act.timestamp || new Date().toISOString()
            }));
        }

        // Fallback activity
        return [
            {
                userName: 'System',
                action: 'server_start',
                timestamp: new Date().toISOString()
            }
        ];
    }

    async getAllNotesForAdmin(filters = {}) {
        // Try to get real notes from main website
        const notes = await this.makeRequest('/admin/notes');
        if (notes && Array.isArray(notes)) {
            return {
                notes: notes.map(note => ({
                    id: note.id,
                    title: note.title || 'Untitled Note',
                    subject: note.subject || 'Unknown Subject',
                    status: note.status || 'pending',
                    downloadsCount: note.downloads || 0,
                    createdAt: note.createdAt || new Date(),
                    authorName: note.uploader || 'Unknown User',
                    authorEmail: note.uploaderEmail || 'unknown@email.com',
                    authorRole: 'topper'
                })),
                total: notes.length
            };
        }

        // Fallback
        return {
            notes: [],
            total: 0
        };
    }

    async updateNoteStatus(id, status, reviewerId) {
        const result = await this.makeRequest(`/admin/notes/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, reviewerId })
        });
        return result;
    }

    async getUsers(filters = {}) {
        // Try to get real users from main website
        const users = await this.makeRequest('/admin/users');
        if (users && Array.isArray(users)) {
            return users.map(user => ({
                id: user.id,
                name: user.name || 'Unknown User',
                email: user.email || 'No email',
                role: user.role || 'student',
                status: user.isActive ? 'active' : 'inactive',
                created_at: user.createdAt || new Date(),
                total_earnings: user.totalEarned || 0,
                notes_count: 0 // Would need additional API call
            }));
        }

        // Fallback - return admin user
        return [
            {
                id: '1',
                name: 'Admin User',
                email: 'admin@masterstudent.com',
                role: 'admin',
                status: 'active',
                created_at: new Date(),
                total_earnings: 0
            }
        ];
    }

    async getUserDetailedInfo(userId) {
        const userDetails = await this.makeRequest(`/admin/users/${userId}/details`);
        if (userDetails) {
            return userDetails;
        }
        return null;
    }

    async getUserSessions(userId) {
        const sessions = await this.makeRequest(`/admin/users/${userId}/sessions`);
        if (sessions && Array.isArray(sessions)) {
            return sessions;
        }
        return [];
    }

    async getUserActivityById(userId) {
        const activities = await this.makeRequest(`/admin/users/${userId}/activity`);
        if (activities && Array.isArray(activities)) {
            return activities;
        }
        return [];
    }

    // Get individual note by ID
    async getNoteById(noteId) {
        const note = await this.makeRequest(`/admin/notes/${noteId}`);
        if (note) {
            return note;
        }
        return null;
    }

    // Update note status (publish/reject)
    async updateNoteStatus(noteId, status) {
        const endpoint = status === 'published' ? `/admin/notes/${noteId}/publish` : `/admin/notes/${noteId}/reject`;
        const result = await this.makeRequest(endpoint, { method: 'PUT' });
        return result;
    }

    async getUsers() {
        return this.users;
    }
}

module.exports = { MainWebsiteStorageBridge };
