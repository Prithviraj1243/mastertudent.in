import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { sendWelcomeEmail } from "./sendgrid";
import { syncUserToFirebase } from "./firebase-sync";
import crypto from "crypto";

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

// Simple JWT decode (for demo purposes - in production use a proper JWT library)
function decodeGoogleJWT(token: string): GoogleJWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    // Basic validation
    if (!payload.email || !payload.email_verified) {
      return null;
    }
    
    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('JWT decode error:', error);
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
  // In dev SQLite mode, avoid Postgres session store
  if (process.env.USE_SQLITE === '1') {
    return session({
      secret: process.env.SESSION_SECRET || 'dev_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: sessionTtl,
      },
    });
  }
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
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

    // Sync new user to Firebase (async, don't wait for it)
    syncUserToFirebase({
      id: newUser.id,
      email: newUser.email,
      name: `${newUser.firstName} ${newUser.lastName}`.trim(),
      provider: 'email',
      subscription: 'free',
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      role: newUser.role || 'student'
    }).catch(syncError => {
      console.error('Firebase sync error for new user:', syncError);
    });
    
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
      passwordField: 'email', // We'll use email as both username and password for simplicity
      passReqToCallback: true, // Allow access to req object
    },
    async (req: any, email: string, password: string, done) => {
      try {
        // For now, allow any valid email to login
        if (!email || !email.includes('@')) {
          return done(null, false, { message: 'Please enter a valid email address' });
        }
        
        // Get role from request body
        const role = req.body?.role;
        const user = await createOrLoginUser(email, role);
        return done(null, user);
      } catch (error) {
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

        // Sync user to Firebase for admin panel (async, don't wait for it)
        syncUserToFirebase({
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          provider: 'email',
          subscription: 'free', // Default subscription
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          role: user.role || 'student'
        }).catch(syncError => {
          console.error('Firebase sync error during login:', syncError);
        });
        
        return res.json({ success: true, user: { id: user.id, email: user.email, firstName: user.firstName } });
      });
    })(req, res, next);
  });

  // Google OAuth endpoint
  app.post("/api/auth/google", async (req, res) => {
    try {
      console.log('Google OAuth request received:', { body: req.body });
      
      const { credential, role } = req.body;
      
      if (!credential) {
        console.error('No credential provided');
        return res.status(400).json({ message: 'Google credential is required' });
      }
      
      if (!role || (role !== 'student' && role !== 'topper')) {
        console.error('Invalid role:', role);
        return res.status(400).json({ message: 'Valid role is required' });
      }
      
      // Decode and verify Google JWT
      const payload = decodeGoogleJWT(credential);
      
      if (!payload) {
        console.error('Failed to decode Google JWT');
        return res.status(400).json({ message: 'Invalid Google credential' });
      }
      
      console.log('Decoded Google payload:', { email: payload.email, aud: payload.aud });
      
      // Verify the audience matches your client ID
      const expectedClientId = process.env.GOOGLE_CLIENT_ID || "914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com";
      if (payload.aud !== expectedClientId) {
        console.error('Client ID mismatch:', { expected: expectedClientId, received: payload.aud });
        return res.status(400).json({ message: 'Invalid client ID' });
      }
      
      // Create or login user with Google data
      let user = await createOrLoginUser(
        payload.email,
        role,
        payload.given_name,
        payload.family_name
      );
      
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
          console.error('Google login error:', err);
          return res.status(500).json({ message: 'Login error' });
        }
        
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

        // Sync user to Firebase for admin panel (async, don't wait for it)
        syncUserToFirebase({
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          photoURL: user.profileImageUrl,
          provider: 'google',
          subscription: 'free', // Default subscription
          isEmailVerified: payload.email_verified,
          createdAt: new Date().toISOString(),
          role: user.role || 'student'
        }).catch(syncError => {
          console.error('Firebase sync error during Google login:', syncError);
        });
        
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
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return res.status(500).json({ 
        message: 'Authentication error',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      });
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
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};
