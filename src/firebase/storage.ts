'use client';

import { 
    getDownloadURL, 
    ref, 
    uploadBytesResumable, 
    deleteObject,
    type FirebaseStorage
} from "firebase/storage";

/**
 * Uploads an image to Firebase Storage using the client-side SDK.
 * @param storage The FirebaseStorage instance.
 * @param file The file to upload.
 * @param path The destination path in the storage bucket (e.g., 'products').
 * @returns A promise that resolves with the public download URL.
 */
export async function uploadImage(storage: FirebaseStorage, file: File, path: string): Promise<string> {
    const storageRef = ref(storage, `${path}/${Date.now()}-${file.name.replace(/\s/g, '_')}`);
    
    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        const timeoutId = setTimeout(() => {
            uploadTask.cancel();
            reject(new Error('Upload timed out after 120 seconds. Please check your network connection and try again.'));
        }, 120000);

        uploadTask.on('state_changed',
            (snapshot) => {
                // Optional: handle progress updates
            },
            (error) => {
                clearTimeout(timeoutId);
                console.error("Firebase Storage Upload Error: ", error);
                switch (error.code) {
                    case 'storage/unauthorized':
                        reject(new Error('Permission denied. You might need to sign in or check security rules.'));
                        break;
                    case 'storage/canceled':
                        reject(new Error('Upload was canceled.'));
                        break;
                    case 'storage/unknown':
                    default:
                        reject(new Error('An unknown error occurred during upload. Please try again.'));
                        break;
                }
            },
            async () => {
                clearTimeout(timeoutId);
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    console.error("Error getting download URL: ", error);
                    reject(new Error('Upload successful, but failed to get the download URL.'));
                }
            }
        );
    });
}

/**
 * Deletes an image from Firebase Storage.
 * @param storage The FirebaseStorage instance.
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImage(storage: FirebaseStorage, imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
        console.warn(`Skipping delete for non-Firebase URL: ${imageUrl}`);
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
