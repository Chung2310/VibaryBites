'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebaseClient } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // useMemo ensures this function is called only once on the client
  const { firebaseApp, auth, firestore, storage } = useMemo(() => initializeFirebaseClient(), []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
      storage={storage}
    >
      {children}
    </FirebaseProvider>
  );
}