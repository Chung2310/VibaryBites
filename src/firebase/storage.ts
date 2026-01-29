'use client';

import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject,
    FirebaseStorage
} from "firebase/storage";
import { initializeFirebaseClient } from "@/firebase";

// This is a helper function to ensure we have a storage instance.
function getStorageInstance(): FirebaseStorage {
    return initializeFirebaseClient().storage;
}

/**
 * Uploads a file to Firebase Storage using the client-side SDK.
 * @param file The file to upload.
 * @param path The destination path/folder in the storage bucket (e.g., 'products').
 * @returns A promise that resolves with the public download URL.
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
    try {
        const storage = getStorageInstance();
        const uniqueFilename = `${path}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const storageRef = ref(storage, uniqueFilename);

        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;

    } catch (error) {
        console.error("Client-side uploadImage error:", error);
        // Re-throw a more user-friendly error to be caught by the calling component
        throw new Error(`Failed to upload image. Please check permissions and network. Original error: ${(error as Error).message}`);
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
        console.error("Client-side deleteImage error:", error);
    }
  }
}
