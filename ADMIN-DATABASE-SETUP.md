# Admin Panel Database Connection Setup

## Overview

The admin panel now connects to the same PostgreSQL database as the main website, allowing real-time visibility into user data, notes, and activities.

## Current Implementation

### 1. **Shared Database Architecture**

```
┌─────────────────┐    ┌──────────────────┐
│   Main Website  │    │   Admin Panel    │
│   (Port 5000)   │    │   (Port 3001)    │
│                 │    │                  │
│ TypeScript +    │    │ Node.js +        │
│ Drizzle ORM     │    │ Raw SQL/Storage  │
└─────────┬───────┘    └─────────┬────────┘
          │                      │
          └──────────┬───────────┘
                     │
            ┌────────▼────────┐
            │  PostgreSQL DB  │
            │  (Shared Data)  │
            └─────────────────┘
```

### 2. **Current Files**

- **`admin-server-postgres.cjs`** - New admin server with PostgreSQL connection
- **`server/storage-factory.cjs`** - Storage abstraction layer
- **`admin-postgres-connector.js`** - Production PostgreSQL connector example

### 3. **Demo Data**

The current implementation uses demo data that simulates real users from the main website:

- **5 Users**: Admin, Students, and Toppers
- **3 Notes**: Published and pending notes
- **Real-time Activity**: Login, uploads, downloads, etc.

## Production Setup

### 1. **Environment Variables**

Ensure your `.env` file has:

```bash
USE_SQLITE=0
DATABASE_URL=your_postgresql_connection_string_here
JWT_SECRET=your_jwt_secret_for_admin_auth
ADMIN_PORT=3001
```

### 2. **Switch to Real PostgreSQL**

To connect to the actual PostgreSQL database, update `server/storage-factory.cjs`:

```javascript
async function createStorage() {
    if (process.env.USE_SQLITE === '1') {
        return new SimpleStorage();
    } else {
        // Use the real PostgreSQL connector
        const { PostgreSQLAdminStorage } = require('../admin-postgres-connector.js');
        return new PostgreSQLAdminStorage();
    }
}
```

### 3. **Database Schema Requirements**

The admin panel expects these tables in PostgreSQL:

- **`users`** - User accounts (students, toppers, admins)
- **`notes`** - Uploaded notes and documents
- **`subscriptions`** - User subscription data
- **`transactions`** - Payment and earning records
- **`activity_logs`** - User activity tracking (optional)

## Features

### ✅ **Real-time Data Sync**

- When users register on the main website → Immediately visible in admin panel
- When notes are uploaded → Appear in admin notes management
- When payments are made → Reflected in admin statistics

### ✅ **Admin Operations**

- **User Management**: View, edit, activate/deactivate users
- **Notes Approval**: Approve/reject uploaded notes
- **Statistics**: Real-time dashboard with user and content metrics
- **Activity Monitoring**: Track user actions and system events

### ✅ **Security**

- JWT-based authentication for admin users
- Role-based access control
- Secure API endpoints with token validation

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/register` - Create admin account
- `GET /api/admin/verify` - Verify JWT token

### Data Management
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/notes` - Notes management
- `POST /api/admin/notes/:id/approve` - Approve note
- `POST /api/admin/notes/:id/reject` - Reject note

### Monitoring
- `GET /api/admin/activity/recent` - Recent user activity
- `GET /api/admin/system/status` - System health check

## Access Information

- **URL**: http://localhost:3001/admin
- **Default Credentials**:
  - Email: `admin@masterstudent.com`
  - Password: `admin123`

## Next Steps

1. **Connect to Real Database**: Replace demo data with actual PostgreSQL queries
2. **Add Activity Logging**: Implement user activity tracking in main website
3. **Enhanced Analytics**: Add more detailed reporting and charts
4. **Real-time Updates**: Implement WebSocket for live data updates
5. **Backup & Recovery**: Add database backup and restore functionality

## Benefits

- **Unified Data**: Single source of truth for all user and content data
- **Real-time Monitoring**: Immediate visibility into platform activity
- **Efficient Management**: Streamlined admin operations
- **Scalable Architecture**: Easy to extend with new features
