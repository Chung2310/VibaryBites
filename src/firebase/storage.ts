'use client';

import { 
    getDownloadURL, 
    ref, 
    uploadBytes,
    deleteObject,
    type FirebaseStorage
} from "firebase/storage";

/**
 * Uploads an image to Firebase Storage using the simpler uploadBytes method.
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
        if (error.code) {
            switch (error.code) {
                case 'storage/unauthorized':
                    message = 'Permission denied. Please check your storage security rules.';
                    break;
                case 'storage/canceled':
                    message = 'Upload was canceled.';
                    break;
                case 'storage/unknown':
                    message = 'An unknown storage error occurred.';
                    break;
                default:
                    message = `Storage error: ${error.code}`;
            }
        }
        // Re-throw a more specific error to be caught by the background handler
        throw new Error(message);
    }
}


/**
 * Deletes an image from Firebase Storage. This is a fire-and-forget operation from the UI's perspective.
 * @param storage The FirebaseStorage instance.
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImage(storage: FirebaseStorage, imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
        // Silently ignore non-firebase URLs (like placeholders)
        console.log(`Skipping deletion for non-Firebase URL: ${imageUrl}`);
        return;
    }

    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        console.log(`Successfully deleted image: ${imageUrl}`);
    } catch (error: any) {
        // It's okay if the object doesn't exist, maybe it was already deleted.
        if (error.code === 'storage/object-not-found') {
            console.warn(`File not found, assumed already deleted: ${imageUrl}`);
            return;
        }
        // Log other errors but don't re-throw, as this is a background task.
        console.error(`Failed to delete image ${imageUrl}:`, error);
        // We don't throw here to prevent unhandled promise rejections in the background.
        // The user has already moved on.
    }
}
