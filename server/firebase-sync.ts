// Firebase Sync Service - Connects Main Website to Firebase Admin Panel
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc 
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_qCynsbzo7VwGdui6dT7gDai9XNyFDn8",
  authDomain: "masterstudent-6ea89.firebaseapp.com",
  projectId: "masterstudent-6ea89",
  messagingSenderId: "984570563803",
  appId: "1:984570563803:web:your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections
const COLLECTIONS = {
  USERS: 'users',
  NOTES: 'notes',
  PAYMENTS: 'payments',
  SUBSCRIPTIONS: 'subscriptions',
  ADMIN_LOGS: 'admin_logs'
};

// Sync user to Firebase when they login/register
export const syncUserToFirebase = async (userData: any) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userData.id);
    
    const firebaseUser: any = {
      id: userData.id,
      email: userData.email,
      name: userData.name || userData.displayName || 'Unknown',
      provider: userData.provider || 'email',
      subscription: userData.subscription || 'free',
      status: 'active',
      createdAt: userData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      // Additional fields from your main website
      isEmailVerified: userData.isEmailVerified || false,
      preferences: userData.preferences || {},
      totalNotes: userData.totalNotes || 0,
      totalDownloads: userData.totalDownloads || 0,
      // Coin system fields
      coins: userData.coins || 0,
      totalCoinsEarned: userData.totalCoinsEarned || 0,
      lastCoinReward: userData.lastCoinReward || null
    };

    // Only add photoURL if it exists
    if (userData.photoURL || userData.picture) {
      firebaseUser.photoURL = userData.photoURL || userData.picture;
    }

    await setDoc(userRef, firebaseUser, { merge: true });
    
    // Log the sync action
    await logAdminAction('USER_SYNC', `User ${userData.email} synced to Firebase`);
    
    console.log(`✅ User ${userData.email} synced to Firebase`);
    return true;
  } catch (error) {
    console.error('❌ Error syncing user to Firebase:', error);
    return false;
  }
};

