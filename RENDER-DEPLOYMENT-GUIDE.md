# 🚀 MasterStudent - Complete Render Deployment Guide

This guide will walk you through deploying the MasterStudent Notes Marketplace to Render.

---

## 📋 Prerequisites

Before you start, make sure you have:

1. ✅ A [Render account](https://render.com) (free tier works)
2. ✅ A [Supabase account](https://supabase.com) with your project set up
3. ✅ Your GitHub repository pushed and accessible
4. ✅ All environment variables ready (see below)

---

## 🔧 Step 1: Prepare Your Environment Variables

You'll need these environment variables. Get them ready:

### Supabase Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find them:**
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project → Settings → API
- Copy the URL and keys

### Database Variables
```
DATABASE_URL=postgresql://postgres.[your-project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Where to find it:**
- Supabase Dashboard → Settings → Database
- Copy the "Connection string" (Transaction mode recommended)
- Replace `[YOUR-PASSWORD]` with your database password

### DodoPay Variables (Payment Gateway)
```
VITE_DODO_CLIENT_ID=your-client-id
VITE_DODO_SECRET_KEY=your-secret-key
DODO_WEBHOOK_SECRET=your-webhook-secret
```

**Where to find them:**
- Go to your [DodoPay Dashboard](https://dodo.co.in)
- Get your API credentials

### Google OAuth (Optional but Recommended)
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Where to find them:**
- [Google Cloud Console](https://console.cloud.google.com)
- APIs & Services → Credentials
- Create OAuth 2.0 credentials if you haven't

### Admin Credentials
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123!
```

**⚠️ Important:** Change the default password to something secure!

### Other Variables
```
NODE_ENV=production
PORT=8000
SESSION_SECRET=your-random-secret-key-min-32-chars
```

---

## 🏗️ Step 2: Deploy to Render

### 2.1 Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the **MasterStudent** repository

### 2.2 Configure the Service

Fill in the following details:

**Basic Settings:**
- **Name:** `masterstudent` (or your preferred name)
- **Region:** Choose closest to your users (e.g., Oregon, Frankfurt, Singapore)
- **Branch:** `main` (or your production branch)
- **Root Directory:** Leave empty (root of repo)
- **Runtime:** `Node`

**Build Settings:**
- **Build Command:**
  ```bash
  npm install && npm run build
  ```

- **Start Command:**
  ```bash
  npm start
  ```

**Instance Type:**
- Start with **Free** tier for testing
- Upgrade to **Starter ($7/month)** or higher for production

### 2.3 Add Environment Variables

In the **Environment** section, add ALL the environment variables from Step 1:

Click **"Add Environment Variable"** and add each one:

```
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_DODO_CLIENT_ID=...
VITE_DODO_SECRET_KEY=...
DODO_WEBHOOK_SECRET=...
VITE_GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123!
SESSION_SECRET=your-random-secret-min-32-chars
```

**💡 Pro Tip:** Use Render's "Secret Files" for sensitive data if preferred.

### 2.4 Deploy!

1. Click **"Create Web Service"**
2. Render will start building and deploying your app
3. Wait 5-10 minutes for the first deployment
4. You'll get a URL like: `https://masterstudent.onrender.com`

---

## 🗄️ Step 3: Set Up Supabase Database

### 3.1 Run Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase-schema.sql` from your project
3. Copy and paste the entire contents
4. Click **"Run"** to create all tables

### 3.2 Set Up Real-time Policies

1. Still in SQL Editor, open `supabase-realtime-policies-fixed.sql`
2. Copy and paste the entire contents
3. Click **"Run"** to set up real-time subscriptions

### 3.3 Configure Storage Buckets

1. Go to Supabase Dashboard → Storage
2. Create a bucket named `notes-files`
3. Set it to **Public** (or configure policies as needed)
4. Go to Settings → API Settings → Enable "Public bucket" if needed

### 3.4 Enable Real-time Features

1. Go to Database → Replication
2. Enable replication for these tables:
   - ✅ `users`
   - ✅ `notes`
   - ✅ `notifications`
   - ✅ `activities`
   - ✅ `downloads`

---

## 🔐 Step 4: Configure OAuth Redirect URLs

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project → APIs & Services → Credentials
3. Click on your OAuth 2.0 Client ID
4. Add **Authorized redirect URIs:**
   ```
   https://your-app-name.onrender.com/api/auth/google/callback
   https://your-project.supabase.co/auth/v1/callback
   ```
5. Add **Authorized JavaScript origins:**
   ```
   https://your-app-name.onrender.com
   ```

### Supabase OAuth

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Google** provider
3. Add your Google Client ID and Secret
4. Add Site URL: `https://your-app-name.onrender.com`
5. Add Redirect URLs:
   ```
   https://your-app-name.onrender.com/**
   ```

---

## 💳 Step 5: Configure DodoPay Webhooks

1. Go to [DodoPay Dashboard](https://dodo.co.in)
2. Navigate to Webhooks settings
3. Add webhook URL:
   ```
   https://your-app-name.onrender.com/api/dodo/webhook
   ```
4. Enable these events:
   - ✅ Payment Success
   - ✅ Payment Failed
   - ✅ Subscription Created
   - ✅ Subscription Expired

---

## 🧪 Step 6: Test Your Deployment

### 6.1 Basic Health Check

Visit these URLs and verify they work:

1. **Homepage:** `https://your-app-name.onrender.com`
2. **API Version:** `https://your-app-name.onrender.com/api/version`
3. **Login Page:** `https://your-app-name.onrender.com/login`
4. **Admin Login:** `https://your-app-name.onrender.com/admin/login`

### 6.2 Test Core Features

1. ✅ **User Registration:** Create a new account
2. ✅ **User Login:** Log in with email/password
3. ✅ **Google OAuth:** Test "Sign in with Google"
4. ✅ **Upload Notes:** Upload a PDF file
5. ✅ **Browse Notes:** View the notes catalog
6. ✅ **Download Notes:** Try downloading a note
7. ✅ **Admin Panel:** Log in at `/admin/login`
8. ✅ **Admin Dashboard:** Check stats and note management
9. ✅ **Real-time Updates:** Open two browsers and test notifications

### 6.3 Test Payments

1. Go to Subscribe page
2. Choose a subscription plan
3. Complete test payment with DodoPay
4. Verify coins are credited

---

## 🐛 Step 7: Troubleshooting Common Issues

### Issue: "502 Bad Gateway" or App Won't Start

**Solution:**
1. Check Render logs: Dashboard → Your Service → Logs
2. Look for errors like:
   - `Cannot find module` → Run full build again
   - `Port already in use` → Check PORT env variable is set
   - `Database connection failed` → Verify DATABASE_URL is correct

### Issue: Environment Variables Not Working

**Solution:**
1. Make sure all `VITE_` prefixed variables are set
2. Variables starting with `VITE_` are bundled at build time
3. After changing `VITE_` variables, trigger a **Manual Deploy**
4. Regular env variables can be changed without rebuild

### Issue: Database Connection Errors

**Solution:**
1. Check DATABASE_URL format is correct
2. Make sure you're using the **Transaction mode** connection string
3. Verify your Supabase project is active
4. Check IP restrictions in Supabase (should allow all for Render)

### Issue: File Uploads Failing

**Solution:**
1. Check Supabase Storage bucket is created
2. Verify bucket policies allow public uploads
3. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
4. Increase Render instance memory if needed

### Issue: OAuth Not Working

**Solution:**
1. Verify redirect URLs match exactly (no trailing slashes)
2. Check Google OAuth credentials are correct
3. Make sure Site URL is set in Supabase Auth settings
4. Enable Google provider in Supabase Dashboard

### Issue: Real-time Features Not Working

**Solution:**
1. Check WebSocket connections in browser console
2. Verify replication is enabled for tables in Supabase
3. Check RLS policies allow real-time subscriptions
4. Make sure VITE_SUPABASE_ANON_KEY is correct

### Issue: Admin Panel Can't Login

**Solution:**
1. Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` env variables
2. Try clearing browser cache and cookies
3. Check browser console for errors
4. Verify session storage is enabled

---

## 📊 Step 8: Monitoring & Maintenance

### Monitor Your App

1. **Render Dashboard:**
   - Check CPU and Memory usage
   - View deployment logs
   - Monitor response times

2. **Supabase Dashboard:**
   - Database size and usage
   - API requests count
   - Storage usage

### Set Up Alerts

1. In Render, go to Settings → Notifications
2. Add email alerts for:
   - Deployment failures
   - High CPU usage
   - Service downtime

### Regular Maintenance

1. **Weekly:** Check error logs
2. **Monthly:** Review database size and optimize
3. **Quarterly:** Update dependencies (`npm update`)

---

## 🚀 Step 9: Performance Optimization (Optional)

### Enable Caching

Add to your `render.yaml` (create if doesn't exist):

```yaml
services:
  - type: web
    name: masterstudent
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/version
    envVars:
      - key: NODE_ENV
        value: production
```

### Configure CDN

1. Consider using Cloudflare for caching static assets
2. Add your Render URL to Cloudflare
3. Enable "Always Use HTTPS"
4. Enable "Auto Minify" for JS/CSS/HTML

### Database Optimization

1. Add indexes for frequently queried fields
2. Use Supabase connection pooling
3. Enable query caching where appropriate

---

## 🔒 Step 10: Security Checklist

Before going live, verify:

- [ ] Changed default admin password
- [ ] All environment variables are set correctly
- [ ] No sensitive data in public repositories
- [ ] HTTPS is enabled (automatic with Render)
- [ ] CORS is configured properly
- [ ] Rate limiting is in place
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection enabled
- [ ] Supabase RLS policies are active
- [ ] File upload size limits are set
- [ ] Session secrets are strong and random

---

## 📱 Step 11: Custom Domain (Optional)

### Add Your Domain

1. Go to Render Dashboard → Your Service → Settings
2. Scroll to **Custom Domain**
3. Click **"Add Custom Domain"**
4. Enter your domain: `masterstudent.com`

### Configure DNS

Add these DNS records at your domain registrar:

**For Apex Domain (masterstudent.com):**
```
Type: A
Name: @
Value: [Render IP from dashboard]
```

**For Subdomain (www.masterstudent.com):**
```
Type: CNAME
Name: www
Value: your-app-name.onrender.com
```

### Update OAuth Redirect URLs

After adding custom domain, update:
1. Google OAuth authorized redirect URIs
2. Supabase Site URL
3. DodoPay webhook URL

---

## 🎉 Step 12: Launch Checklist

Before announcing your launch:

- [ ] All features tested and working
- [ ] Admin panel accessible and functional
- [ ] Payment system tested with real transactions
- [ ] Email notifications working
- [ ] Real-time features functioning
- [ ] Mobile responsive design verified
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari)
- [ ] Load testing performed
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured
- [ ] Error tracking set up (consider Sentry)
- [ ] Analytics added (Google Analytics, etc.)
- [ ] Terms of Service and Privacy Policy pages
- [ ] Contact/Support page created

---

## 🆘 Need Help?

### Resources

- **Render Documentation:** https://render.com/docs
- **Supabase Documentation:** https://supabase.com/docs
- **Project GitHub:** [Your repository URL]

### Common Commands

**View Logs:**
```bash
# In Render dashboard → Logs tab
```

**Manual Deploy:**
```bash
# Render dashboard → Manual Deploy button
```

**SSH into Render (if needed):**
```bash
# Not available on free tier, upgrade to Starter+
```

---

## 📈 Scaling Guide

### When to Scale?

Consider upgrading when:
- Response times > 2 seconds
- Memory usage consistently > 80%
- CPU usage consistently > 70%
- Database connections maxing out
- More than 1000 active users

### How to Scale?

1. **Vertical Scaling:**
   - Upgrade Render instance type (Starter → Standard → Pro)
   - Increase Supabase database tier

2. **Horizontal Scaling:**
   - Add more Render instances (Pro plan required)
   - Use Redis for session management
   - Implement job queues for background tasks

3. **Database Scaling:**
   - Enable read replicas in Supabase
   - Implement caching layer (Redis)
   - Optimize database queries

---

## ✅ Final Notes

Your MasterStudent app is now deployed and ready! 🎊

**Your URLs:**
- **Main App:** `https://your-app-name.onrender.com`
- **Admin Panel:** `https://your-app-name.onrender.com/admin`
- **API Docs:** `https://your-app-name.onrender.com/api/version`

**Default Credentials:**
- **Admin Username:** (set in env variables)
- **Admin Password:** (set in env variables)

**⚠️ Important Reminders:**
1. Change default admin password immediately
2. Enable 2FA for Supabase and Render accounts
3. Regularly backup your database
4. Monitor logs for errors
5. Keep dependencies updated

---

## 🎓 What's Next?

- Set up automated testing
- Add more payment gateways
- Implement advanced analytics
- Create mobile app (React Native)
- Add AI-powered note recommendations
- Implement chat/forum features

---

**Happy Deploying! 🚀**

If you encounter any issues, check the logs first, then refer to the troubleshooting section.

---

*Last Updated: February 2026*
*Version: 1.0.0*
