
'use client';

import { getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a Promise that resolves with the authenticated user, or rejects if no user is signed in.
 * This ensures that auth state is confirmed before proceeding with auth-required operations.
 */
const getAuthenticatedUser = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    try {
        const auth = getAuth(getApp());
        const unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            unsubscribe(); // Stop listening after the first result
            if (user) {
              resolve(user);
            } else {
              reject(new Error("User is not authenticated."));
            }
          },
          (error) => {
            unsubscribe(); // Stop listening on error
            reject(error);
          }
        );
    } catch (error) {
        reject(new Error("Firebase app not initialized or auth service unavailable."));
    }
  });
};


/**
 * Uploads an image file to Firebase Storage after ensuring the user is authenticated.
 * @param file The image file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  
  try {
    await getAuthenticatedUser(); // Explicitly wait for an authenticated user
    
    const storage = getStorage(getApp());

    const fileExtension = file.name.split('.').pop();
    const fileName = `uploads/${uuidv4()}.${fileExtension}`; 
    const storageRef = ref(storage, fileName);

    const metadata = { contentType: file.type };
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Firebase Storage Upload Error:", error);
    // Re-throw a more user-friendly error.
    throw new Error(`Image upload failed: ${(error as Error).message}`);
  }
};

/**
 * Deletes an image from Firebase Storage using its public URL after ensuring the user is authenticated.
 * @param imageUrl The public download URL of the image to delete.
 * @returns A promise that resolves when the image is deleted.
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) {
    console.warn("No image URL provided for deletion.");
    return;
  }
  
  try {
    await getAuthenticatedUser(); // Explicitly wait for an authenticated user

    const storage = getStorage(getApp());
    const storageRef = ref(storage, imageUrl);

    await deleteObject(storageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      // This is not a critical failure, just a warning.
      console.warn(`Attempted to delete an image that does not exist: ${imageUrl}`);
    } else {
      console.error("Firebase Storage Deletion Error:", error);
      // Re-throw other errors for the calling component to handle.
      throw new Error(`Image deletion failed: ${(error as Error).message}`);
    }
  }
};
