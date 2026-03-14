'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Surfacing contextual errors for the agent/developer to see
      toast({
        variant: 'destructive',
        title: 'Security Rules Error',
        description: `Operation "${error.context.operation}" denied at "${error.context.path}". Check your Firestore security rules.`,
      });
      
      // We throw a delayed error to surface it to the Next.js error overlay in dev
      if (process.env.NODE_ENV === 'development') {
         console.error('Firestore Security Rule Denied:', error.context);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
