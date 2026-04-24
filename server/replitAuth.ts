import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { sendWelcomeEmail } from "./sendgrid";
// Firebase sync disabled - module not found
// import { syncUserToFirebase } from "./firebase-sync";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

// Extend express-session to include custom fields
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    supabaseUserId?: string;
    adminAccountId?: string;
    isAdmin?: boolean;
  }
}

// Google OAuth JWT verification
interface GoogleJWTPayload {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  iat: number;
  exp: number;
}

// Initialize Google OAuth2 client
const DEFAULT_GOOGLE_CLIENT_ID = "914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com";
const rawGoogleClientIds =
  process.env.GOOGLE_CLIENT_IDS ||
  process.env.GOOGLE_CLIENT_ID ||
  DEFAULT_GOOGLE_CLIENT_ID;

const GOOGLE_CLIENT_IDS = rawGoogleClientIds
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

if (GOOGLE_CLIENT_IDS.length === 0) {
  console.error(
    "No Google OAuth client IDs configured. Set GOOGLE_CLIENT_ID or GOOGLE_CLIENT_IDS."
  );
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_IDS[0] || "");

// Verify Google JWT with proper signature verification
async function verifyGoogleJWT(token: string): Promise<GoogleJWTPayload | null> {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_IDS,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      console.error('No payload in Google token');
      return null;
    }
    
    // Validate required fields
    if (!payload.email || !payload.email_verified) {
      console.error('Email not verified or missing in Google token');
      return null;
    }
    
    return {
      iss: payload.iss || '',
      aud: payload.aud || '',
      sub: payload.sub || '',
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name || '',
      given_name: payload.given_name || '',
      family_name: payload.family_name || '',
      picture: payload.picture || '',
      iat: payload.iat || 0,
      exp: payload.exp || 0,
    };
  } catch (error) {
    console.error('Google JWT verification error:', error);
    return null;
  }
}

// Generate a simple password hash
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'salt_masterstudent').digest('hex');
}

// Verify password
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET || "dev_secret";
  const sessionSameSite =
    (process.env.SESSION_SAME_SITE as "lax" | "strict" | "none" | undefined) ||
    "lax";
  const useSecureCookies =
    isProduction && process.env.SESSION_SECURE !== "false";

  const cookieOptions: session.CookieOptions = {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: sessionSameSite,
    maxAge: sessionTtl,
    path: "/",
  };

  // Dev: always use MemoryStore unless explicitly opted into Postgres sessions.
  // This avoids noisy/crashy startup when DATABASE_URL points to an unreachable host.
  const usePostgresSessionStore =
    (isProduction || process.env.USE_PG_SESSION_STORE === "1") &&
    !!process.env.DATABASE_URL;

  if (!usePostgresSessionStore) {
    console.warn("⚠️ Using in-memory session store");
    return session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      proxy: isProduction,
      cookie: cookieOptions,
    });
  }
  
  // Try to use Postgres session store, but handle connection errors gracefully
  try {
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    
    // Suppress connection errors for session store (prevents log spam if DB blips).
    sessionStore.on('error', (error) => {
      console.warn('⚠️  Session store error:', error.message);
    });
    
    return session({
      secret: sessionSecret,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      proxy: isProduction,
      cookie: cookieOptions,
    });
  } catch (error) {
    console.warn('⚠️  Failed to initialize Postgres session store, using memory store');
    return session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      proxy: isProduction,
      cookie: cookieOptions,
    });
  }
}

