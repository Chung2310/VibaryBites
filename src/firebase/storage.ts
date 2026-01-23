'use client';

import { getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads an image file to Firebase Storage.
 * It internally gets the default Firebase App and its Auth/Storage services
 * to ensure consistency.
 * @param file The image file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  
  const app = getApp();
  const auth = getAuth(app);
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.error("Upload Error: User not authenticated. Cannot upload image.");
    throw new Error("User not authenticated. Cannot upload image.");
  }

  const storage = getStorage(app);

  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `uploads/${uuidv4()}.${fileExtension}`; 
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("--- Firebase Storage Upload Error ---");
    console.error("Error Code:", (error as any).code);
    console.error("Error Message:", (error as any).message);
    console.error("Full Error Object:", error);
    // Re-throw for the calling component to handle
    throw error;
  }
};

/**
 * Deletes an image from Firebase Storage using its public URL.
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
  const currentUser = auth.currentUser;

  if (!currentUser) {
      console.error("Delete Error: User not authenticated.");
      throw new Error("User not authenticated. Cannot delete image.");
  }
  
  const storage = getStorage(app);

  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn(`Attempted to delete an image that does not exist: ${imageUrl}`);
    } else {
      console.error("Error deleting image from Firebase Storage:", error);
      throw error;
    }
  }
};
