'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'

export function initializeFirebase() {
  let app: FirebaseApp;
  let auth: Auth | null = null;
  let firestore: Firestore | null = null;

  try {
    if (!getApps().length) {
      try {
        app = initializeApp();
      } catch (e) {
        app = initializeApp(firebaseConfig);
      }
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    firestore = getFirestore(app);

    return {
      firebaseApp: app,
      auth,
      firestore
    };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return {
      firebaseApp: null,
      auth: null,
      firestore: null
    };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
