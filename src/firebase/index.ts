'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase App, Firestore, and Auth.
 * Returns null for services if the configuration is invalid to prevent app crashes.
 */
export function initializeFirebase(): {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
} {
  try {
    // Check if configuration is valid
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
      console.warn('Firebase API Key is missing. Please check your .env file or Firebase configuration.');
      return { app: null, firestore: null, auth: null };
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);

    return { app, firestore, auth };
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return { app: null, firestore: null, auth: null };
  }
}

export * from './provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