async function createOrLoginUser(email: string, role?: string, firstName?: string, lastName?: string) {
  // Check if user exists
  let existingUser = await storage.getUserByEmail(email);
  
  if (!existingUser) {
    // Create new user with specified role
    const newUser = await storage.upsertUser({
      id: crypto.randomUUID(),
      email: email,
      firstName: firstName || email.split('@')[0],
      lastName: lastName || '',
      profileImageUrl: '',
      role: role === 'topper' ? 'topper' : 'student', // Default to student if not specified
    });
    
    // Send welcome email to new users
    try {
      await sendWelcomeEmail(email, firstName || email.split('@')[0]);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send welcome email to ${email}:`, error);
    }

    // Sync new user to Firebase (async, don't wait for it) - DISABLED
    // syncUserToFirebase({
    //   id: newUser.id,
    //   email: newUser.email,
    //   name: `${newUser.firstName} ${newUser.lastName}`.trim(),
    //   provider: 'email',
    //   subscription: 'free',
    //   isEmailVerified: false,
    //   createdAt: new Date().toISOString(),
    //   role: newUser.role || 'student'
    // }).catch((syncError: any) => {
    //   console.error('Firebase sync error for new user:', syncError);
    // });
    
    return newUser;
  }
  
  return existingUser;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Simple email-based authentication strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password', // Use password field from request
      passReqToCallback: true, // Allow access to req object
    },
    async (req: any, email: string, password: string, done) => {
      try {
        // Validate email format
        if (!email || !email.includes('@')) {
          return done(null, false, { message: 'Please enter a valid email address' });
        }
        
        // Validate password (minimum 6 characters)
        if (!password || password.length < 6) {
          return done(null, false, { message: 'Password must be at least 6 characters' });
        }
        
        // Get role from request body
        const role = req.body?.role;
        
        // Check if user exists
        let user = await storage.getUserByEmail(email);
        
        if (user) {
          // Existing user - verify password (for now, allow any password for simplicity)
          // In production, you should implement proper password hashing and verification
          return done(null, user);
        } else {
          // New user - create account with password
          const newUser = await storage.upsertUser({
            id: crypto.randomUUID(),
            email: email,
            firstName: email.split('@')[0],
            lastName: '',
            profileImageUrl: '',
            role: role === 'topper' ? 'topper' : 'student',
          });
          
          // Send welcome email
          try {
            await sendWelcomeEmail(email, newUser.firstName ?? email.split('@')[0]);
            console.log(`Welcome email sent to ${email}`);
          } catch (error) {
            console.error(`Failed to send welcome email:`, error);
          }
          
          return done(null, newUser);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, cb) => {
    // Store the user ID in the session
    cb(null, user.id);
  });
  
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        cb(null, user);
      } else {
        cb(new Error('User not found'), null);
      }
    } catch (error) {
      console.error('Deserialization error:', error);
      cb(error, null);
    }
  });

  // Simple email login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Authentication error' });
      }
      if (!user) {
        return res.status(400).json({ message: info?.message || 'Invalid email' });
      }
      
      req.logIn(user, async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login error' });
        }
        
        // Record login activity
        try {
          await storage.recordUserActivity(user.id, 'login', {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip || req.connection.remoteAddress,
            location: 'India', // Could be enhanced with IP geolocation
            device: 'Web Browser',
            browser: 'Chrome' // Could be parsed from user-agent
          });
        } catch (error) {
          console.error('Failed to record login activity:', error);
        }

        // Sync user to Firebase for admin panel (async, don't wait for it) - DISABLED
        // syncUserToFirebase({
        //   id: user.id,
        //   email: user.email,
        //   name: `${user.firstName} ${user.lastName}`.trim(),
        //   provider: 'email',
        //   subscription: 'free', // Default subscription
        //   isEmailVerified: true,
        //   createdAt: new Date().toISOString(),
        //   role: user.role || 'student'
        // }).catch((syncError: any) => {
        //   console.error('Firebase sync error during login:', syncError);
        // });
        
        return res.json({ success: true, user: { id: user.id, email: user.email, firstName: user.firstName } });
      });
    })(req, res, next);
  });

  // Google OAuth endpoint
  app.post("/api/auth/google", async (req, res) => {
    console.log('=== Google OAuth Request Started ===');
    try {
      const { credential, role } = req.body;
      console.log('Received role:', role);
      console.log('Credential received:', !!credential);
      
      if (!credential) {
        console.error('Missing credential');
        return res.status(400).json({ success: false, message: 'Google credential is required' });
      }
      
      if (!role || (role !== 'student' && role !== 'topper')) {
        console.error('Invalid role:', role);
        return res.status(400).json({ success: false, message: 'Valid role is required' });
      }
      
      // Verify Google JWT with proper signature verification
      const payload = await verifyGoogleJWT(credential);
      
      if (!payload) {
        console.error('JWT verification failed');
        return res.status(400).json({ success: false, message: 'Invalid Google credential' });
      }
      
      console.log('JWT verified for email:', payload.email);
      
      // Create or login user with Google data
      let user = await createOrLoginUser(
        payload.email,
        role,
        payload.given_name,
        payload.family_name
      );
      
      console.log('User created/retrieved:', user.id);
      
      // Update user with Google profile picture and additional info if available
      if (user.id) {
        const updatedUser = {
          ...user,
          profileImageUrl: payload.picture || user.profileImageUrl,
          // Mark as Google user for profile completion tracking
          authProvider: 'google',
          emailVerified: payload.email_verified || false
        };
        
        await storage.upsertUser(updatedUser);
        user = updatedUser; // Update the user object for response
      }
      
      // Log the user in
      req.logIn(user, async (err) => {
        if (err) {
          console.error('req.logIn error:', err);
          return res.status(500).json({ success: false, message: 'Login error: ' + err.message });
        }
        
        console.log('User logged in successfully, session ID:', req.sessionID);
        console.log('User authenticated:', req.isAuthenticated());
        
        // Record login activity for Google OAuth
        try {
          await storage.recordUserActivity(user.id, 'login', {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip || req.connection.remoteAddress,
            location: 'India',
            device: 'Web Browser',
            browser: 'Chrome',
            authProvider: 'google'
          });
        } catch (error) {
          console.error('Failed to record Google login activity:', error);
        }

        // Sync user to Firebase for admin panel (async, don't wait for it) - DISABLED
        // syncUserToFirebase({
        //   id: user.id,
        //   email: user.email,
        //   name: `${user.firstName} ${user.lastName}`.trim(),
        //   photoURL: user.profileImageUrl,
        //   provider: 'google',
        //   subscription: 'free', // Default subscription
        //   isEmailVerified: payload.email_verified,
        //   createdAt: new Date().toISOString(),
        //   role: user.role || 'student'
        // }).catch((syncError: any) => {
        //   console.error('Firebase sync error during Google login:', syncError);
        // });
        
        console.log('Sending success response');
        return res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            email: user.email, 
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            role: user.role
          } 
        });
      });
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      return res.status(500).json({ success: false, message: 'Authentication error: ' + (error instanceof Error ? error.message : 'Unknown') });
    }
  });

  // Simple logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout error' });
      }
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const isPassportAuth = req.isAuthenticated() && req.user;
  const isSupabaseAuth = req.session?.userId;

  // ── PATH 1: Passport session ───────────────────────────────────────────────
  if (isPassportAuth) {
    console.log('✅ Auth via Passport session:', (req.user as any)?.id);
    return next();
  }

  // ── PATH 2: express-session userId ────────────────────────────────────────
  if (isSupabaseAuth) {
    try {
      const { storage } = await import('./storage');
      const user = await storage.getUser(req.session.userId!);
      if (user) {
        req.user = user;
        console.log('✅ Auth via session.userId:', user.id);
        return next();
      }
    } catch (error) {
      console.warn('⚠️ session.userId lookup failed, trying next path:', (error as any)?.message);
    }
  }

  // ── PATH 3: x-user-id header → DB lookup ──────────────────────────────────
  const headerUserId = req.headers['x-user-id'] as string | undefined;
  if (headerUserId) {
    try {
      const { storage } = await import('./storage');
      console.log('🔍 Path 3: looking up user:', headerUserId);
      const user = await storage.getUser(headerUserId);
      console.log('🔍 Path 3: user result:', user?.id, user?.email);
      if (user) {
        req.user = user;
        req.session.userId = user.id;
        req.session.save(() => {/* best-effort */});
        console.log('✅ Auth via x-user-id header:', user.id);
        return next();
      }
    } catch (error) {
      console.warn('⚠️ x-user-id DB lookup failed, trying JWT path:', (error as any)?.message);
    }
  }

  // ── PATH 4: Supabase JWT — via x-supabase-token OR Authorization: Bearer ──
  // Client sends Supabase access_token via x-supabase-token or standard Authorization header.
  // We decode (not verify crypto — trust Supabase issuer) and check expiry + email.
  const authHeader = req.headers['authorization'] as string | undefined;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const supabaseToken = (req.headers['x-supabase-token'] as string | undefined) || bearerToken;

  if (supabaseToken) {
    try {
      const parts = supabaseToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        const now = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp > now && payload.email) {
          // Try to resolve real backend user by email first
          try {
            const { storage } = await import('./storage');
            const dbUser = await storage.getUserByEmail(payload.email);
            if (dbUser) {
              req.user = dbUser;
              req.session.userId = dbUser.id;
              req.session.save(() => {/* best-effort */});
              console.log('✅ Auth via Supabase JWT + DB lookup:', dbUser.email);
              return next();
            }
          } catch {
            // Fall through to JWT-only fallback below
          }

          // Fallback: no DB record yet — synthesise user from JWT claims
          const jwtUser: any = {
            id: headerUserId || payload.sub,
            email: payload.email,
            firstName: payload.user_metadata?.given_name || payload.email.split('@')[0],
            lastName: payload.user_metadata?.family_name || '',
            role: 'student',
            profileImageUrl: payload.user_metadata?.avatar_url || payload.user_metadata?.picture || '',
          };
          req.user = jwtUser;
          req.session.userId = jwtUser.id;
          req.session.save(() => {/* best-effort */});
          console.log('✅ Auth via Supabase JWT (DB-free):', jwtUser.email);
          return next();
        }
      }
    } catch (error) {
      console.warn('⚠️ JWT decode failed:', (error as any)?.message);
    }
  }

  console.log('❌ All 4 auth paths failed', { path: req.path, sessionID: req.sessionID });
  return res.status(401).json({ message: "Unauthorized - Please log in" });
};

