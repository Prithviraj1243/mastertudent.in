# 🛡️ Admin Panel Setup & Access Guide

## Quick Start

### Step 1: Start the Server
```bash
npm run dev
# or
npm start
```

The server should start on the port specified in your `.env` file (default: 5000)

### Step 2: Create an Admin User

You have **3 options** to create an admin user:

#### Option A: Make Yourself Admin (First-Time Setup Only)
If no admin exists yet, you can make yourself admin:

1. **Log in** to the website with your regular account
2. Open browser console (F12) and run:
```javascript
fetch('/api/admin/make-me-admin', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => {
  console.log('Admin status:', data);
  if (data.success) {
    alert('You are now an admin! Refresh the page.');
    window.location.reload();
  }
});
```

#### Option B: Update Existing User via API
If you know a user's ID, update their role:

```javascript
fetch('/api/admin/update-user-role', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetUserId: 'USER_ID_HERE',
    newRole: 'admin'
  })
})
.then(r => r.json())
.then(console.log);
```

#### Option C: Direct Database Update
If using PostgreSQL, run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Step 3: Access Admin Panel

Once you have admin role:

1. **Navigate to**: `/admin` (relative URL - works on any port)
   - Or click "Admin Dashboard" in the sidebar (visible to admin users)

2. **Admin Routes**:
   - `/admin` - Dashboard overview
   - `/admin/users` - User management
   - `/admin/notes` - Notes management
   - `/admin/analytics` - Analytics & activity

## Admin Panel Features

### 📊 Dashboard (`/admin`)
- Platform statistics overview
- Quick action buttons
- Recent activity preview

### 👥 User Management (`/admin/users`)
- View all users
- Search users by name, email, or role
- See user details and roles
- Filter by role

### 📝 Notes Management (`/admin/notes`)
- View all notes (published, pending, rejected)
- Search notes by title or subject
- Filter by status
- Pagination support
- View note details

### 📈 Analytics (`/admin/analytics`)
- Platform statistics
- User activity feed
- Real-time activity logs

## Role-Based Access

- **Admin routes are protected**: Only users with `role === "admin"` can access
- **Auto-redirect**: Non-admin users are redirected to home page
- **Sidebar links**: Admin navigation only appears for admin users

## Troubleshooting

### "Access denied - Admin only"
- Your user account doesn't have admin role
- Use one of the methods above to make yourself admin

### "Admin already exists"
- Someone else is already admin
- Ask them to update your role, or use Option B/C

### Can't see admin links in sidebar
- Make sure you're logged in
- Refresh the page after updating your role
- Check browser console for errors

### API returns 401/403
- Make sure you're logged in (`credentials: "include"` is set)
- Check that your session is valid
- Try logging out and back in

## Development Tips

### Check Your Current Role
```javascript
// In browser console
fetch('/api/auth/user', { credentials: 'include' })
  .then(r => r.json())
  .then(user => console.log('Your role:', user.role));
```

### List All Users
```javascript
// Only works if you're admin
fetch('/api/admin/users', { credentials: 'include' })
  .then(r => r.json())
  .then(users => console.log('All users:', users));
```

## Security Notes

- Admin routes require authentication AND admin role
- All admin API calls include session cookies
- Admin actions are logged in user activity
- Consider adding audit logs for sensitive operations

