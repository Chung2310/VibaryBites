'use client';

import { 
    getDownloadURL, 
    ref, 
    uploadBytesResumable, // Using this for its observers
    deleteObject,
    type FirebaseStorage,
    type UploadTask
} from "firebase/storage";

/**
 * A robust function to upload a file to Firebase Storage with progress, timeout, and proper error handling.
 * It is wrapped in a Promise that guarantees resolution or rejection.
 * @param storage The FirebaseStorage instance.
 * @param path The destination path in the storage bucket (e.g., 'products').
 * @param file The file to upload.
 * @param progressCallback An optional callback to report upload progress (0-100).
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadImage(
    storage: FirebaseStorage, 
    path: string, 
    file: File,
    progressCallback?: (progress: number) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `${path}/${Date.now()}-${file.name.replace(/\s/g, '_')}`);
        const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

        // Set a timeout for the entire operation.
        const timeoutId = setTimeout(() => {
            uploadTask.cancel(); // Cancel the upload if it's still running
            reject(new Error("Upload timed out after 120 seconds. Please check your network connection and try again."));
        }, 120000); // 120 seconds

        uploadTask.on('state_changed',
            (snapshot) => {
                // Progress observer
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (progressCallback) {
                    progressCallback(progress);
                }
            },
            (error) => {
                // Error observer
                clearTimeout(timeoutId); // Clear the timeout as we have an error
                console.error("Firebase Storage Upload Error: ", error);
                
                let message = 'An unknown error occurred during upload.';
                switch (error.code) {
                    case 'storage/unauthorized':
                        message = 'Permission denied. Please check your storage security rules.';
                        break;
                    case 'storage/canceled':
                        message = 'Upload was canceled by the user or due to a timeout.';
                        break;
                    case 'storage/unknown':
                        message = 'An unknown storage error occurred. Your network connection might be unstable.';
                        break;
                    default:
                        message = `Storage error: ${error.code}. Please contact support.`;
                }
                reject(new Error(message));
            },
            async () => {
                // Completion observer
                clearTimeout(timeoutId); // Clear the timeout as the upload is complete
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (getUrlError) {
                    console.error("Error getting download URL: ", getUrlError);
                    reject(new Error("Upload succeeded, but failed to get download URL."));
                }
            }
        );
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
