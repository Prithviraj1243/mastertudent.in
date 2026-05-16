# 📚 Student Notes Marketplace - Complete System Documentation

## 🎯 Project Overview

**Student Notes Marketplace** is a comprehensive full-stack platform that connects students and teachers in a collaborative learning ecosystem. Students can upload, share, and monetize their study notes while teachers can review and approve content. The platform features a coin-based reward system, subscription models, and integrated payment processing.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│                     Port: 8000 (served)                      │
│  - Landing & Auth Pages                                     │
│  - Note Upload/Download                                     │
│  - User Profiles & Analytics                                │
│  - Forum & Community Features                               │
│  - Coin Dashboard & Leaderboard                             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/WebSocket
┌────────────────────▼────────────────────────────────────────┐
│              BACKEND (Express.js + TypeScript)              │
│                     Port: 8000                               │
│  - Authentication & Authorization                           │
│  - File Upload Management                                   │
│  - Payment Processing (Dodo Payments)                       │
│  - Coin System & Rewards                                    │
│  - Real-time Notifications                                  │
│  - Admin & Teacher Dashboards                               │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──┐  ┌──────▼──┐  ┌─────▼──────┐
│ SQLite   │  │Firebase │  │ Cloudinary │
│ (Dev)    │  │ Sync    │  │ (Images)   │
└──────────┘  └─────────┘  └────────────┘
```

---

## 📦 Technology Stack

### **Frontend**
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Routing**: Wouter 3.3.5
- **State Management**: TanStack React Query 5.60.5
- **UI Components**: Radix UI (comprehensive component library)
- **Styling**: TailwindCSS 3.4.17 + Tailwind Merge
- **Icons**: Lucide React 0.453.0
- **Forms**: React Hook Form 7.55.0 + Zod validation
- **Authentication**: Google OAuth (@react-oauth/google 0.12.2)
- **Charts**: Recharts 2.15.2
- **Animations**: Framer Motion 11.13.1

### **Backend**
- **Runtime**: Node.js with TypeScript (tsx 4.19.1)
- **Framework**: Express.js 4.21.2
- **Database**: 
  - SQLite (development)
  - PostgreSQL (production via Drizzle ORM)
- **ORM**: Drizzle ORM 0.39.1
- **Authentication**: 
  - Passport.js 0.7.0 (Local Strategy)
  - JWT (jsonwebtoken 9.0.2)
  - Google OAuth
- **Password Hashing**: bcrypt 6.0.0
- **File Upload**: Multer 2.0.2
- **Payment Gateway**: Dodo Payments (custom integration)
- **Email Service**: SendGrid (@sendgrid/mail 8.1.5)
- **Cloud Storage**: Cloudinary 2.8.0
- **Security**: Helmet 8.1.0, CORS 2.8.5
- **Rate Limiting**: express-rate-limit 8.1.0
- **Real-time**: WebSocket (ws 8.18.0)
- **Firebase**: Firebase 12.4.0 (data sync)

### **Chatbot Service (Integrated)**
- **Framework**: Node.js with TypeScript
- **AI Model**: Google Gemini API
- **Integration**: Backend API endpoints (no separate service)
- **Endpoints**: `/api/chatbot/chat`, `/api/chatbot/suggestions`, `/api/chatbot/health`

---

## 📂 Project Structure

```
StudentNotesMarketplace/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable React components (84 files)
│   │   │   ├── ui/                  # Radix UI components
│   │   │   ├── dodo-payment-gateway.tsx
│   │   │   ├── activity-notifications.tsx
│   │   │   └── ...
│   │   ├── pages/                   # Page components (34 files)
│   │   │   ├── landing.tsx          # Public landing page
│   │   │   ├── login.tsx            # Login page
│   │   │   ├── create-account.tsx   # Registration
│   │   │   ├── home.tsx             # Main dashboard
│   │   │   ├── upload-notes.tsx     # Note upload
│   │   │   ├── download-notes-enhanced.tsx
│   │   │   ├── forum.tsx            # Community forum
│   │   │   ├── leaderboard.tsx      # Top users
│   │   │   ├── coin-dashboard.tsx   # Coin system
│   │   │   ├── analytics.tsx        # User analytics
│   │   │   ├── become-topper.tsx    # Topper profile
│   │   │   ├── review-queue.tsx     # Teacher review
│   │   │   └── ...
│   │   ├── hooks/                   # Custom React hooks (8 files)
│   │   │   ├── useAuth.ts           # Authentication
│   │   │   ├── useRealTimeActivity.ts
│   │   │   └── ...
│   │   ├── lib/                     # Utilities
│   │   │   ├── queryClient.ts       # React Query config
│   │   │   └── ...
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── vite.config.ts
│   └── package.json
│
├── server/                          # Express Backend
│   ├── index.ts                     # Server entry point
│   ├── routes.ts                    # All API routes (1944 lines)
│   ├── storage.ts                   # Database operations (2074 lines)
│   ├── db.ts                        # Database configuration
│   ├── db-sqlite.ts                 # SQLite setup
│   ├── replitAuth.ts                # Authentication logic
│   ├── dodo-payments.ts             # Payment gateway integration
│   ├── firebase-sync.ts             # Firebase synchronization
│   ├── sendgrid.ts                  # Email service
│   ├── seed-data.ts                 # Initial data
│   ├── vite.ts                      # Vite middleware
│   └── routes/                      # Route modules
│
├── chatbot/                         # Chatbot Service
│   ├── server.js                    # Chatbot server
│   └── ...
│
├── shared/                          # Shared types
│   └── schema.ts                    # Database schema
│
├── uploads/                         # User uploaded files
├── dist/                            # Production build
├── node_modules/                    # Dependencies
│
├── package.json                     # Root dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # TailwindCSS config
├── vite.config.ts                   # Vite config
├── drizzle.config.ts                # Drizzle ORM config
├── .env                             # Environment variables
└── README.md                        # This file
```

---

## 🔄 Complete User Flow

### **1. Authentication Flow**

```
User Visits App
    ↓
