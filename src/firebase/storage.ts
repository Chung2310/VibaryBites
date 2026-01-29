'use client';

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getApp } from "firebase/app";

/**
 * Uploads a file to Firebase Storage using the client-side SDK.
 * This function runs on the client and leverages the authenticated user's session.
 *
 * @param file The file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadImage(file: File): Promise<string> {
    if (!file) throw new Error("No file provided to upload.");

    try {
        const app = getApp();
        const storage = getStorage(app);
        
        // Create a unique filename in the 'images/' folder
        const uniqueFilename = `images/${Date.now()}-${file.name.replace(/[^\w.\-]/g, '_')}`;
        const storageRef = ref(storage, uniqueFilename);

        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get the public URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;

    } catch (error: any) {
        console.error("Client-side upload failed:", error);
        
        if (error.code === 'storage/unauthorized') {
            throw new Error("Permission denied. You must be logged in to upload files.");
        }
        
        throw new Error("File upload failed. Please check your network connection and try again.");
    }
}


/**
 * Deletes an image from Firebase Storage using its public URL.
 *
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
    // Don't try to delete placeholders or non-GCS URLs
    console.log(`Skipping deletion for non-Firebase URL: ${imageUrl}`);
    return Promise.resolve();
  }

  const app = getApp();
  const storage = getStorage(app);

  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    // It's okay if the object doesn't exist, we can ignore that error.
    if (error.code === 'storage/object-not-found') {
      console.warn(`Image not found in storage, skipping deletion: ${imageUrl}`);
    } else {
      // For other errors, we log them but don't throw, as deletion is a non-critical cleanup.
      console.error(`Failed to delete image from storage: ${imageUrl}`, error);
    }
  }
}
