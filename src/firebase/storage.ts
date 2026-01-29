
'use client';

import {
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage.
 * @param storage The FirebaseStorage instance.
 * @param file The file to upload.
 * @param path The destination path in the storage bucket (e.g., 'products', 'news_images').
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadImage(storage: FirebaseStorage, file: File, path: string): Promise<string> {
  if (!file) throw new Error("No file provided to upload.");
  
  const uniqueFilename = `${path}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const storageRef = ref(storage, uniqueFilename);

  // 'uploadBytes' completes the upload and returns a snapshot
  await uploadBytes(storageRef, file);

  // Get the public URL for the file
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

/**
 * Deletes an image from Firebase Storage.
 * @param storage The FirebaseStorage instance.
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImage(storage: FirebaseStorage, imageUrl: string): Promise<void> {
  if (!imageUrl || imageUrl.includes('placehold.co') || !imageUrl.includes('firebasestorage.googleapis.com')) {
    // Don't try to delete placeholders or non-firebase URLs
    return;
  }
  
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    // It's okay if the object doesn't exist (e.g., already deleted).
    // Log other errors but don't throw, as deletion is not a critical blocking operation.
    if (error.code !== 'storage/object-not-found') {
      console.error("Error deleting image from storage:", error);
    }
  }
}
