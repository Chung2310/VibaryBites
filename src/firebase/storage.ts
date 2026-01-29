'use client';

import {
  FirebaseStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  ref as refFromUrl_,
  getStorage,
} from 'firebase/storage';
import { getApp } from 'firebase/app';


/**
 * Gets the Firebase Storage instance, ensuring the app is initialized.
 * @returns The FirebaseStorage instance.
 */
function getStorageInstance(): FirebaseStorage {
    const app = getApp(); // Throws an error if Firebase is not initialized
    return getStorage(app);
}

const refFromURL = refFromUrl_;

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * Uses uploadBytesResumable, includes a timeout, and gets the storage instance internally.
 * @param file The file to upload.
 * @param path The path in the storage bucket (e.g., 'products/').
 * @returns A promise that resolves with the download URL or rejects with an error.
 */
export function uploadImage(
  file: File,
  path: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storage = getStorageInstance();
    if (!file) {
      return reject(new Error('No file provided to upload.'));
    }
    
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    const timeoutId = setTimeout(() => {
        uploadTask.cancel();
        reject(new Error('Upload timed out after 60 seconds. Please check your network connection and try again.'));
    }, 60000); // 60-second timeout

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      }, 
      (error) => {
        clearTimeout(timeoutId); // Clear timeout on error
        console.error("Firebase Storage Upload Error:", error);
        switch (error.code) {
          case 'storage/unauthorized':
            reject(new Error("Permission denied. Check storage security rules and user authentication."));
            break;
          case 'storage/canceled':
            // The timeout rejection is already handled.
            // We don't want to show a generic "canceled" message if it was our timeout that caused it.
            break;
          case 'storage/unknown':
             reject(new Error("An unknown error occurred on the Firebase Storage server."));
            break;
          default:
            reject(error);
        }
      }, 
      () => {
        clearTimeout(timeoutId); // Clear timeout on success
        getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
      }
    );
  });
}

/**
 * Deletes an image from Firebase Storage based on its URL.
 * It ignores placeholder URLs and gets the storage instance internally.
 * @param imageUrl The URL of the image to delete.
 */
export async function deleteImage(
  imageUrl: string
): Promise<void> {
  // Don't try to delete placeholders
  if (!imageUrl || imageUrl.includes('placehold.co')) {
    return;
  }
  
  if (imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.includes('storage.googleapis.com')) {
    try {
      const storage = getStorageInstance();
      const imageRef = refFromURL(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
      if (error.code !== 'storage/object-not-found') {
        console.error("Error deleting image from storage: ", error);
        // Do not re-throw, as failing to delete an old image shouldn't block the user.
      }
    }
  }
}
