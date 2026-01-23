
'use client';

import { getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads an image file to Firebase Storage.
 * @param file The image file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  
  try {
    const storage = getStorage(getApp());

    const fileExtension = file.name.split('.').pop();
    const fileName = `uploads/${uuidv4()}.${fileExtension}`; 
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
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
 * @param imageUrl The public download URL of the image to delete.
 * @returns A promise that resolves when the image is deleted.
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) {
    console.warn("No image URL provided for deletion.");
    return;
  }
  
  try {
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