Landing Page (Public)
    ↓
┌─────────────────────────────────┐
│ Choose: Login or Sign Up        │
└─────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│ Email/Password OR Google OAuth           │
│ - Email validation                       │
│ - Password hashing (bcrypt)              │
│ - Session creation                       │
└──────────────────────────────────────────┘
    ↓
Purpose Selection (Student/Topper/Teacher)
    ↓
Onboarding & Profile Setup
    ↓
Main Dashboard (Authenticated)
```

**Routes**:
- `GET /` - Landing page
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user info

---

### **2. Note Upload & Review Flow**

```
User (Student/Topper)
    ↓
Upload Notes Page
    ↓
┌──────────────────────────────────────────┐
│ Upload File (PDF, DOC, DOCX, IMG)        │
│ - File size limit: 50MB                  │
│ - Cloudinary upload                      │
│ - Metadata: Title, Subject, Class, Price │
└──────────────────────────────────────────┘
    ↓
Note Status: PENDING_REVIEW
    ↓
Teacher/Admin Review Queue
    ↓
┌──────────────────────────────────────────┐
│ Review Decision:                         │
│ ✓ APPROVED → +20 coins to uploader      │
│ ✗ REJECTED → Feedback sent               │
└──────────────────────────────────────────┘
    ↓
Note Status: PUBLISHED (if approved)
    ↓
Available for Download
```

**Routes**:
- `POST /api/notes/upload` - Upload note
- `GET /api/notes` - Get published notes
- `GET /api/notes/:id` - Get note details
- `POST /api/notes/:id/approve` - Teacher approve
- `POST /api/notes/:id/reject` - Teacher reject
- `GET /api/review-queue` - Get pending reviews

---

### **3. Note Download & Payment Flow**

```
User (Student)
    ↓
Browse/Search Notes
    ↓
Click Download
    ↓
┌──────────────────────────────────────────┐
│ Check Note Price:                        │
│ - Free (₹0) → Direct download           │
│ - Paid (₹X) → Show payment options      │
└──────────────────────────────────────────┘
    ↓
[IF PAID]
    ↓
┌──────────────────────────────────────────┐
│ Subscription Check:                      │
│ - Active subscription → Unlimited access │
│ - No subscription → Pay per note         │
└──────────────────────────────────────────┘
    ↓
Dodo Payment Gateway
    ↓
