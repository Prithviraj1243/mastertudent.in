# 🚀 MasterStudent Admin Panel

A comprehensive, modern admin dashboard for managing the Student Notes Marketplace with full database control, user management, and analytics.

## ✨ Features

### 📊 **Dashboard Overview**
- Real-time statistics and KPIs
- User growth metrics
- Revenue tracking
- Download analytics
- Recent activity feed

### 👥 **User Management**
- Complete CRUD operations
- Advanced filtering and search
- Bulk actions (delete, export)
- User status management
- Role-based permissions

### 📝 **Notes Management**
- Content approval/rejection system
- Subject-wise categorization
- Download tracking
- Rating management
- Bulk moderation tools

### 💳 **Payment Management**
- Transaction monitoring
- Withdrawal approvals
- Revenue analytics
- Payment method tracking
- Commission management

### 📈 **Analytics & Reports**
- User growth charts
- Revenue trends
- Popular subjects analysis
- Download statistics
- Custom report generation

### 🗄️ **Database Management**
- Complete database control
- Backup and restore
- Table optimization
- Size monitoring
- Query execution

### ⚙️ **System Settings**
- Site configuration
- Payment settings
- Email configuration
- Maintenance mode
- Feature toggles

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Setup

1. **Install Dependencies**
   ```bash
   cd /Users/prithviraj/Downloads/StudentNotesMarketplace
   cp admin-package.json package.json
   npm install
   ```

2. **Start Admin Server**
   ```bash
   node admin-server.js
   ```

3. **Access Admin Panel**
   - Open: `http://localhost:3001/admin`
   - Default credentials:
     - Email: `admin@masterstudent.com`
     - Password: `admin123`

### Environment Variables
Create a `.env` file:
```env
ADMIN_PORT=3001
JWT_SECRET=your-super-secret-admin-key-change-this
DB_PATH=./admin_database.db
UPLOAD_DIR=./uploads
BACKUP_DIR=./backups
```

## 🎨 Design Features

### Modern Dark Theme
- **Primary Colors**: Black background with orange/teal/lime accents
- **Typography**: Inter font family for readability
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Works on all screen sizes

### UI Components
- **Cards**: Glassmorphism effect with subtle borders
- **Tables**: Sortable with advanced filtering
- **Charts**: Interactive Chart.js visualizations
- **Modals**: Smooth overlay system
- **Forms**: Real-time validation

## 🔧 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/verify` - Token verification

### Dashboard
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/activity` - Recent activity

### User Management
- `GET /api/admin/users` - List users with pagination
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/bulk-delete` - Bulk delete users

### Notes Management
- `GET /api/admin/notes` - List notes with filters
- `POST /api/admin/notes/:id/approve` - Approve note
- `POST /api/admin/notes/:id/reject` - Reject note
- `DELETE /api/admin/notes/:id` - Delete note

### Payments
- `GET /api/admin/payments` - List payments
- `POST /api/admin/payments/:id/approve` - Approve withdrawal
- `GET /api/admin/payments/stats` - Payment statistics

### Analytics
- `GET /api/admin/analytics/user-growth` - User growth data
- `GET /api/admin/analytics/revenue` - Revenue trends
- `GET /api/admin/analytics/subjects` - Subject popularity

### Database
- `GET /api/admin/database/info` - Database information
- `POST /api/admin/database/backup` - Create backup
- `POST /api/admin/database/optimize` - Optimize database

## 📁 File Structure

```
admin panel/
├── admin-dashboard.html    # Main admin interface
├── admin-styles.css       # Modern dark theme styles
├── admin-script.js        # Frontend functionality
├── admin-api.js          # API integration layer
├── admin-server.js       # Backend server
├── admin-package.json    # Dependencies
└── ADMIN-README.md       # This file

Database:
├── admin_database.db     # SQLite database
├── uploads/              # File uploads
└── backups/              # Database backups
```

## 🗃️ Database Schema

### Tables
- **users** - User accounts and profiles
- **notes** - Study materials and content
- **payments** - Transactions and withdrawals
- **downloads** - Download tracking
- **ratings** - User ratings and reviews
- **admin_logs** - Admin action logging
- **system_settings** - Configuration settings

### Key Features
- **Foreign Keys**: Proper relationships
- **Indexes**: Optimized queries
- **Constraints**: Data integrity
- **Triggers**: Automatic updates

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **Input Validation**: express-validator
- **Rate Limiting**: Prevent abuse
- **CORS Protection**: Cross-origin security
- **SQL Injection Prevention**: Parameterized queries

## 📊 Analytics Dashboard

### Charts Available
- **Line Charts**: User growth, revenue trends
- **Pie Charts**: Subject distribution
- **Bar Charts**: Download statistics
- **Area Charts**: Monthly comparisons

### Metrics Tracked
- Daily/Monthly active users
- Revenue by payment method
- Popular subjects and topics
- Download patterns
- User engagement rates

## 🚀 Advanced Features

### Real-time Updates
- Live statistics refresh
- Activity feed updates
- Notification system
- Auto-refresh dashboards

### Export Capabilities
- CSV/Excel exports
- PDF reports
- Data visualization exports
- Backup downloads

### Bulk Operations
- Mass user management
- Bulk content approval
- Batch data processing
- Multi-select actions

## 🛡️ Admin Permissions

### Super Admin
- Full system access
- User management
- System settings
- Database operations

### Content Moderator
- Notes approval/rejection
- User content review
- Basic analytics access

### Support Admin
- User support tools
- Payment assistance
- Limited analytics

## 📱 Mobile Responsive

- **Breakpoints**: Mobile, tablet, desktop
- **Navigation**: Collapsible sidebar
- **Tables**: Horizontal scroll
- **Charts**: Touch-friendly
- **Forms**: Mobile-optimized inputs

## 🔧 Customization

### Themes
- Easy color scheme changes
- CSS custom properties
- Component-based styling
- Dark/light mode toggle

### Features
- Modular components
- Plugin architecture
- Custom widgets
- Extensible API

## 📈 Performance

### Optimizations
- **Database**: Indexed queries
- **Frontend**: Lazy loading
- **API**: Response caching
- **Images**: Optimized assets

### Monitoring
- Query performance tracking
- API response times
- Error rate monitoring
- User activity analytics

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check database file permissions
   chmod 644 admin_database.db
   ```

2. **Port Already in Use**
   ```bash
   # Change port in admin-server.js or kill process
   lsof -ti:3001 | xargs kill -9
   ```

3. **Authentication Issues**
   ```bash
   # Reset admin password in database
   # Or recreate admin user
   ```

### Logs Location
- **Application**: Console output
- **Database**: SQLite logs
- **Admin Actions**: admin_logs table

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

For issues or questions:
- Check troubleshooting section
- Review API documentation
- Contact development team

---

## 🎯 Quick Start Commands

```bash
# Install and start
npm install
node admin-server.js

# Development mode
npm run dev

# Create backup
curl -X POST http://localhost:3001/api/admin/database/backup \
  -H "Authorization: Bearer YOUR_TOKEN"

# View logs
tail -f admin.log
```

**🚀 Your admin panel is ready! Access it at `http://localhost:3001/admin`**
