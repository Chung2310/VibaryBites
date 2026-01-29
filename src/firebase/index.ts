import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Export a function to initialize and get Firebase services
export function initializeFirebaseClient() {
    let firebaseApp: FirebaseApp;

    if (getApps().length === 0) {
        firebaseApp = initializeApp(firebaseConfig);
    } else {
        firebaseApp = getApp();
    }

    const auth: Auth = getAuth(firebaseApp);
    const firestore: Firestore = getFirestore(firebaseApp);
    const storage: FirebaseStorage = getStorage(firebaseApp);

    return { firebaseApp, auth, firestore, storage };
}


// Re-export everything else
export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