┌──────────────────────────────────────────┐
│ Payment Modal:                           │
│ - Order Summary (Price + 18% GST)        │
│ - User Details (Email, Phone, Address)   │
│ - "Continue to Payment" button           │
└──────────────────────────────────────────┘
    ↓
Dodo Checkout (External)
    ↓
Payment Success/Failure
    ↓
[IF SUCCESS]
    ↓
┌──────────────────────────────────────────┐
│ Post-Payment Actions:                    │
│ - Record download                        │
│ - Award coins to creator (50% of price)  │
│ - Update user subscription (if monthly)  │
│ - Sync to Firebase                       │
└──────────────────────────────────────────┘
    ↓
Download File & Redirect
```

**Routes**:
- `GET /api/notes/:id/download` - Initiate download
- `POST /api/notes/:id/dodo-payment` - Create payment
- `POST /api/dodo-webhook` - Payment webhook
- `GET /api/dodo-payment/:transactionId/status` - Check status
- `GET /api/downloads` - Download history

---

### **4. Coin System & Rewards Flow**

```
User Actions
    ↓
┌──────────────────────────────────────────┐
│ Coin Earning Events:                     │
│ - Note approved: +20 coins               │
│ - Note downloaded (paid): +50% of price  │
│ - Become topper: +100 coins              │
│ - Daily challenge: +10-50 coins          │
│ - Achievement unlocked: +25 coins        │
└──────────────────────────────────────────┘
    ↓
Coins Added to User Balance
    ↓
Coin Dashboard
    ↓
┌──────────────────────────────────────────┐
│ Coin Usage:                              │
│ - Buy coin packages (optional)           │
│ - Redeem for features                    │
│ - Leaderboard ranking                    │
└──────────────────────────────────────────┘
    ↓
Real-time Sync to Firebase
```

**Routes**:
- `GET /api/coins/balance` - Get user coins
- `POST /api/coins/add` - Add coins (internal)
- `GET /api/coins/history` - Coin transaction history
- `GET /api/leaderboard` - Top coin earners
- `POST /api/coins/packages` - Buy coin packages

---

### **5. Subscription Flow**

```
User (Student)
    ↓
Subscribe Page
    ↓
┌──────────────────────────────────────────┐
│ Subscription Plans:                      │
│ - Monthly: ₹59 (₹70 with 18% GST)       │
│ - Yearly: ₹499 (₹589 with 18% GST)      │
│ - Free tier: Limited downloads           │
└──────────────────────────────────────────┘
    ↓
Select Plan
    ↓
Dodo Payment Gateway
    ↓
Payment Processing
    ↓
[IF SUCCESS]
    ↓
┌──────────────────────────────────────────┐
│ Subscription Activation:                 │
│ - Create subscription record             │
│ - Set expiry date                        │
│ - Grant unlimited downloads              │
│ - Sync to Firebase                       │
└──────────────────────────────────────────┘
    ↓
Unlimited Note Access
```

**Routes**:
- `GET /api/subscriptions` - Get subscription status
- `POST /api/subscriptions/create` - Create subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/plans` - Available plans

---

### **6. Teacher/Admin Dashboard Flow**

```
Teacher/Admin Login
    ↓
Dashboard Home
    ↓
┌──────────────────────────────────────────┐
│ Available Actions:                       │
│ - Review pending notes                   │
│ - View user analytics                    │
│ - Monitor transactions                   │
│ - Manage users                           │
│ - View system statistics                 │
└──────────────────────────────────────────┘
    ↓
Review Queue
    ↓
┌──────────────────────────────────────────┐
│ For Each Note:                           │
│ - View preview                           │
│ - Check metadata                         │
│ - Approve or Reject                      │
│ - Add feedback if rejected                │
└──────────────────────────────────────────┘
    ↓
Analytics Dashboard
    ↓
┌──────────────────────────────────────────┐
│ Metrics:                                 │
│ - Total users                            │
│ - Total notes                            │
│ - Active subscriptions                   │
│ - Revenue                                │
│ - Top uploaders                          │
└──────────────────────────────────────────┘
```

**Routes**:
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/notes` - All notes
- `GET /api/admin/transactions` - Payment history
- `GET /api/admin/analytics` - Analytics data

---

### **7. Topper Profile & Community Flow**

```
User Becomes Topper
    ↓
Become Topper Page
    ↓
