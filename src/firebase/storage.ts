'use client';

import { 
    getDownloadURL, 
    ref, 
    uploadBytes,
    deleteObject,
    type FirebaseStorage,
} from "firebase/storage";

/**
 * A robust function to upload a file to Firebase Storage.
 * It uses the native async/await pattern with the Firebase SDK for clarity and reliability.
 * @param storage The FirebaseStorage instance.
 * @param path The destination path in the storage bucket (e.g., 'products').
 * @param file The file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadImage(
    storage: FirebaseStorage, 
    path: string, 
    file: File
): Promise<string> {
    try {
        const storageRef = ref(storage, `${path}/${Date.now()}-${file.name.replace(/\s/g, '_')}`);
        
        // uploadBytes returns a promise that resolves with the upload result.
        const snapshot = await uploadBytes(storageRef, file);
        
        // getDownloadURL also returns a promise.
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
    } catch (error: any) {
        console.error("Firebase Storage Upload Error: ", error);
        
        let message = 'An unknown error occurred during upload.';
        switch (error.code) {
            case 'storage/unauthorized':
                message = 'Permission denied. Please check your storage security rules.';
                break;
            case 'storage/canceled':
                message = 'Upload was canceled by the user.';
                break;
            case 'storage/unknown':
                message = 'An unknown storage error occurred. Your network connection might be unstable.';
                break;
            default:
                message = `Storage error: ${error.code || 'Unknown'}. Please contact support.`;
        }
        // Re-throw a more user-friendly error to be caught by the calling function's try-catch block.
        throw new Error(message);
    }
}

/**
 * Deletes an image from Firebase Storage using a direct async/await pattern.
 * @param storage The FirebaseStorage instance.
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImage(storage: FirebaseStorage, imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
        console.log(`Skipping deletion for non-Firebase URL: ${imageUrl}`);
        return;
    }

    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        console.log(`Successfully deleted image: ${imageUrl}`);
    } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
            // This is not a failure case for the user, so we can silently resolve.
            console.warn(`File not found, assumed already deleted: ${imageUrl}`);
            return; 
        } else {
            // For all other errors, we should inform the calling function.
            console.error(`Failed to delete image ${imageUrl}:`, error);
            throw new Error(`Failed to delete old image. Error: ${error.code || 'Unknown'}`);
        }
    }
}
