'use client';

import {
  FirebaseStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  ref as refFromUrl_,
} from 'firebase/storage';

const refFromURL = refFromUrl_;

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * Uses uploadBytesResumable for better error handling and to avoid hangs.
 * @param storage The FirebaseStorage instance.
 * @param file The file to upload.
 * @param path The path in the storage bucket (e.g., 'products/').
 * @returns A promise that resolves with the download URL or rejects with an error.
 */
export function uploadImage(
  storage: FirebaseStorage,
  file: File,
  path: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided to upload.'));
    }
    
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        // You can use this to report progress, but for now, we'll just log it.
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      }, 
      (error) => {
        // Handle unsuccessful uploads
        console.error("Firebase Storage Upload Error:", error);
        switch (error.code) {
          case 'storage/unauthorized':
            reject(new Error("Permission denied. Check storage security rules and user authentication."));
            break;
          case 'storage/canceled':
            reject(new Error("Upload was canceled."));
            break;
          case 'storage/unknown':
             reject(new Error("An unknown error occurred on the Firebase Storage server."));
            break;
          default:
            reject(error);
        }
      }, 
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
      }
    );
  });
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
