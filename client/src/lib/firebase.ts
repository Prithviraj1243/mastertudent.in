// Firebase client configuration for Google OAuth on deployed website
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config - same as your production config
const firebaseConfig = {
  apiKey: "AIzaSyA_qCynsbzo7VwGdui6dT7gDai9XNyFDn8",
  authDomain: "masterstudent-6ea89.firebaseapp.com",
  projectId: "masterstudent-6ea89",
  messagingSenderId: "984570563803",
  appId: "1:984570563803:web:your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Collections
export const COLLECTIONS = {
  USERS: 'users'
};

// Decode Google JWT token
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

// Handle Google OAuth for deployed website
export const handleGoogleOAuthForDeployedSite = async (credential: string, role: string = 'student') => {
  try {
    console.log('🔥 Starting Google OAuth process...');
    
    // Decode the Google JWT token
    const googleUser = parseJwt(credential);
    if (!googleUser) {
      throw new Error('Failed to decode Google credential');
    }

    console.log('✅ Google user data decoded:', {
      name: googleUser.name,
      email: googleUser.email,
      picture: googleUser.picture
    });

    // Check if user already exists
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where("email", "==", googleUser.email));
    const querySnapshot = await getDocs(q);

    let userId;
    let userData;

    if (!querySnapshot.empty) {
      // User exists, get their data
      const existingUser = querySnapshot.docs[0];
      userId = existingUser.id;
      userData = { id: userId, ...existingUser.data() };
      console.log('✅ Existing user found:', userId);
    } else {
      // Create new user
      const newUserData = {
        firstName: googleUser.given_name || 'Google',
        lastName: googleUser.family_name || 'User',
        name: googleUser.name || `${googleUser.given_name || 'Google'} ${googleUser.family_name || 'User'}`,
        email: googleUser.email,
        profileImageUrl: googleUser.picture || null,
        provider: 'google',
        role: role,
        registrationType: 'google',
        subscription: 'free',
        status: 'active',
        isEmailVerified: googleUser.email_verified || false,
        coins: 0,
        totalNotes: 0,
        totalDownloads: 0,
        totalCoinsEarned: 0,
        isActive: true,
        isVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };

      console.log('📝 Creating new Google user in Firebase...');
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), newUserData);
      userId = docRef.id;
      userData = { id: userId, ...newUserData };
      console.log('✅ New Google user created with ID:', userId);
    }

    // Return user data for local storage
    return {
      success: true,
      user: {
        id: userId,
        email: googleUser.email,
        firstName: googleUser.given_name || 'Google',
        lastName: googleUser.family_name || 'User',
        name: googleUser.name,
        picture: googleUser.picture,
        role: role,
        provider: 'google'
      }
    };

  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Google OAuth failed'
    };
  }
};

export default app;