// Sync note to Firebase when uploaded
export const syncNoteToFirebase = async (noteData: any) => {
  try {
    const noteRef = doc(db, COLLECTIONS.NOTES, noteData.id);
    
    const firebaseNote: any = {
      id: noteData.id,
      title: noteData.title,
      description: noteData.description,
      subject: noteData.subject,
      category: noteData.category,
      userId: noteData.userId,
      userEmail: noteData.userEmail,
      fileName: noteData.fileName,
      fileSize: noteData.fileSize,
      fileType: noteData.fileType,
      filePath: noteData.filePath,
      price: noteData.price || 0,
      isPremium: noteData.isPremium || false,
      isApproved: false, // Default to not approved
      approvalStatus: 'pending',
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      tags: noteData.tags || [],
      createdAt: noteData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Only add optional fields if they exist
    if (noteData.cloudinaryUrl) {
      firebaseNote.cloudinaryUrl = noteData.cloudinaryUrl;
    }
    if (noteData.uploadIP) {
      firebaseNote.uploadIP = noteData.uploadIP;
    }
    if (noteData.uploadUserAgent) {
      firebaseNote.uploadUserAgent = noteData.uploadUserAgent;
    }

    await setDoc(noteRef, firebaseNote, { merge: true });
    
    // Log the sync action
    await logAdminAction('NOTE_SYNC', `Note "${noteData.title}" uploaded by ${noteData.userEmail}`);
    
    console.log(`✅ Note "${noteData.title}" synced to Firebase`);
    return true;
  } catch (error) {
    console.error('❌ Error syncing note to Firebase:', error);
    return false;
  }
};

// Approve note in Firebase
export const approveNoteInFirebase = async (noteId: string, adminEmail: string) => {
  try {
    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
    
    await updateDoc(noteRef, {
      isApproved: true,
      approvalStatus: 'approved',
      approvedBy: adminEmail,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Log the approval action
    await logAdminAction('NOTE_APPROVED', `Note ${noteId} approved by ${adminEmail}`);
    
    console.log(`✅ Note ${noteId} approved by ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error approving note in Firebase:', error);
    return false;
  }
};

// Reject note in Firebase
export const rejectNoteInFirebase = async (noteId: string, adminEmail: string, reason: string) => {
  try {
    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
    
    await updateDoc(noteRef, {
      isApproved: false,
      approvalStatus: 'rejected',
      rejectionReason: reason,
      rejectedBy: adminEmail,
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Log the rejection action
    await logAdminAction('NOTE_REJECTED', `Note ${noteId} rejected by ${adminEmail}: ${reason}`);
    
    console.log(`✅ Note ${noteId} rejected by ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error rejecting note in Firebase:', error);
    return false;
  }
};

// Sync payment to Firebase
export const syncPaymentToFirebase = async (paymentData: any) => {
  try {
    const paymentRef = doc(db, COLLECTIONS.PAYMENTS, paymentData.id);
    
    const firebasePayment = {
      id: paymentData.id,
      userId: paymentData.userId,
      userEmail: paymentData.userEmail,
      amount: paymentData.amount,
      currency: paymentData.currency || 'INR',
      status: paymentData.status,
      method: paymentData.method,
      type: paymentData.type || 'one-time',
      description: paymentData.description,
      stripePaymentId: paymentData.stripePaymentId,
      noteId: paymentData.noteId,
      subscriptionId: paymentData.subscriptionId,
      createdAt: paymentData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(paymentRef, firebasePayment, { merge: true });
    
    // Log the sync action
    await logAdminAction('PAYMENT_SYNC', `Payment ${paymentData.id} synced to Firebase`);
    
    console.log(`✅ Payment ${paymentData.id} synced to Firebase`);
    return true;
  } catch (error) {
    console.error('❌ Error syncing payment to Firebase:', error);
    return false;
  }
};

// Sync subscription to Firebase
export const syncSubscriptionToFirebase = async (subscriptionData: any) => {
  try {
    const subscriptionRef = doc(db, COLLECTIONS.SUBSCRIPTIONS, subscriptionData.id);
    
    const firebaseSubscription = {
      id: subscriptionData.id,
      userId: subscriptionData.userId,
      userEmail: subscriptionData.userEmail,
      tier: subscriptionData.tier, // basic, premium, pro
      status: subscriptionData.status, // active, cancelled, expired
      amount: subscriptionData.amount,
      currency: subscriptionData.currency || 'INR',
      interval: subscriptionData.interval, // monthly, yearly
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
      startDate: subscriptionData.startDate || serverTimestamp(),
      endDate: subscriptionData.endDate,
      nextBilling: subscriptionData.nextBilling,
      cancelledAt: subscriptionData.cancelledAt,
      createdAt: subscriptionData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(subscriptionRef, firebaseSubscription, { merge: true });
    
    // Log the sync action
    await logAdminAction('SUBSCRIPTION_SYNC', `Subscription ${subscriptionData.id} synced to Firebase`);
    
    console.log(`✅ Subscription ${subscriptionData.id} synced to Firebase`);
    return true;
  } catch (error) {
    console.error('❌ Error syncing subscription to Firebase:', error);
    return false;
  }
};

// Log admin actions
export const logAdminAction = async (action: string, details: string) => {
  try {
    await addDoc(collection(db, COLLECTIONS.ADMIN_LOGS), {
      action,
      details,
      timestamp: serverTimestamp(),
      source: 'main-website'
    });
  } catch (error) {
    console.error('❌ Error logging admin action:', error);
  }
};

// Update user activity
export const updateUserActivity = async (userId: string, activity: any) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    
    await updateDoc(userRef, {
      lastActivity: serverTimestamp(),
      totalNotes: activity.totalNotes,
      totalDownloads: activity.totalDownloads,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error updating user activity:', error);
    return false;
  }
};

export { db, COLLECTIONS };