┌──────────────────────────────────────────┐
│ Topper Profile Setup:                    │
│ - Bio & expertise areas                  │
│ - Profile picture                        │
│ - Subjects & classes                     │
│ - Achievements                           │
└──────────────────────────────────────────┘
    ↓
Public Topper Profile
    ↓
┌──────────────────────────────────────────┐
│ Profile Features:                        │
│ - View all notes                         │
│ - Follow/Unfollow                        │
│ - View analytics                         │
│ - See ratings & reviews                  │
│ - Forum posts                            │
└──────────────────────────────────────────┘
    ↓
Forum & Community
    ↓
┌──────────────────────────────────────────┐
│ Forum Features:                          │
│ - Create posts in categories             │
│ - Reply to posts                         │
│ - Like replies                           │
│ - Real-time notifications                │
└──────────────────────────────────────────┘
```

**Routes**:
- `POST /api/topper-profile` - Create topper profile
- `GET /api/topper-profile/:userId` - Get profile
- `POST /api/follow` - Follow topper
- `POST /api/unfollow` - Unfollow topper
- `GET /api/forum/categories` - Forum categories
- `POST /api/forum/posts` - Create post
- `POST /api/forum/replies` - Reply to post

---

## 🔐 Authentication & Authorization

### **Authentication Methods**

1. **Email/Password**
   - User registers with email
   - Password hashed with bcrypt
   - Session created with express-session
   - SQLite session store (dev) or PostgreSQL (prod)

2. **Google OAuth**
   - Google OAuth 2.0 integration
   - JWT token verification
   - Auto-create user on first login
   - Profile picture from Google

3. **Session Management**
   - Session TTL: 7 days
   - HTTPOnly cookies
   - Secure flag in production
   - CSRF protection

### **Authorization Levels**

```
┌─────────────────────────────────────────┐
│ ROLES:                                  │
│ - STUDENT: Download, upload, forum      │
│ - TOPPER: Upload, earn coins            │
│ - TEACHER: Review, approve notes        │
│ - ADMIN: Full system access             │
└─────────────────────────────────────────┘
```

**Routes**:
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

---

## 💳 Payment Integration (Dodo Payments)

### **Configuration**
```env
DODO_PROJECT_ID=pdt_CZikJJg7rTP13neCwBqng
DODO_API_KEY=your_api_key
DODO_API_URL=https://api.dodopayments.com
DODO_CHECKOUT_BASE_URL=https://checkout.dodopayments.com/buy
```

### **Payment Flow**

1. **Initiate Payment**
   - User clicks "Download" on paid note
   - Frontend calls `/api/notes/:id/dodo-payment`
   - Backend creates payment request
   - Returns checkout URL

2. **Checkout**
   - Dodo payment gateway opens
   - User enters payment details
   - Shows order summary with GST

3. **Webhook Processing**
   - Dodo sends webhook to `/api/dodo-webhook`
   - Verify webhook signature
   - Update transaction status
   - Award coins to creator
   - Record download

4. **Verification**
   - Frontend polls `/api/dodo-payment/:transactionId/status`
   - Confirms payment success
   - Allows download

### **Pricing**
- **Per-Note Download**: Variable (₹0 - ₹500)
- **Monthly Subscription**: ₹59 (₹70 with GST)
- **Yearly Subscription**: ₹499 (₹589 with GST)
- **GST**: 18% on all payments

**Routes**:
- `POST /api/notes/:id/dodo-payment` - Create payment
- `POST /api/dodo-webhook` - Payment webhook
- `GET /api/dodo-payment/:transactionId/status` - Check status

---

## 🗄️ Database Schema

### **Core Tables**

**users**
```sql
- id (UUID)
- email (unique)
- password_hash
- name
- profile_picture
- bio
- role (STUDENT, TOPPER, TEACHER, ADMIN)
- coins_balance
- created_at
- updated_at
```

**notes**
```sql
- id (UUID)
- uploader_id (FK: users)
- title
- description
- subject
- class_grade
- file_url (Cloudinary)
- price
- status (PENDING_REVIEW, PUBLISHED, REJECTED)
- reviewer_id (FK: users)
- downloads_count
- views_count
- rating
- created_at
- updated_at
```

**subscriptions**
```sql
- id (UUID)
- user_id (FK: users)
- plan_type (MONTHLY, YEARLY)
- status (ACTIVE, EXPIRED, CANCELLED)
- start_date
- end_date
- price
- created_at
```

**transactions**
```sql
- id (UUID)
- user_id (FK: users)
- note_id (FK: notes)
- amount
- currency
- status (PENDING, SUCCESS, FAILED)
- dodo_transaction_id
- created_at
```

**downloads**
```sql
- id (UUID)
- user_id (FK: users)
- note_id (FK: notes)
- downloaded_at
```

**topper_profiles**
```sql
- id (UUID)
- user_id (FK: users)
- bio
- expertise_areas
- followers_count
- rating
- created_at
```

**forum_posts**
```sql
- id (UUID)
- user_id (FK: users)
- category_id (FK: forum_categories)
- title
- content
- likes_count
- replies_count
- created_at
```

**forum_replies**
```sql
- id (UUID)
- post_id (FK: forum_posts)
- user_id (FK: users)
- content
- likes_count
- created_at
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- npm or yarn
- SQLite (included) or PostgreSQL (for production)

