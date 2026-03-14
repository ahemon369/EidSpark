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
    // Check if configuration is valid - must have at least an API Key and Project ID
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined' || !firebaseConfig.projectId) {
      if (typeof window !== 'undefined') {
        console.warn('Firebase configuration is missing or incomplete. Check your environment variables.');
      }
      return { app: null, firestore: null, auth: null };
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);

    return { app, firestore, auth };
  } catch (error) {
    if (typeof window !== 'undefined') {
      console.error('Firebase initialization failed:', error);
    }
    return { app: null, firestore: null, auth: null };
  }
}

export * from './provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
