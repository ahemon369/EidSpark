'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [instances, setInstances] = useState<{
    app: FirebaseApp | null;
    firestore: Firestore | null;
    auth: Auth | null;
  } | null>(null);

  useEffect(() => {
    const { app, firestore, auth } = initializeFirebase();
    setInstances({ app, firestore, auth });
  }, []);

  // Allow the app to render even if Firebase failed to initialize, 
  // hooks will handle null instances gracefully.
  if (!instances) return null;

  return (
    <FirebaseProvider
      app={instances.app as any}
      firestore={instances.firestore as any}
      auth={instances.auth as any}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
