// Storage Factory for Admin Server
const path = require('path');

// Import the storage classes
async function createStorage() {
    try {
        // Try to use the bridge to connect to main website
        const { MainWebsiteStorageBridge } = require('../admin-storage-bridge.cjs');
        const bridge = new MainWebsiteStorageBridge();
        
        // Test connection to main website
        const stats = await bridge.getAdminStats();
        if (stats) {
            console.log('Connected to main website via API bridge');
            return bridge;
        } else {
            throw new Error('Main website not responding');
        }
    } catch (error) {
        console.error('Failed to connect to main website:', error.message);
        console.log('Using fallback storage implementation for admin panel');
        return new SimpleStorage();
    }
}

// Simple fallback storage for admin operations
class SimpleStorage {
    constructor() {
        this.users = [
            {
                id: '1',
                email: 'admin@masterstudent.com',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                isActive: true,
                createdAt: new Date(),
                totalEarned: 0
            },
            {
                id: '2',
                email: 'john.doe@student.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'student',
                isActive: true,
                createdAt: new Date(Date.now() - 86400000), // 1 day ago
                totalEarned: 0
            },
            {
                id: '3',
                email: 'jane.smith@topper.com',
                firstName: 'Jane',
                lastName: 'Smith',
                role: 'topper',
                isActive: true,
                createdAt: new Date(Date.now() - 172800000), // 2 days ago
                totalEarned: 1250
            },
            {
                id: '4',
                email: 'mike.johnson@student.com',
                firstName: 'Mike',
                lastName: 'Johnson',
                role: 'student',
                isActive: true,
                createdAt: new Date(Date.now() - 259200000), // 3 days ago
                totalEarned: 0
            },
            {
                id: '5',
                email: 'sarah.wilson@topper.com',
                firstName: 'Sarah',
                lastName: 'Wilson',
                role: 'topper',
                isActive: true,
                createdAt: new Date(Date.now() - 345600000), // 4 days ago
                totalEarned: 890
            }
        ];
        
        this.notes = [
            {
                id: '1',
                title: 'Physics - Kinematics Notes',
                subject: 'Physics',
                status: 'published',
                topperId: '3',
                downloadsCount: 45,
                createdAt: new Date(Date.now() - 86400000),
                authorName: 'Jane Smith',
                authorEmail: 'jane.smith@topper.com',
                authorRole: 'topper'
            },
            {
                id: '2',
                title: 'Mathematics - Calculus Basics',
                subject: 'Mathematics',
                status: 'submitted',
                topperId: '5',
                downloadsCount: 0,
                createdAt: new Date(Date.now() - 43200000), // 12 hours ago
                authorName: 'Sarah Wilson',
                authorEmail: 'sarah.wilson@topper.com',
                authorRole: 'topper'
            },
            {
                id: '3',
                title: 'Chemistry - Organic Compounds',
                subject: 'Chemistry',
                status: 'published',
                topperId: '3',
                downloadsCount: 32,
                createdAt: new Date(Date.now() - 172800000),
                authorName: 'Jane Smith',
                authorEmail: 'jane.smith@topper.com',
                authorRole: 'topper'
            }
        ];
        
        this.activities = [];
    }

    async getUserByEmail(email) {
        return this.users.find(u => u.email === email);
    }

    async upsertUser(userData) {
        const existingUser = this.users.find(u => u.email === userData.email);
        if (existingUser) {
            Object.assign(existingUser, userData);
            return existingUser;
        } else {
            const newUser = {
                id: Date.now().toString(),
                ...userData,
                isActive: true,
                createdAt: new Date(),
                totalEarned: 0
            };
            this.users.push(newUser);
            return newUser;
        }
    }

    async getAdminStats() {
        return {
            totalUsers: this.users.length,
            totalNotes: this.notes.length,
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

        // Return empty array if no real activities
        return [];
    }

    async getAllNotesForAdmin(filters = {}) {
        return {
            notes: this.notes,
            total: this.notes.length
        };
    }

    async updateNoteStatus(id, status, reviewerId) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.status = status;
            note.reviewerId = reviewerId;
            if (status === 'published') {
                note.publishedAt = new Date();
            }
        }
        return note;
    }

    // Add other required methods as stubs
    async getUsers() {
        return this.users;
    }
}

module.exports = { createStorage };
