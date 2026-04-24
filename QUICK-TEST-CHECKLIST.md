# ✅ Quick Test Checklist - Admin Data Sync

## 🚀 Pre-Test Setup

- [ ] Both services running
  - Main Website: http://localhost:8000
  - Admin Panel: http://localhost:3000

---

## 📝 Test 1: User Registration & Admin View

### On Main Website (Port 8000)
- [ ] Click "Sign Up" or "Create Account"
- [ ] **Option A: Google Login**
  - [ ] Click "Sign in with Google"
  - [ ] Complete Google authentication
  - [ ] User account created
- [ ] **Option B: Email/Password**
  - [ ] Enter email: `testuser@example.com`
  - [ ] Enter password: `Test123!`
  - [ ] Complete registration
  - [ ] User account created

### On Admin Panel (Port 3000)
- [ ] Login with admin@studentnotes.com / admin123
- [ ] Go to "Users" section
- [ ] **Verify:**
  - [ ] New user appears in list
  - [ ] User email matches
  - [ ] User role shows correctly
  - [ ] Creation date is recent

---

## 📤 Test 2: Note Upload & Admin View

### On Main Website (Port 8000)
- [ ] Login as the user created in Test 1
- [ ] Go to "Upload Notes" section
- [ ] Fill in note details:
  - [ ] Title: `Test Mathematics Notes`
  - [ ] Subject: `Mathematics`
  - [ ] Class/Grade: `10`
  - [ ] Price: `50`
  - [ ] Upload file (PDF/DOC)
- [ ] Submit note
- [ ] Verify upload successful

### On Admin Panel (Port 3000)
- [ ] Go to "Notes" section
- [ ] **Verify:**
  - [ ] New note appears in list
  - [ ] Note title matches
  - [ ] Subject matches
  - [ ] Uploader name matches
  - [ ] Status shows correctly
  - [ ] Creation date is recent

---

## 🔍 Test 3: Search & Filter

### Users Section
- [ ] Search by name: Type user's name
  - [ ] [ ] Results filtered correctly
- [ ] Search by email: Type user's email
  - [ ] [ ] Results filtered correctly
- [ ] Filter by role: Select "Student"
  - [ ] [ ] Only students shown

### Notes Section
- [ ] Search by title: Type note title
  - [ ] [ ] Results filtered correctly
- [ ] Search by subject: Type subject
  - [ ] [ ] Results filtered correctly
- [ ] Filter by status: Select "Submitted"
  - [ ] [ ] Only submitted notes shown

---

## 🔄 Test 4: Real-Time Updates

### Setup
- [ ] Open admin panel in one window
- [ ] Open main website in another window
- [ ] Both visible side-by-side

### Test
- [ ] On main website: Register another user
- [ ] On admin panel: Wait 30 seconds or click refresh
- [ ] **Verify:**
  - [ ] New user appears in admin Users
  - [ ] No page reload needed (auto-refresh)

---

## 📊 Test 5: Activity Feed

### On Admin Panel (Port 3000)
- [ ] Go to "Activity" section
- [ ] **Verify activities are logged:**
  - [ ] User registration
  - [ ] Note upload
  - [ ] User login
  - [ ] Any other actions

---

## ✅ Test 6: Approve/Reject Notes

### On Admin Panel (Port 3000)
- [ ] Go to "Notes" section
- [ ] Find the test note
- [ ] **Verify status options:**
  - [ ] Can see "Approve" button
  - [ ] Can see "Reject" button
  - [ ] Can see "Pending Review" status

### Approve Note
- [ ] Click "Approve" button
- [ ] Note status changes to "Approved"
- [ ] Verify on main website (if applicable)

---

## 🔐 Test 7: Google Login Integration

### On Main Website (Port 8000)
- [ ] Click "Sign in with Google"
- [ ] Complete Google authentication
- [ ] Verify user logged in

### On Admin Panel (Port 3000)
- [ ] Go to "Users" section
- [ ] **Verify:**
  - [ ] Google user appears in list
  - [ ] User email matches Google email
  - [ ] User profile picture loaded (if available)

---

## 📱 Test 8: Multiple Users & Notes

### Create Multiple Test Data
- [ ] Register 3 different users
- [ ] Each user uploads 2 notes
- [ ] Total: 3 users, 6 notes

### On Admin Panel (Port 3000)
- [ ] Go to "Users" section
  - [ ] All 3 users visible
  - [ ] Can search/filter each user
- [ ] Go to "Notes" section
  - [ ] All 6 notes visible
  - [ ] Can search/filter each note
- [ ] Go to "Activity" section
  - [ ] All activities logged

---

## 🧪 Test 9: Data Persistence

### Restart Services
- [ ] Stop both services (Ctrl+C)
- [ ] Wait 5 seconds
- [ ] Restart both services

### Verify Data
- [ ] On admin panel: Users still visible
- [ ] On admin panel: Notes still visible
- [ ] On admin panel: Activities still logged
- [ ] **Verify:** Data persisted in database

---

## 🎯 Final Verification

- [ ] All users appear in admin Users section
- [ ] All notes appear in admin Notes section
- [ ] All activities appear in admin Activity section
- [ ] Search and filter working
- [ ] Real-time updates working (30 second refresh)
- [ ] Google login working
- [ ] Email/password registration working
- [ ] Note approval/rejection working
- [ ] Data persists after restart

---

## ✅ Test Results

| Test | Status | Notes |
|------|--------|-------|
| User Registration | ✅/❌ | |
| User in Admin | ✅/❌ | |
| Note Upload | ✅/❌ | |
| Note in Admin | ✅/❌ | |
| Search & Filter | ✅/❌ | |
| Real-Time Sync | ✅/❌ | |
| Activity Feed | ✅/❌ | |
| Google Login | ✅/❌ | |
| Multiple Users | ✅/❌ | |
| Data Persistence | ✅/❌ | |

---

## 🎉 Success Criteria

All tests should pass (✅) for successful integration:
- ✅ Users appear in admin panel when registered
- ✅ Notes appear in admin panel when uploaded
- ✅ Activities logged in real-time
- ✅ Search and filter working
- ✅ Real-time updates within 30 seconds
- ✅ Google login integration working
- ✅ Data persists across restarts

---

**If all tests pass, the admin data synchronization is working perfectly!**
