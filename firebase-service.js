// Firebase Database Service Layer
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase-config.js';

// Collections
const COLLECTIONS = {
  USERS: 'users',
  NOTES: 'notes',
  PAYMENTS: 'payments',
  SUBSCRIPTIONS: 'subscriptions',
  DOWNLOADS: 'downloads',
  RATINGS: 'ratings',
  ADMIN_LOGS: 'admin_logs'
};

// User Operations
export const userService = {
  async create(userData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getById(userId) {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async getByEmail(email) {
    const q = query(collection(db, COLLECTIONS.USERS), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  },

  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async update(userId, updates) {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(userId) {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  }
};

// Notes Operations
export const notesService = {
  async create(noteData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTES), {
      ...noteData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getById(noteId) {
    const docRef = doc(db, COLLECTIONS.NOTES, noteId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.NOTES));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getByUser(userId) {
    const q = query(collection(db, COLLECTIONS.NOTES), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async update(noteId, updates) {
    const docRef = doc(db, COLLECTIONS.NOTES, noteId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(noteId) {
    await deleteDoc(doc(db, COLLECTIONS.NOTES, noteId));
  }
};

// Subscription Operations
export const subscriptionService = {
  async create(subscriptionData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.SUBSCRIPTIONS), {
      ...subscriptionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getByUser(userId) {
    const q = query(collection(db, COLLECTIONS.SUBSCRIPTIONS), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getActive() {
    const q = query(collection(db, COLLECTIONS.SUBSCRIPTIONS), where("status", "==", "active"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async update(subscriptionId, updates) {
    const docRef = doc(db, COLLECTIONS.SUBSCRIPTIONS, subscriptionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
};

// Payment Operations
export const paymentService = {
  async create(paymentData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), {
      ...paymentData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getByUser(userId) {
    const q = query(collection(db, COLLECTIONS.PAYMENTS), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PAYMENTS));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Admin Logs
export const adminLogService = {
  async create(logData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.ADMIN_LOGS), {
      ...logData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  },

  async getRecent(limitCount = 50) {
    const q = query(
      collection(db, COLLECTIONS.ADMIN_LOGS), 
      orderBy("timestamp", "desc"), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

export { COLLECTIONS };
