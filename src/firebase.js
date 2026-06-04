// ─── Firebase Initialization ─────────────────────────────────────────────────
// Values are read from .env (VITE_ prefix required for Vite to expose them).
// Copy .env.example → .env and fill in your values before running.

import { initializeApp, getApps }     from "firebase/app";
import { getAuth }                     from "firebase/auth";
import { getFirestore }                from "firebase/firestore";

// Firebase project config (use env vars in production; hardcoded fallback for development)
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? "AIzaSyDacfSPRbwb2OD9JE1wM5J0LOvvI4QofeY",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? "campustriage.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? "campustriage",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? "campustriage.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "830411425008",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? "1:830411425008:web:d4b0acccf56cbb2c90ae35",
};

// Prevent re-initialization during hot-module reload in development
const app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db   = getFirestore(app);

export { app, auth, db };
