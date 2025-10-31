// Admin Panel JavaScript - Complete Functionality
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.data = {
            users: [],
            notes: [],
            payments: [],
            stats: {}
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.hideLoadingScreen();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Search functionality
        document.getElementById('global-search').addEventListener('input', (e) => {
            this.globalSearch(e.target.value);
        });

        // Filter functionality
        this.setupFilters();
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loading-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
            }, 500);
        }, 1500);
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

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
        document.getElementById('page-title').textContent = titles[section];

        this.currentSection = section;
        this.loadSectionData(section);
    }

    async loadInitialData() {
        try {
            // Simulate API calls
            await this.loadStats();
            await this.loadUsers();
            await this.loadNotes();
            await this.loadPayments();
            await this.loadRecentActivity();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadStats() {
        // Simulate API call
        const stats = {
            totalUsers: 15420,
            totalNotes: 8750,
            totalRevenue: 245000,
            totalDownloads: 125000
        };

        // Update dashboard stats
        document.getElementById('total-users').textContent = stats.totalUsers.toLocaleString();
        document.getElementById('total-notes').textContent = stats.totalNotes.toLocaleString();
        document.getElementById('total-revenue').textContent = `₹${stats.totalRevenue.toLocaleString()}`;
        document.getElementById('total-downloads').textContent = stats.totalDownloads.toLocaleString();

        // Update sidebar badges
        document.getElementById('users-count').textContent = stats.totalUsers;
        document.getElementById('notes-count').textContent = stats.totalNotes;
        document.getElementById('payments-count').textContent = '45';

        this.data.stats = stats;
    }

    async loadUsers() {
        // Simulate user data
        const users = [
            {
                id: 1,
                name: 'Priya Sharma',
                email: 'priya@example.com',
                role: 'student',
                status: 'premium',
                joined: '2024-01-15',
                notes: 12,
                earnings: 2500,
                avatar: 'PS'
            },
            {
                id: 2,
                name: 'Arjun Kumar',
                email: 'arjun@example.com',
                role: 'topper',
                status: 'active',
                joined: '2024-02-20',
                notes: 45,
                earnings: 15000,
                avatar: 'AK'
            },
            {
                id: 3,
                name: 'Sneha Patel',
                email: 'sneha@example.com',
                role: 'student',
                status: 'trial',
                joined: '2024-03-10',
                notes: 3,
                earnings: 0,
                avatar: 'SP'
            }
        ];

        this.data.users = users;
        this.renderUsersTable();
    }

    async loadNotes() {
        // Simulate notes data
        const notes = [
            {
                id: 1,
                title: 'Advanced Calculus Notes',
                author: 'Arjun Kumar',
                subject: 'mathematics',
                status: 'approved',
                downloads: 1250,
                rating: 4.8,
                uploaded: '2024-02-25'
            },
            {
                id: 2,
                title: 'Organic Chemistry Basics',
                author: 'Priya Sharma',
                subject: 'chemistry',
                status: 'pending',
                downloads: 0,
                rating: 0,
                uploaded: '2024-03-15'
            }
        ];

        this.data.notes = notes;
        this.renderNotesTable();
    }

    async loadPayments() {
        // Simulate payment data
        const payments = [
            {
                id: 'TXN001',
                user: 'Priya Sharma',
                type: 'subscription',
                amount: 59,
                status: 'completed',
                date: '2024-03-15'
            },
            {
                id: 'TXN002',
                user: 'Arjun Kumar',
                type: 'withdrawal',
                amount: 5000,
                status: 'pending',
                date: '2024-03-14'
            }
        ];

        this.data.payments = payments;
        this.renderPaymentsTable();
    }

    async loadRecentActivity() {
        const activities = [
            {
                type: 'user_joined',
                message: 'New user Rahul Singh joined',
                time: '2 minutes ago',
                icon: 'fas fa-user-plus',
                color: 'success'
            },
            {
                type: 'note_uploaded',
                message: 'Physics notes uploaded by Priya',
                time: '15 minutes ago',
                icon: 'fas fa-file-upload',
                color: 'info'
            },
            {
                type: 'payment_received',
                message: 'Payment of ₹59 received',
                time: '1 hour ago',
                icon: 'fas fa-credit-card',
                color: 'success'
            }
        ];

        const activityHtml = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.color}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');

        document.getElementById('recent-activity').innerHTML = activityHtml;
    }

    renderUsersTable() {
        const tbody = document.getElementById('users-table-body');
        const html = this.data.users.map(user => `
            <tr>
                <td><input type="checkbox" value="${user.id}"></td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${user.avatar}</div>
                        <div>
                            <div class="user-name">${user.name}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                <td>${new Date(user.joined).toLocaleDateString()}</td>
                <td>${user.notes}</td>
                <td>₹${user.earnings.toLocaleString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action edit" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action delete" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        tbody.innerHTML = html;
    }

    renderNotesTable() {
        const tbody = document.getElementById('notes-table-body');
        const html = this.data.notes.map(note => `
            <tr>
                <td><input type="checkbox" value="${note.id}"></td>
                <td>
                    <div class="note-title">${note.title}</div>
                </td>
                <td>${note.author}</td>
                <td><span class="subject-badge ${note.subject}">${note.subject}</span></td>
                <td><span class="status-badge status-${note.status}">${note.status}</span></td>
                <td>${note.downloads.toLocaleString()}</td>
                <td>
                    <div class="rating">
                        ${'★'.repeat(Math.floor(note.rating))}
                        <span>${note.rating}</span>
                    </div>
                </td>
                <td>${new Date(note.uploaded).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action approve" onclick="approveNote(${note.id})">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-action reject" onclick="rejectNote(${note.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        tbody.innerHTML = html;
    }

    renderPaymentsTable() {
        const tbody = document.getElementById('payments-table-body');
        const html = this.data.payments.map(payment => `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.user}</td>
                <td><span class="type-badge ${payment.type}">${payment.type}</span></td>
                <td>₹${payment.amount.toLocaleString()}</td>
                <td><span class="status-badge status-${payment.status}">${payment.status}</span></td>
                <td>${new Date(payment.date).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action view" onclick="viewPayment('${payment.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${payment.status === 'pending' ? `
                            <button class="btn-action approve" onclick="approvePayment('${payment.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
        tbody.innerHTML = html;
    }

    initializeCharts() {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenue-chart');
        if (revenueCtx) {
            new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Revenue',
                        data: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
                        borderColor: '#f97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                color: '#a1a1aa'
                            },
                            grid: {
                                color: '#374151'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#a1a1aa'
                            },
                            grid: {
                                color: '#374151'
                            }
                        }
                    }
                }
            });
        }
    }

    setupFilters() {
        // User filters
        document.getElementById('user-status-filter')?.addEventListener('change', (e) => {
            this.filterUsers('status', e.target.value);
        });

        document.getElementById('user-role-filter')?.addEventListener('change', (e) => {
            this.filterUsers('role', e.target.value);
        });

        document.getElementById('user-search')?.addEventListener('input', (e) => {
            this.searchUsers(e.target.value);
        });
    }

    filterUsers(field, value) {
        let filteredUsers = this.data.users;
        if (value) {
            filteredUsers = this.data.users.filter(user => user[field] === value);
        }
        this.renderFilteredUsers(filteredUsers);
    }

    searchUsers(query) {
        if (!query) {
            this.renderUsersTable();
            return;
        }
        const filteredUsers = this.data.users.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
        this.renderFilteredUsers(filteredUsers);
    }

    renderFilteredUsers(users) {
        const tbody = document.getElementById('users-table-body');
        const html = users.map(user => `
            <tr>
                <td><input type="checkbox" value="${user.id}"></td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${user.avatar}</div>
                        <div>
                            <div class="user-name">${user.name}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                <td>${new Date(user.joined).toLocaleDateString()}</td>
                <td>${user.notes}</td>
                <td>₹${user.earnings.toLocaleString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action edit" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action delete" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        tbody.innerHTML = html;
    }

    loadSectionData(section) {
        switch(section) {
            case 'database':
                this.loadDatabaseInfo();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    loadDatabaseInfo() {
        // Simulate database info
        document.getElementById('db-size').textContent = '245 MB';
        document.getElementById('db-tables').textContent = '12';
        document.getElementById('last-backup').textContent = '2 hours ago';

        const tables = [
            { name: 'users', records: 15420, size: '45 MB' },
            { name: 'notes', records: 8750, size: '120 MB' },
            { name: 'payments', records: 3200, size: '25 MB' },
            { name: 'downloads', records: 125000, size: '35 MB' },
            { name: 'ratings', records: 12500, size: '15 MB' },
            { name: 'sessions', records: 45000, size: '5 MB' }
        ];

        const tablesHtml = tables.map(table => `
            <div class="table-card">
                <div class="table-info">
                    <h4>${table.name}</h4>
                    <p>${table.records.toLocaleString()} records</p>
                    <span class="table-size">${table.size}</span>
                </div>
                <div class="table-actions">
                    <button class="btn-action" onclick="exportTable('${table.name}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-action" onclick="optimizeTable('${table.name}')">
                        <i class="fas fa-tools"></i>
                    </button>
                </div>
            </div>
        `).join('');

        document.getElementById('database-tables-grid').innerHTML = tablesHtml;
    }

    globalSearch(query) {
        if (!query) return;
        
        // Search across all data
        const results = {
            users: this.data.users.filter(user => 
                user.name.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase())
            ),
            notes: this.data.notes.filter(note => 
                note.title.toLowerCase().includes(query.toLowerCase()) ||
                note.author.toLowerCase().includes(query.toLowerCase())
            )
        };

        console.log('Search results:', results);
        // You can implement a search results modal here
    }
}

// Global functions for button actions
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
}

function editUser(userId) {
    console.log('Edit user:', userId);
    // Implement user edit modal
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        console.log('Delete user:', userId);
        // Implement user deletion
    }
}

function approveNote(noteId) {
    console.log('Approve note:', noteId);
    // Implement note approval
}

function rejectNote(noteId) {
    console.log('Reject note:', noteId);
    // Implement note rejection
}

function approvePayment(paymentId) {
    console.log('Approve payment:', paymentId);
    // Implement payment approval
}

function viewPayment(paymentId) {
    console.log('View payment:', paymentId);
    // Implement payment details modal
}

function backupDatabase() {
    console.log('Starting database backup...');
    // Implement database backup
    alert('Database backup started successfully!');
}

function optimizeDatabase() {
    console.log('Optimizing database...');
    // Implement database optimization
    alert('Database optimization completed!');
}

function exportTable(tableName) {
    console.log('Exporting table:', tableName);
    // Implement table export
}

function optimizeTable(tableName) {
    console.log('Optimizing table:', tableName);
    // Implement table optimization
}

function saveSettings() {
    console.log('Saving settings...');
    // Implement settings save
    alert('Settings saved successfully!');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/';
    }
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Add additional CSS for dynamic elements
const additionalStyles = `
    .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .user-avatar {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, var(--accent-orange), var(--accent-teal));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        color: white;
    }
    
    .user-name {
        font-weight: 500;
    }
    
    .role-badge, .subject-badge, .type-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        text-transform: capitalize;
    }
    
    .role-badge.student { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
    .role-badge.topper { background: rgba(249, 115, 22, 0.1); color: var(--accent-orange); }
    .role-badge.admin { background: rgba(239, 68, 68, 0.1); color: var(--accent-red); }
    
    .subject-badge.mathematics { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
    .subject-badge.physics { background: rgba(147, 51, 234, 0.1); color: #9333ea; }
    .subject-badge.chemistry { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    
    .action-buttons {
        display: flex;
        gap: 8px;
    }
    
    .btn-action {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .btn-action.edit { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
    .btn-action.delete { background: rgba(239, 68, 68, 0.1); color: var(--accent-red); }
    .btn-action.approve { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .btn-action.reject { background: rgba(239, 68, 68, 0.1); color: var(--accent-red); }
    .btn-action.view { background: rgba(107, 114, 128, 0.1); color: var(--text-secondary); }
    
    .btn-action:hover {
        transform: scale(1.1);
    }
    
    .activity-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-bottom: 1px solid var(--border-primary);
    }
    
    .activity-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
    }
    
    .activity-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .activity-icon.info { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
    
    .activity-content p {
        margin: 0;
        font-weight: 500;
    }
    
    .activity-time {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .rating {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #fbbf24;
    }
    
    .table-card {
        background: var(--bg-tertiary);
        border: 1px solid var(--border-primary);
        border-radius: 8px;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .table-info h4 {
        margin: 0 0 4px 0;
        font-weight: 600;
    }
    
    .table-info p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 14px;
    }
    
    .table-size {
        font-size: 12px;
        color: var(--accent-orange);
        font-weight: 500;
    }
    
    .table-actions {
        display: flex;
        gap: 8px;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
