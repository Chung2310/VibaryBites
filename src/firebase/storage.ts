
'use client';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase and get storage instance
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