### **Installation**

```bash
# Clone repository
git clone <repo-url>
cd StudentNotesMarketplace

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration
```

### **Environment Variables**

```env
# Server
NODE_ENV=development
PORT=8000
USE_SQLITE=1

# Database
DATABASE_URL=your_postgresql_url  # For production

# Authentication
SESSION_SECRET=your_secret_key
# Accepts single ID or comma separated list of allowed IDs
GOOGLE_CLIENT_IDS=your_google_client_id,another_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email
SENDGRID_API_KEY=your_sendgrid_key

# Payments
DODO_PROJECT_ID=your_dodo_project_id
DODO_API_KEY=your_dodo_api_key
DODO_CHECKOUT_URL=https://checkout.dodopayments.com/buy/your_project_id

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Chatbot
GEMINI_API_KEY=your_gemini_api_key
CHATBOT_PORT=5001

# Firebase
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_project_id
```

### **Running the Application**

```bash
# Development mode (runs frontend + backend)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run check
```

### **Access Points**
- **Main Website**: http://localhost:8000
- **API**: http://localhost:8000/api
- **Chatbot**: http://localhost:5001

---

## 📊 Key Features

### **1. Note Management**
- ✅ Upload notes (PDF, DOC, DOCX, images)
- ✅ Automatic file validation
- ✅ Cloudinary cloud storage
- ✅ Metadata: subject, class, price
- ✅ Status tracking (pending, published, rejected)

### **2. Payment System**
- ✅ Dodo Payments integration
- ✅ Per-note downloads
- ✅ Monthly/yearly subscriptions
- ✅ Automatic GST calculation (18%)
- ✅ Webhook processing
- ✅ Transaction logging

### **3. Coin Reward System**
- ✅ Earn coins from uploads
- ✅ Earn coins from downloads
- ✅ Coin packages for purchase
- ✅ Leaderboard rankings
- ✅ Real-time balance updates

### **4. User Profiles**
- ✅ Student profiles
- ✅ Topper profiles with analytics
- ✅ Profile pictures
- ✅ Bio and expertise areas
- ✅ Follower system

### **5. Community Features**
- ✅ Forum with categories
- ✅ Post creation and replies
- ✅ Like system
- ✅ Real-time notifications
- ✅ User activity tracking

### **6. Teacher/Admin Dashboard**
- ✅ Review pending notes
- ✅ Approve/reject notes
- ✅ Send feedback
- ✅ View analytics
- ✅ Monitor transactions
- ✅ User management

### **7. Analytics & Insights**
- ✅ Download statistics
- ✅ Revenue tracking
- ✅ User growth metrics
- ✅ Top performers
- ✅ Activity logs

### **8. Real-time Features**
- ✅ WebSocket notifications
- ✅ Activity updates
- ✅ Live coin updates
- ✅ Firebase synchronization

---

## 🔌 API Endpoints Summary

