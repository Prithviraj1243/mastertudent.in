// Enhanced Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.api = new AdminAPI();
        this.dbManager = new DatabaseManager(this.api);
        this.currentSection = 'dashboard';
        this.charts = {};
        this.refreshInterval = null;
        
        this.init();
    }

    async init() {
        // Check authentication
        if (!await this.checkAuth()) {
            return;
        }

        // Initialize dashboard
        await this.initializeDashboard();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start real-time updates
        this.startRealTimeUpdates();
        
        // Hide loading screen
        this.hideLoadingScreen();
    }

    async checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = '/admin/login';
            return false;
        }

        try {
            const result = await this.api.verifyToken();
            if (!result.success) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = '/admin/login';
                return false;
            }
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/admin/login';
            return false;
        }
    }

    async initializeDashboard() {
        try {
            // Load dashboard statistics
            await this.loadDashboardStats();
            
            // Load today's stats
            await this.loadTodayStats();
            
            // Load recent activity
            await this.loadRecentActivity();
            
            // Initialize charts
            this.initializeCharts();
            
            // Update admin profile
            this.updateAdminProfile();
            
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    async loadDashboardStats() {
        try {
            const stats = await this.api.getDashboardStats();
            
            // Update main stats
            document.getElementById('total-users').textContent = this.formatNumber(stats.totalUsers || 0);
            document.getElementById('total-notes').textContent = this.formatNumber(stats.totalNotes || 0);
            document.getElementById('total-revenue').textContent = `₹${this.formatNumber(stats.totalRevenue || 0)}`;
            document.getElementById('total-downloads').textContent = this.formatNumber(stats.totalDownloads || 0);
            
            // Update sidebar badges
            document.getElementById('users-count').textContent = stats.totalUsers || 0;
            document.getElementById('notes-count').textContent = stats.pendingNotes || 0;
            document.getElementById('payments-count').textContent = stats.pendingPayments || 0;
            
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    }

    async loadTodayStats() {
        try {
            const todayStats = await this.api.getTodayStats();
            
            document.getElementById('today-users').textContent = todayStats.newUsers || 0;
            document.getElementById('today-notes').textContent = todayStats.notesUploaded || 0;
            document.getElementById('today-revenue').textContent = `₹${this.formatNumber(todayStats.revenue || 0)}`;
            document.getElementById('pending-approvals').textContent = todayStats.pendingApprovals || 0;
            
        } catch (error) {
            console.error('Failed to load today stats:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const activities = await this.api.getRecentActivity(10);
            const activityContainer = document.getElementById('recent-activity');
            
            if (activities && activities.length > 0) {
                activityContainer.innerHTML = activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-avatar">${this.getActivityAvatar(activity)}</div>
                        <div class="activity-content">
                            <div class="activity-text">${activity.description}</div>
                            <div class="activity-time">${this.formatTimeAgo(activity.created_at)}</div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load recent activity:', error);
        }
    }

    initializeCharts() {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenue-chart');
        if (revenueCtx) {
            this.charts.revenue = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Revenue',
                        data: [12000, 19000, 15000, 25000, 22000, 30000],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#f1f5f9'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', this.toggleSidebar);
        }

        // Global search
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', this.handleGlobalSearch.bind(this));
        }

        // Chart period buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard Overview',
            users: 'User Management',
            notes: 'Notes Management',
            payments: 'Payment Management',
            analytics: 'Analytics & Reports',
            database: 'Database Management',
            settings: 'System Settings'
        };
        document.getElementById('page-title').textContent = titles[sectionName] || 'Dashboard';

        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    async loadSectionData(section) {
        switch (section) {
            case 'users':
                await this.loadUsersData();
                break;
            case 'notes':
                await this.loadNotesData();
                break;
            case 'payments':
                await this.loadPaymentsData();
                break;
            case 'analytics':
                await this.loadAnalyticsData();
                break;
            case 'database':
                await this.loadDatabaseData();
                break;
            case 'settings':
                await this.loadSettingsData();
                break;
        }
    }

    async loadUsersData() {
        try {
            const users = await this.api.getUsers(1, 50);
            // Populate users table
            this.populateUsersTable(users.data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    populateUsersTable(users) {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td><input type="checkbox" value="${user.id}"></td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="user-name">${user.name}</div>
                            <div class="user-id">#${user.id}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${user.status}">${user.status}</span></td>
                <td>${this.formatDate(user.created_at)}</td>
                <td>${user.notes_count || 0}</td>
                <td>₹${this.formatNumber(user.total_earnings || 0)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="viewUser(${user.id})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="editUser(${user.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon danger" onclick="deleteUser(${user.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    startRealTimeUpdates() {
        // Update dashboard stats every 30 seconds
        this.refreshInterval = setInterval(async () => {
            if (this.currentSection === 'dashboard') {
                await this.loadDashboardStats();
                await this.loadTodayStats();
                await this.loadRecentActivity();
            }
        }, 30000);
    }

    stopRealTimeUpdates() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    updateAdminProfile() {
        const user = this.api.getCurrentUser();
        if (user) {
            const profileName = document.querySelector('.profile-info h4');
            const profileRole = document.querySelector('.profile-info p');
            
            if (profileName) profileName.textContent = user.name || 'Admin User';
            if (profileRole) profileRole.textContent = user.role || 'Super Admin';
        }
    }

    toggleSidebar() {
        document.querySelector('.admin-dashboard').classList.toggle('sidebar-collapsed');
    }

    handleGlobalSearch(e) {
        const query = e.target.value.toLowerCase();
        // Implement global search functionality
        console.log('Searching for:', query);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Utility functions
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        } else {
            return `${Math.floor(diffInSeconds / 86400)} days ago`;
        }
    }

    getActivityAvatar(activity) {
        const avatars = {
            'user_registered': '👤',
            'note_uploaded': '📝',
            'payment_made': '💳',
            'note_downloaded': '📥',
            'user_upgraded': '⭐'
        };
        return avatars[activity.type] || activity.user_name?.charAt(0).toUpperCase() || '?';
    }
}

// Global functions for button actions
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        const api = new AdminAPI();
        api.logout();
    }
}

function setChartPeriod(period) {
    console.log('Setting chart period to:', period);
    // Implement chart period change
}

function viewUser(userId) {
    console.log('Viewing user:', userId);
    // Implement user view modal
}

function editUser(userId) {
    console.log('Editing user:', userId);
    // Implement user edit modal
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        console.log('Deleting user:', userId);
        // Implement user deletion
    }
}

function addUser() {
    console.log('Adding new user');
    // Implement add user modal
}

function exportUsers() {
    console.log('Exporting users');
    // Implement user export
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.adminDashboard) {
        window.adminDashboard.stopRealTimeUpdates();
    }
});
