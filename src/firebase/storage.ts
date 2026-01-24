'use client';

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  FirebaseStorage,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { getApp } from 'firebase/app';

// This function assumes the Firebase app has already been initialized elsewhere.
const getStorageInstance = (): FirebaseStorage => {
  try {
    const app = getApp();
    return getStorage(app);
  } catch (e) {
    console.error("Firebase app not initialized. Make sure FirebaseClientProvider is set up correctly.");
    throw new Error("Firebase not initialized for storage operations.");
  }
};

/**
 * Uploads an image file using the client-side Firebase Storage SDK.
 * This function is designed to be called from client components.
 *
 * @param file The image file to upload.
 * @param onProgress Optional callback to report upload progress (a number from 0 to 100).
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadImage = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (!file) {
    return Promise.reject(new Error('No file provided for upload.'));
  }

  const storage = getStorageInstance();
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filePath = `uploads/${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, filePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Report progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error('Client-side upload failed:', error);
        switch (error.code) {
          case 'storage/unauthorized':
            reject(new Error('Permission denied. You might need to be logged in to upload files.'));
            break;
          case 'storage/canceled':
            // User canceled the upload
            break; // Don't reject, just let it be silent
          default:
            reject(new Error('An unknown error occurred during upload. Please check storage rules.'));
            break;
        }
      },
      async () => {
        // Handle successful uploads on complete
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (e) {
          console.error('Could not get download URL:', e);
          reject(new Error('Upload succeeded, but failed to get the download URL.'));
        }
      }
    );
  });
};

/**
 * Deletes an image from Firebase Storage using the client-side SDK.
 *
 * @param imageUrl The public HTTPS download URL of the image to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  // Only attempt to delete URLs that point to Firebase Storage.
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
    console.log(`Skipping deletion for non-Firebase Storage URL: ${imageUrl}`);
    return;
  }

  try {
    const storage = getStorageInstance();
    // Create a reference from the HTTPS URL. This is a feature of the client SDK.
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    // A common error is trying to delete a file that doesn't exist.
    // We can safely ignore this, as the end result (the file is not there) is the same.
    if (error.code === 'storage/object-not-found') {
      console.warn(`Attempted to delete an image that does not exist: ${imageUrl}`);
    } else {
      // For other errors, log them but don't re-throw. A failed delete is often
      // not a critical UI-blocking error.
      console.error('Client-side delete failed:', error);
    }
  }
};
