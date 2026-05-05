import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0223754291',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:927511382436:web:1bfd9a33e37d97047fd931',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAuo8BhsyG6PXz-35335rtv2fGp3T_5xTw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0223754291.firebaseapp.com',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DB_ID || 'ai-studio-ea11382d-9a18-409e-b24f-c8f73f3539ee',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0223754291.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '927511382436',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
