# 📚 Student Notes Marketplace – Backend Documentation

## 1. Overview

The backend is a **Node.js + Express + TypeScript** API that powers the Student Notes Marketplace:

- Authentication & sessions (email + Google OAuth)
- Notes upload, review, publishing, and download
- Coin & reward system
- Subscriptions and payments (Dodo Payments + Stripe)
- Admin & analytics dashboards
- Email notifications (SendGrid)
- Optional integrations: Cloudinary, Firebase, Chatbot (Gemini)

All backend code lives in the `server/` directory and shares types with the frontend via `shared/schema.ts`.

---

## 2. Tech Stack (Backend)

- **Runtime**: Node.js 18+ (ESM, `"type": "module"`)
- **Language**: TypeScript (`tsx` runtime)
- **Framework**: Express 4.x
- **ORM**: Drizzle ORM
- **Databases**:
  - **SQLite** (local/dev) via `better-sqlite3`
  - **PostgreSQL** (prod) via Neon (`@neondatabase/serverless`)
- **Auth & Sessions**:
  - Passport.js (Local strategy)
  - Express-session + `connect-pg-simple` (Postgres) or in‑memory/dev mode
  - Google OAuth (JWT verification)
- **Payments**:
  - Dodo Payments (per-note checkout)
  - Stripe (subscriptions)
- **Storage**:
  - Local file uploads (`uploads/` via Multer)
  - Optional Cloudinary for assets
- **Email**: SendGrid (`@sendgrid/mail`)
- **Security & Observability**:
  - Helmet, CORS, express-rate-limit
  - Request logging, basic error handling
- **Real-time / Misc**:
  - WebSocket (`ws`) for Neon
  - Firebase (optional sync, some paths disabled in code)
  - Chatbot via Google Gemini (`@google/generative-ai`)

---

## 3. Folder & Module Structure

```text
server/
├── index.ts           # Server entry point
├── routes.ts          # Main API routes (auth, notes, coins, payments, admin, analytics, chatbot, etc.)
├── routes/
│   └── admin.ts       # Separate admin reporting routes
├── storage.ts         # Storage abstraction over DB (users, notes, subscriptions, analytics, etc.)
├── db.ts              # Postgres/Neon Drizzle config (prod)
├── db-sqlite.ts       # SQLite Drizzle config (dev)
├── replitAuth.ts      # Auth setup (passport, sessions, email/Google login)
├── dodo-payments.ts   # Dodo Payments integration
├── sendgrid.ts        # SendGrid email helpers
├── seed-data.ts       # Optional DB seeding (disabled by default)
├── vite.ts            # Vite dev middleware & static serving
└── ...                # Other helpers (chatbot, firebase-sync*, etc.)

shared/
└── schema.ts          # Drizzle schema & shared types
```

---

## 4. Running the Backend

### 4.1 Scripts

Defined in root `package.json`:

```json
"scripts": {
  "dev": "PORT=8000 NODE_ENV=development tsx server/index.ts",
  "build": "vite build",
  "start": "NODE_ENV=production tsx server/index.ts",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

### 4.2 Dev (SQLite, single process: API + client)

```bash
# Install dependencies
npm install

# Copy env and configure
cp .env.example .env
# Edit .env as needed (see section 5)

# Run dev backend (and Vite via middleware)
npm run dev

# App/API served on:
#   App & API: http://localhost:8000
#   API base: http://localhost:8000/api
```

### 4.3 Production (Postgres/Neon)

```bash
# Build frontend
npm run build

# Ensure DATABASE_URL and NODE_ENV=production are set
# Then start server:
npm start
```

In production:

- **Postgres/Neon** is used via `server/db.ts`.
- Vite is not run in dev mode; prebuilt assets from `dist/` are served via `serveStatic(app)`.

---

## 5. Environment Variables (Backend)

Example (simplified – adapt to your deployment):

```env
# Server
NODE_ENV=development
PORT=8000
USE_SQLITE=1           # 1 = SQLite dev mode, unset/0 = Postgres/Neon

# Database (Postgres/Neon)
DATABASE_URL=postgres://user:pass@host/db

# Session & Auth
SESSION_SECRET=your_session_secret

# Google OAuth (JWT verification)
GOOGLE_CLIENT_IDS=your_google_client_id,another_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# Payments – Dodo
DODO_PROJECT_ID=your_dodo_project_id
DODO_API_KEY=your_dodo_api_key
DODO_API_URL=https://api.dodopayments.com
DODO_CHECKOUT_URL=https://checkout.dodopayments.com/buy/your_project_id

