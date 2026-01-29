
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

let firebaseApp: FirebaseApp;

// This logic is to prevent reinitializing the app on hot reloads
if (!getApps().length) {
    try {
        // Attempt to initialize via Firebase App Hosting environment variables
        firebaseApp = initializeApp();
    } catch (e) {
        // Fallback to local config
        firebaseApp = initializeApp(firebaseConfig);
    }
} else {
    // If already initialized, use the existing app
    firebaseApp = getApp();
}

const auth: Auth = getAuth(firebaseApp);
const firestore: Firestore = getFirestore(firebaseApp);
const storage: FirebaseStorage = getStorage(firebaseApp);

export { firebaseApp, auth, firestore, storage };

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
