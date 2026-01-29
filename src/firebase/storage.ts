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
 * @param file The file to upload.
 * @param path The destination path/folder in the storage bucket (e.g., 'products').
 * @returns A promise that resolves with the public download URL.
 * @throws An error if the upload fails or times out.
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
    const storage = getStorageInstance();
    const uniqueFilename = `${path}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const storageRef = ref(storage, uniqueFilename);

    // The core upload operation, which resolves with the download URL on success.
    const uploadPromise = uploadBytesResumable(storageRef, file)
        .then(snapshot => getDownloadURL(snapshot.ref));

    // A timeout promise that rejects after 120 seconds.
    const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Upload timed out after 120 seconds. Please check your network connection and try again.')), 120000)
    );

    // Use Promise.race to compete the upload against the timeout.
    try {
        const downloadURL = await Promise.race([uploadPromise, timeoutPromise]);
        return downloadURL;
    } catch (error: any) {
        console.error("Client-side uploadImage error:", error);

        // Create a more user-friendly error message.
        let errorMessage = `Failed to upload image. Please check permissions and network.`;
        if (error.message && error.message.includes('timed out')) {
            errorMessage = error.message;
        } else if (error.code) {
             switch (error.code) {
                case 'storage/unauthorized':
                    errorMessage = 'Permission denied. You do not have permission to upload files.';
                    break;
                case 'storage/canceled':
                    errorMessage = 'Upload was canceled.';
                    break;
                case 'storage/unknown':
                    errorMessage = 'An unknown error occurred during upload.';
                    break;
            }
        }
       
        // Re-throw a new, clean error to be caught by the calling form submission logic.
        throw new Error(errorMessage);
    }
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
