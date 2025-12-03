# ⚡ Quick Reference Card

## 🚀 Start Everything
```bash
npm run dev
```

---

## 🔗 Access Points

| Service | URL | Login |
|---------|-----|-------|
| **Main Website** | http://localhost:5173 | Create account |
| **Admin Panel** | http://localhost:8000/admin-panel | admin@studentnotes.com / admin123 |
| **Teacher Dashboard** | http://localhost:8000/teacher-dashboard | teacher@studentnotes.com / teacher123 |

---

## 👥 User Roles

### Student/User
- Upload notes
- Download notes
- Make payments
- Earn coins
- View profile

### Teacher
- Review pending notes
- Approve notes → +20 coins to uploader
- Reject notes → Send feedback
- View statistics

### Admin
- Monitor all users
- Track all notes
- View transactions
- See new signups
- Export data

---

## 💰 Coin Rewards

| Action | Coins |
|--------|-------|
| Note approved by teacher | +20 |
| Note downloaded (paid) | +50% of price |
| Subscription | Varies |

---

## 📊 Key Features

✅ Real-time data sync  
✅ Teacher approval system  
✅ Automatic coin distribution  
✅ Dodo Payments integration  
✅ Admin monitoring  
✅ Activity tracking  

---

## 🔄 Complete Workflow

```
1. User signs up → Admin sees new user
2. User uploads note → Admin sees note
3. Teacher approves → Uploader gets 20 coins
4. User downloads → Creator gets 50% coins
5. Admin monitors everything
```

---

## 🎯 Test Scenario

1. **Start:** `npm run dev`
2. **Main website:** Create account
3. **Upload note:** Set price ₹100
4. **Teacher login:** Approve note
5. **Check coins:** +20 coins awarded
6. **Admin panel:** See all activity
7. **Download:** Test payment flow

---

## 🔐 Credentials

```
Admin:
  Email: admin@studentnotes.com
  Pass:  admin123

Teacher:
  Email: teacher@studentnotes.com
  Pass:  teacher123
```

---

## 📱 Main Features

### Main Website
- User registration
- Note upload/download
- Dodo Payments
- Coin system
- Profile management

### Admin Panel
- User management
- Note monitoring
- Transaction tracking
- Signup notifications
- Data export

### Teacher Dashboard
- Pending notes list
- Approve/Reject notes
- Coin rewards (+20)
- Statistics
- Activity history

---

## 🐛 Quick Fixes

**Server won't start:**
```bash
lsof -ti:8000 | xargs kill -9
npm run dev
```

**Clear cache:**
```javascript
localStorage.clear()
```

**Check logs:**
```bash
npm run dev
# Watch console output
```

---

## 📈 Real-Time Updates

✅ New signups appear in admin immediately  
✅ Uploaded notes appear in admin immediately  
✅ Approvals update in real-time  
✅ Coins awarded instantly  
✅ Transactions logged immediately  

---

## 🎉 Status

✅ System ready  
✅ All features working  
✅ Real-time sync active  
✅ Teacher approval enabled  
✅ Coin system active  

**Start with:** `npm run dev`

---

**Last Updated:** December 2, 2025  
**Version:** 1.0
