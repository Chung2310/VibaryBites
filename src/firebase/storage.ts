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
 * This function is wrapped in a Promise with a timeout to prevent hangs.
 * @param storage The FirebaseStorage instance.
 * @param path The destination path in the storage bucket (e.g., 'products').
 * @param file The file to upload.
 * @returns A promise that resolves with the public download URL.
 */
export async function uploadImage(storage: FirebaseStorage, path: string, file: File): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const storageRef = ref(storage, `${path}/${Date.now()}-${file.name.replace(/\s/g, '_')}`);
        
        // Set a timeout for the entire operation.
        const timeoutId = setTimeout(() => {
            reject(new Error("Upload timed out after 30 seconds. Please check your network connection and try again."));
        }, 30000); // 30 seconds

        try {
            const snapshot = await uploadBytes(storageRef, file);
            clearTimeout(timeoutId); // Clear timeout on successful upload
            const downloadURL = await getDownloadURL(snapshot.ref);
            resolve(downloadURL);
        } catch (error: any) {
            clearTimeout(timeoutId); // Clear timeout on failure
            console.error("Firebase Storage Upload Error: ", error);
            // Create a user-friendly error message
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
                        message = 'An unknown storage error occurred. Your network connection might be unstable.';
                        break;
                    default:
                        message = `Storage error: ${error.code}. Please contact support.`;
                }
            }
            reject(new Error(message));
        }
    });
}


/**
 * Deletes an image from Firebase Storage.
 * This function is wrapped in a Promise with a timeout.
 * @param storage The FirebaseStorage instance.
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImage(storage: FirebaseStorage, imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
        console.log(`Skipping deletion for non-Firebase URL: ${imageUrl}`);
        return Promise.resolve(); // Return a resolved promise for non-storage URLs
    }

    return new Promise(async (resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error("Delete operation timed out after 15 seconds."));
        }, 15000); // 15 seconds

        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
            clearTimeout(timeoutId);
            console.log(`Successfully deleted image: ${imageUrl}`);
            resolve();
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.code === 'storage/object-not-found') {
                console.warn(`File not found, assumed already deleted: ${imageUrl}`);
                resolve(); // Not a true error, resolve successfully.
            } else {
                console.error(`Failed to delete image ${imageUrl}:`, error);
                reject(new Error(`Failed to delete old image. Error: ${error.code || 'Unknown'}`));
            }
        }
    });
}