# Payments – Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_live_or_test
STRIPE_MONTHLY_PRICE_ID=price_xxx
STRIPE_YEARLY_PRICE_ID=price_yyy

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Chatbot (Gemini)
GEMINI_API_KEY=your_gemini_api_key

# Firebase (optional)
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_firebase_project_id
```

Key behaviors:

- `USE_SQLITE=1`: use local SQLite (`database.db`) with schema from `db-sqlite.ts`. Many external services (SendGrid, Neon) become optional/relaxed.
- Without `USE_SQLITE`, `db.ts` uses Neon Postgres and a real `Pool`; session store uses Postgres via `connect-pg-simple`.

---

## 6. Server Entry & Middleware

### 6.1 `server/index.ts`

- Loads `.env` (`import 'dotenv/config'`).
- Creates Express app, adds JSON/body parsers.
- Adds an API logging middleware that:
  - Measures latency
  - Logs `METHOD PATH STATUS` and truncated JSON response for `/api/*`.

Then:

- Calls `registerRoutes(app)` from `routes.ts` (core API).
- Configures global error handler.
- In dev: attaches Vite via `setupVite(app, server)`.
- In prod: serves static assets via `serveStatic(app)`.
- Listens on `PORT` (script sets `8000`).

---

## 7. Authentication & Authorization

Implementation is in `replitAuth.ts` + `routes.ts`.

### 7.1 Sessions

- Uses `express-session` with:
  - Cookie TTL: **7 days**
  - `httpOnly` cookies, `secure` in production
- Session store:
  - Dev / `USE_SQLITE=1`: in-memory (no Postgres requirement)
  - Prod: Postgres `sessions` table via `connect-pg-simple`

### 7.2 Local Email Auth

- Passport Local Strategy:
  - Username & password field both `email` (email-only login for now).
  - `createOrLoginUser(email, role)`:
    - If user doesnt exist → create with role (`student`/`topper`) and send welcome email (SendGrid).
    - If exists → reuse.
- Endpoint:

```http
POST /api/login
```

Body includes `email` and optional `role`. On success:

- User is logged into the session (`req.logIn`).
- `recordUserActivity` is called with action `login`.

### 7.3 Google OAuth (JWT-based)

- Endpoint:

```http
POST /api/auth/google
```

Body:

- `credential`: Google ID token (JWT)
- `role`: `"student"` or `"topper"`

Flow:

1. Verify Google JWT.
2. Call `createOrLoginUser` with Google profile data.
3. Update user profile image & flags.
4. Log user in via session.
5. Record login activity.

### 7.4 Auth Helpers & Protected Routes

- `setupAuth(app)`: attaches session + passport (`initialize`, `session`) and registers auth routes.
- `isAuthenticated` middleware (exported from `replitAuth.ts`):

```ts
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};
```

Used on all protected endpoints (notes, coins, admin, analytics, etc.).

---

## 8. Database Layer

### 8.1 Dev (SQLite) – `db-sqlite.ts`

- Uses `better-sqlite3` with Drizzle.
- Creates DB file `database.db` and ensures core tables exist:
  - `users`, `notes`, `transactions` (with fields like `coinBalance`, `downloadsCount`, `price`, etc.).
- Exports:

```ts
export const db = drizzle(sqlite);
export { sqlite };
```

### 8.2 Prod (Postgres / Neon) – `db.ts`

- Uses `@neondatabase/serverless` with `drizzle-orm/neon-serverless`.
- Config:
  - Sets `neonConfig.webSocketConstructor = ws`
  - Requires `DATABASE_URL` when **not** in `USE_SQLITE=1` mode.
- Exports `pool` and `db` bound to `@shared/schema`.

### 8.3 Storage Abstraction – `storage.ts`

`storage.ts` implements a `storage` object with methods such as:

- **Users**:
  - `getUser`, `upsertUser`, `getUserByEmail`, `getAllUsers`, `updateUserRole`, `updateUserStripeInfo`, …
- **Topper Profiles**:
  - `createTopperProfile`, `getTopperProfile`, `getTopperAnalytics`, …
- **Notes**:
  - CRUD operations, filters, admin review queue, stats.
- **Transactions & Coins**:
  - Create transactions, get coin balance/history, leaderboard, etc.
- **Subscriptions**:
  - `getActiveSubscription`, `createSubscription`, etc.
- **Admin Analytics**:
  - `getAdminStats`, `getUserActivity`, etc.

Routes call into `storage` so DB engines are abstracted away.

---

## 9. File Uploads & Media

- Uses **Multer** with destination `uploads/`:
  - Max file size: **50MB**
  - Allowed extensions: `.pdf`, `.doc`, `.docx`, `.jpg`, `.jpeg`, `.png`
- Express serves uploads:

```ts
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
```

- Notes may also integrate with **Cloudinary** (via `cloudinary` package) for permanent storage, controlled by env vars.

Core endpoints (simplified):

```http
POST /api/notes/upload                # Upload note with file + metadata
GET  /api/notes                       # List published/available notes
GET  /api/notes/:id                   # Note details
GET  /api/notes/:id/download          # Download note (after access checks)
```

---

## 10. Payments & Subscriptions

### 10.1 Dodo Payments – Per-Note Checkout

Implementation: `server/dodo-payments.ts`

- Builds a **checkout URL** with query params using `DODO_CHECKOUT_URL`.
- Returns `{ success, paymentUrl, transactionId }`.
- Verifies payment via Dodo API when needed.

Typical endpoints (high-level):

```http
POST /api/notes/:id/dodo-payment          # Create Dodo payment, return redirect URL
POST /api/dodo-webhook                    # Webhook to update transaction status (uses signature)
GET  /api/dodo-payment/:txnId/status      # Check payment status
```

Webhook signature is validated with a SHA-256 hash over payload + `DODO_API_KEY`.

### 10.2 Stripe – Subscriptions

In `routes.ts`:

```http
POST /api/create-subscription
```

Behavior:

- Protected by `isAuthenticated`.
- Uses `STRIPE_SECRET_KEY` to:
  - Create/reuse Stripe Customer.
  - Create Subscription for selected plan (`monthly` or `yearly`) using `STRIPE_MONTHLY_PRICE_ID` / `STRIPE_YEARLY_PRICE_ID`.
- Persists subscription in DB via `storage.createSubscription`.
- Updates user with `stripeCustomerId` and `stripeSubscriptionId`.
- Returns `subscriptionId` and `clientSecret` for frontend to complete payment.

---

## 11. Admin & Analytics

### 11.1 Admin Routes (`routes.ts` + `routes/admin.ts`)

Protected by `isAuthenticated` and role checks (`user.role === "admin"`):

- Stats & analytics:

```http
GET /api/admin/stats           # Overall metrics via storage.getAdminStats()
GET /api/admin/notes           # Paginated list of all notes (filters by status, subject)
GET /api/admin/user-activity   # Real-time activity logs
```

- Separate router in `routes/admin.ts` (JSON reporting style):

```http
GET /api/admin/users           # All users list
GET /api/admin/user-stats      # Counts: total, active, toppers, newToday
GET /api/admin/notes           # Notes with basic stats
GET /api/admin/note-stats      # Notes summary: totals, approved, pending
GET /api/admin/transactions    # All transactions with derived fields
GET /api/admin/coin-stats      # Aggregated coin stats
GET /api/admin/withdrawals     # Placeholder (empty array)
GET /api/admin/activities      # Mock activities (for UI/testing)
```

### 11.2 Topper Analytics

```http
GET /api/analytics/topper      # For logged-in toppers only
```

Returns detailed per-topper analytics from `storage.getTopperAnalytics(userId)`.

---

## 12. Chatbot Integration

- Implemented as backend endpoints using **Google Gemini** via `@google/generative-ai`.
- Typical endpoints:

```http
POST /api/chatbot/chat          # Send a user message, returns AI reply
GET  /api/chatbot/suggestions   # Predefined suggested questions
GET  /api/chatbot/health        # Simple health check
```

The chatbot can use user context (e.g., notes, profile) to tailor responses.

---

## 13. Troubleshooting (Backend)

- **Port in use**: free `8000` or set a different `PORT`.
- **DATABASE_URL errors**:
  - In dev, set `USE_SQLITE=1` to avoid needing Postgres.
  - In prod, ensure Neon/Postgres is reachable and URL correct.
- **SENDGRID_API_KEY missing**:
  - In dev with `USE_SQLITE=1`, SendGrid is optional; emails are skipped with a warning.
  - In prod without `USE_SQLITE=1`, missing key throws at startup.
- **Dodo or Stripe not configured**:
  - Payment routes will return a graceful error like `"Payment processing is currently unavailable"`.

---

## 14. Summary

This backend is a modular, TypeScript-based Express API with:

- Pluggable storage (SQLite dev / Neon Postgres prod)
- Session-based auth (email & Google) with role-based access
- Full note lifecycle + rewards + payments
- Admin & analytics endpoints
- Integrations with SendGrid, Dodo, Stripe, Cloudinary, Gemini

Use this document as the canonical reference for **backend setup, architecture, and API surface**.
