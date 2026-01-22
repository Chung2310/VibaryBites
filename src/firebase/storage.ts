'use client';

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from 'firebase/auth';

// Initialize Firebase and get storage instance.
// We get the firebaseApp instance here, which is a singleton.
const { firebaseApp } = initializeFirebase();
const storage = getStorage(firebaseApp);

/**
 * Uploads an image file to Firebase Storage.
 * @param file The image file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  
  // Get a fresh auth instance right before the operation.
  // This ensures we have the most up-to-date user status.
  const auth = getAuth(firebaseApp);
  const currentUser = auth.currentUser;

  if (!currentUser) {
      throw new Error("User not authenticated. Cannot upload image.");
  }

  // Force refresh the user's ID token to prevent issues with stale tokens.
  await currentUser.getIdToken(true);

  // Create a unique filename using UUID to avoid overwrites
  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  
  // Create a storage reference
  const storageRef = ref(storage, `products/${fileName}`);

  try {
    // Upload the file to the specified reference
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the public download URL for the file
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image to Firebase Storage:", error);
    // Re-throw the error to be handled by the calling function
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
  
  // Also get a fresh auth instance here for consistency.
  const auth = getAuth(firebaseApp);
  const currentUser = auth.currentUser;

  if (!currentUser) {
      throw new Error("User not authenticated. Cannot delete image.");
  }

  try {
    // Create a reference from the HTTPS URL
    const storageRef = ref(storage, imageUrl);
    
    // Delete the file
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
