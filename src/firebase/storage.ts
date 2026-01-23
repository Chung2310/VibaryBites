'use client';

import { getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

/**
 * Awaits the definitive authentication state.
 * @returns A promise that resolves with the authenticated User object.
 * @rejects If the user is not authenticated.
 */
const getAuthenticatedUser = (): Promise<User> => {
  const auth = getAuth(getApp());
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe(); // Unsubscribe after the first state change
        if (user) {
          resolve(user);
        } else {
          reject(new Error("User not authenticated."));
        }
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
};

/**
 * Uploads an image file to Firebase Storage.
 * It ensures the user is authenticated before proceeding.
 * @param file The image file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  
  try {
    await getAuthenticatedUser(); // This ensures we have a valid, authenticated user.
    
    const storage = getStorage(getApp());

    const fileExtension = file.name.split('.').pop();
    const fileName = `uploads/${uuidv4()}.${fileExtension}`; 
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("--- Firebase Storage Upload Error ---", error);
    // Re-throw for the calling component to handle.
    // This will now include auth errors from getAuthenticatedUser.
    throw error;
  }
};

/**
 * Deletes an image from Firebase Storage using its public URL.
 * It ensures the user is authenticated before proceeding.
 * @param imageUrl The public download URL of the image to delete.
 * @returns A promise that resolves when the image is deleted.
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) {
    console.warn("No image URL provided for deletion.");
    return;
  }
  
  try {
    await getAuthenticatedUser(); // Ensures user is authenticated.
    
    const storage = getStorage(getApp());
    const storageRef = ref(storage, imageUrl);

    await deleteObject(storageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn(`Attempted to delete an image that does not exist: ${imageUrl}`);
      // Do not re-throw for this specific case, it's not a critical failure.
    } else {
      console.error("Error deleting image from Firebase Storage:", error);
      // Re-throw other errors (including auth errors)
      throw error;
    }
  }
};
