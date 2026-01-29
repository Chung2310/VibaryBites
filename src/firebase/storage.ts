'use client';

import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    FirebaseStorage,
} from "firebase/storage";
import { initializeFirebaseClient } from "@/firebase";

// This is a helper function to ensure we have a storage instance.
function getStorageInstance(): FirebaseStorage {
    return initializeFirebaseClient().storage;
}

/**
 * Uploads a file to Firebase Storage using a robust method with a timeout.
 * This version uses the full observer API of uploadBytesResumable for better control.
 * @param file The file to upload.
 * @param path The destination path/folder in the storage bucket (e.g., 'products').
 * @returns A promise that resolves with the public download URL.
 * @throws An error if the upload fails or times out.
 */
export function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const storage = getStorageInstance();
  const uniqueFilename = `${path}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const storageRef = ref(storage, uniqueFilename);

  // Wrap the entire upload task in a new Promise to have full control over resolve/reject
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Set a timeout that will reject the promise if the upload takes too long
    const timeoutId = setTimeout(() => {
      // It's important to cancel the upload task to free up resources
      uploadTask.cancel(); 
      reject(new Error('Upload timed out after 120 seconds. Please check your network connection and try again.'));
    }, 120000); // 120-second timeout

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // This observer is called for progress updates. We don't need to act on it,
        // but it's required for the 'error' and 'complete' observers to function.
        // You could add progress bar logic here if needed.
      },
      (error) => {
        // This is the error handler for the upload task.
        clearTimeout(timeoutId); // We got an error, so clear the timeout.
        console.error("Firebase Storage Upload Error:", error);

        let errorMessage = `Failed to upload image. Please check permissions and network.`;
        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = 'Permission denied. You do not have permission to upload files.';
            break;
          case 'storage/canceled':
            // This can happen from our timeout, so we might not want to show this exact message.
            // The timeout will throw its own, more specific error.
            errorMessage = 'Upload was canceled.';
            break;
          case 'storage/unknown':
            errorMessage = 'An unknown error occurred during upload.';
            break;
        }
        // Reject the promise with a user-friendly error.
        reject(new Error(errorMessage));
      },
      () => {
        // This is the success handler. It runs when the upload is complete.
        clearTimeout(timeoutId); // Upload finished, so clear the timeout.

        // Now that the upload is done, get the download URL.
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            // Resolve the promise with the final URL.
            resolve(downloadURL);
          })
          .catch((error) => {
            // This is a less likely error, but possible if getting the URL fails.
            console.error("Error getting download URL:", error);
            reject(new Error("Upload succeeded, but failed to get download URL."));
          });
      }
    );
  });
}


/**
 * Deletes an image from Firebase Storage using the client-side SDK.
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  // Don't try to delete invalid or placeholder URLs
  if (!imageUrl || imageUrl.includes('placehold.co') || !imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
    return;
  }

  try {
    const storage = getStorageInstance();
    const imageRef = ref(storage, imageUrl);
    
    await deleteObject(imageRef);

  } catch (error: any) {
     // It's okay if the object doesn't exist (e.g., already deleted).
     // We log other errors but don't throw, as failing to delete an old image
     // shouldn't block the user's main action (like updating a product).
    if (error.code !== 'storage/object-not-found') {
        console.warn("Client-side deleteImage error (non-blocking):", error);
    }
  }
}
