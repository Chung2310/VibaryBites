'use client';

import { getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from 'firebase/auth';

/**
 * Uploads an image file to Firebase Storage.
 * Authentication is enforced by Firebase Storage Security Rules.
 * @param file The image file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const app = getApp();
  const auth = getAuth(app);
  if (!auth.currentUser) {
    console.error("Firebase Storage Upload Error: User not authenticated.");
    throw new Error("You must be logged in to upload images. Please refresh and try again.");
  }
  
  try {
    const storage = getStorage(app);

    const fileExtension = file.name.split('.').pop();
    const fileName = `uploads/${uuidv4()}.${fileExtension}`; 
    const storageRef = ref(storage, fileName);

    const contentType = file.type || 'application/octet-stream';
    const metadata = { contentType };
    
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
 * Deletes an image from Firebase Storage using its public URL.
 * Authentication is enforced by Firebase Storage Security Rules.
 * @param imageUrl The public download URL of the image to delete.
 * @returns A promise that resolves when the image is deleted.
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) {
    console.warn("No image URL provided for deletion.");
    return;
  }
  
  const app = getApp();
  const auth = getAuth(app);
  if (!auth.currentUser) {
    console.error("Firebase Storage Deletion Error: User not authenticated.");
    throw new Error("You must be logged in to delete images.");
  }

  try {
    const storage = getStorage(app);
    // Create a reference from the HTTPS URL
    const storageRef = ref(storage, imageUrl);

    await deleteObject(storageRef);
  } catch (error: any) {
    // It's common to try to delete a non-existent file, so we'll just warn.
    if (error.code === 'storage/object-not-found') {
      console.warn(`Attempted to delete an image that does not exist: ${imageUrl}`);
    } else {
      console.error("Firebase Storage Deletion Error:", error);
      // Re-throw other errors for the calling component to handle.
      throw new Error(`Image deletion failed: ${(error as Error).message}`);
    }
  }
};
