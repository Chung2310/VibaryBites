'use client';

import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    FirebaseStorage,
    UploadTask,
} from "firebase/storage";
import { initializeFirebaseClient } from "@/firebase";

// This is a helper function to ensure we have a storage instance.
function getStorageInstance(): FirebaseStorage {
    return initializeFirebaseClient().storage;
}

/**
 * Uploads a file to Firebase Storage using the resumable API for better control and timeout handling.
 * @param file The file to upload.
 * @param path The destination path/folder in the storage bucket (e.g., 'products').
 * @returns A promise that resolves with the public download URL.
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
    const storage = getStorageInstance();
    const uniqueFilename = `${path}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const storageRef = ref(storage, uniqueFilename);

    return new Promise((resolve, reject) => {
        const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

        // Set a 60-second timeout for the upload
        const timeoutId = setTimeout(() => {
            uploadTask.cancel();
            reject(new Error('Upload timed out after 60 seconds. Please check your network connection and try again.'));
        }, 60000); // 60-second timeout

        uploadTask.on('state_changed',
            (snapshot) => {
                // Optional: handle progress updates here
            },
            (error) => {
                // Handle unsuccessful uploads
                clearTimeout(timeoutId); // Clear the timeout
                console.error("Client-side uploadImage error:", error);

                let errorMessage = `Failed to upload image. Please check permissions and network.`;
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
                reject(new Error(errorMessage));
            },
            () => {
                // Handle successful uploads on complete
                clearTimeout(timeoutId); // Clear the timeout
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                }).catch(error => {
                    // This is unlikely but possible if getting the URL fails
                    console.error("Failed to get download URL:", error);
                    reject(new Error('Upload successful, but failed to get download URL.'));
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
