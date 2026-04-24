# 🚀 Start Services - Quick Guide

## One Command Start (Recommended)

### Mac/Linux
```bash
cd /Users/prithviraj/Desktop/StudentNotesMarketplace\ 6
chmod +x start-both-admins.sh
./start-both-admins.sh
```

### Windows
```bash
cd C:\Users\prithviraj\Desktop\StudentNotesMarketplace 6
start-both-admins.bat
```

---

## Manual Start (Separate Terminals)

### Terminal 1: Main Website + Backend
```bash
cd /Users/prithviraj/Desktop/StudentNotesMarketplace\ 6
npm run dev
```
**Access**: http://localhost:8000

### Terminal 2: Admin Panel
```bash
cd /Users/prithviraj/admin\ masterstudents
npm run dev
```
**Access**: http://localhost:3000

---

## 📍 URLs

| Service | URL |
|---------|-----|
| Main Website | http://localhost:8000 |
| Admin Panel | http://localhost:3000 |

---

## 🔐 Admin Login

```
Email:    admin@studentnotes.com
Password: admin123
```

---

## ✅ Services Running

When both are started, you should see:

```
✓ Main website started (Port 8000)
✓ Admin panel started (Port 3000)
✓ Database: SQLite (shared)
```

---

## 🛑 Stop Services

- **Mac/Linux**: Press `Ctrl+C` in terminal
- **Windows**: Close the command windows

---

## 🧪 Quick Test

1. Open http://localhost:8000 (main website)
2. Open http://localhost:3000 (admin panel)
3. Login with admin@studentnotes.com / admin123
4. Upload a note on main website
5. Check admin panel - note should appear

---

**That's it! Both services are now running and connected.**
