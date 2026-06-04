// ─── useAuth — Firebase Authentication state hook ────────────────────────────
// Wraps onAuthStateChanged so any component can read the current Firebase user.
// Returns { firebaseUser, authLoading } where firebaseUser is null when signed out.

import { useState, useEffect } from "react";
import { onAuthStateChanged }   from "firebase/auth";
import { auth }                 from "../firebase";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = still loading
  const [authLoading, setAuthLoading]   = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user ?? null);
      setAuthLoading(false);
    });
    return unsub; // cleanup listener on unmount
  }, []);

  return { firebaseUser, authLoading };
}
