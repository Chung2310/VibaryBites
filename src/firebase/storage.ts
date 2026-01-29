'use client';

import {
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { ref as refFromUrl_ } from 'firebase/storage';

// In the Firebase JS SDK, the function to get a reference from a URL is named `ref`.
// To avoid a name collision with the `ref` function used for creating a new reference,
// we import it with an alias.
const refFromURL = refFromUrl_;


/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * @param storage The FirebaseStorage instance.
 * @param file The file to upload.
 * @param path The path in the storage bucket (e.g., 'products/').
 * @returns A promise that resolves with the download URL.
 */
export async function uploadImage(
  storage: FirebaseStorage,
  file: File,
  path: string
): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${path}${fileName}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

/**
 * Deletes an image from Firebase Storage based on its URL.
 * It ignores placeholder URLs.
 * @param storage The FirebaseStorage instance.
 * @param imageUrl The URL of the image to delete.
 */
export async function deleteImage(
  storage: FirebaseStorage,
  imageUrl: string
): Promise<void> {
  // Don't try to delete placeholders
  if (!imageUrl || imageUrl.includes('placehold.co')) {
    return;
  }
  
  // Only try to delete if it's a Firebase Storage URL
  if (imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.includes('storage.googleapis.com')) {
    try {
      const imageRef = refFromURL(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
      // It's possible the file doesn't exist, so we can ignore "object-not-found" errors.
      if (error.code !== 'storage/object-not-found') {
        console.error("Error deleting image from storage: ", error);
        // Optionally re-throw if you want to handle it further up
        // throw error;
      }
    }
  }
}
