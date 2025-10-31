// Firebase Configuration for MasterStudent Notes Marketplace
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config with your credentials
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

// Admin API Key for secure access
export const ADMIN_API_KEY = "masterstudent_admin_2024_secure_key_" + Date.now();

console.log("Firebase initialized successfully");
console.log("Admin API Key:", ADMIN_API_KEY);

export default app;