### **Authentication**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
POST   /api/auth/logout
GET    /api/auth/me
```

### **Notes**
```
POST   /api/notes/upload
GET    /api/notes
GET    /api/notes/:id
GET    /api/notes/:id/download
POST   /api/notes/:id/approve
POST   /api/notes/:id/reject
PUT    /api/notes/:id
DELETE /api/notes/:id
```

### **Payments**
```
POST   /api/notes/:id/dodo-payment
POST   /api/dodo-webhook
GET    /api/dodo-payment/:transactionId/status
GET    /api/subscriptions
POST   /api/subscriptions/create
```

### **Coins**
```
GET    /api/coins/balance
POST   /api/coins/add
GET    /api/coins/history
GET    /api/leaderboard
```

### **Users**
```
GET    /api/users/:id
PUT    /api/users/:id
GET    /api/topper-profile/:userId
POST   /api/topper-profile
POST   /api/follow
POST   /api/unfollow
```

### **Forum**
```
GET    /api/forum/categories
POST   /api/forum/posts
GET    /api/forum/posts
POST   /api/forum/replies
POST   /api/forum/replies/:id/like
```

### **Admin**
```
GET    /api/admin/stats
GET    /api/admin/users
GET    /api/admin/notes
GET    /api/admin/transactions
GET    /api/review-queue
```

### **Chatbot (Integrated)**
```
POST   /api/chatbot/chat
GET    /api/chatbot/suggestions
GET    /api/chatbot/health
```

---

## 🧪 Testing

### **Manual Testing Checklist**

**Authentication**
- [ ] Register with email/password
- [ ] Login with credentials
- [ ] Google OAuth login
- [ ] Logout
- [ ] Session persistence

**Note Upload**
- [ ] Upload PDF file
- [ ] Upload DOCX file
- [ ] Upload image
- [ ] Set metadata
- [ ] Verify file in Cloudinary

**Note Review**
- [ ] View pending notes
- [ ] Approve note
- [ ] Reject note with feedback
- [ ] Verify coins awarded

**Payment Flow**
- [ ] Download free note
- [ ] Download paid note
- [ ] Complete Dodo payment
- [ ] Verify coins awarded
- [ ] Check subscription status

**Coin System**
- [ ] Check coin balance
- [ ] View coin history
- [ ] Check leaderboard
- [ ] Verify real-time updates

**Forum**
- [ ] Create forum post
- [ ] Reply to post
- [ ] Like reply
- [ ] View notifications

**Chatbot**
- [ ] Click chatbot button
- [ ] Send message
- [ ] View AI response
- [ ] Check suggested questions
- [ ] Verify conversation history

---

## 📈 Deployment

### **Production Checklist**

1. **Environment Setup**
   - [ ] Set `NODE_ENV=production`
   - [ ] Configure PostgreSQL database
   - [ ] Set secure session secret
   - [ ] Enable HTTPS

2. **Security**
   - [ ] Enable Helmet middleware
   - [ ] Configure CORS properly
   - [ ] Set rate limiting
   - [ ] Validate all inputs

3. **Build & Deploy**
   ```bash
   npm run build
   npm start
   ```

4. **Monitoring**
   - [ ] Setup error logging
   - [ ] Monitor API performance
   - [ ] Track payment webhooks
   - [ ] Monitor database

---

## 🐛 Troubleshooting

### **Common Issues**

**Port Already in Use**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Database Connection Error**
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# For dev, USE_SQLITE=1 uses SQLite
```

**Payment Gateway Not Working**
```bash
# Verify DODO_PROJECT_ID in .env
# Check DODO_CHECKOUT_URL format
# Ensure webhook endpoint is accessible
```

**File Upload Issues**
```bash
# Check uploads/ directory permissions
# Verify Cloudinary credentials
# Check file size limits (50MB max)
```

---

## 📞 Support & Contact

For issues, questions, or feature requests:
- Create an issue in the repository
- Contact: support@studentnotes.com
- Documentation: See individual feature docs

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Summary

**Student Notes Marketplace** is a complete, production-ready platform featuring:

- ✅ Full authentication system (email, Google OAuth)
- ✅ Note upload/download with file validation
- ✅ Integrated Dodo Payments for monetization
- ✅ Coin-based reward system
- ✅ Teacher review & approval workflow
- ✅ Subscription management
- ✅ Community forum
- ✅ Real-time notifications
- ✅ Admin dashboard
- ✅ Analytics & insights
- ✅ Firebase synchronization
- ✅ Responsive UI with modern design

**Start the app**: `npm run dev`

**Access**: http://localhost:8000
