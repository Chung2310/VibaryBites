'use client';

import { 
    getDownloadURL, 
    ref, 
    uploadBytes,
    deleteObject,
    type FirebaseStorage
} from "firebase/storage";

/**
 * Uploads an image to Firebase Storage. This function is designed to be robust and not hang.
 * It uses the simpler `uploadBytes` method and is wrapped in a Promise with a timeout.
 * @param storage The FirebaseStorage instance.
 * @param file The file to upload.
 * @param path The destination path in the storage bucket (e.g., 'products').
 * @returns A promise that resolves with the public download URL.
 */
export async function uploadImage(storage: FirebaseStorage, file: File, path: string): Promise<string> {
    const storageRef = ref(storage, `${path}/${Date.now()}-${file.name.replace(/\s/g, '_')}`);
    
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error: any) {
        console.error("Firebase Storage Upload Error: ", error);
        let message = 'An unknown error occurred during upload. Please try again.';
        if (error.code === 'storage/unauthorized') {
            message = 'Permission denied. You might need to sign in or check security rules.';
        }
        // Re-throw a more user-friendly error to be caught by the form handler
        throw new Error(message);
    }
}


/**
 * Deletes an image from Firebase Storage.
 * @param storage The FirebaseStorage instance.
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImage(storage: FirebaseStorage, imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
        // Silently ignore non-firebase URLs (like placeholders)
        return;
    }

    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
    } catch (error: any) {
        // It's okay if the object doesn't exist, maybe it was already deleted.
        if (error.code === 'storage/object-not-found') {
            console.warn(`File not found, assumed already deleted: ${imageUrl}`);
            return;
        }
        // Log other errors but don't re-throw to avoid interrupting the user flow.
        console.error('Client-side deleteImage call failed:', error);
    }
}
