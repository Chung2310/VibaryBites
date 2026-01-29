
'use client';

/**
 * Uploads a file by proxying the request through a server-side API route.
 * This avoids client-side CORS issues with Firebase Storage.
 * @param file The file to upload.
 * @param path The destination path/folder in the storage bucket (e.g., 'products').
 * @returns A promise that resolves with the public download URL.
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const responseData = await response.json();

        if (!response.ok) {
            // Use the detailed error message from the server if available
            throw new Error(responseData.details || responseData.error || `Upload failed with status: ${response.status}`);
        }

        if (!responseData.imageUrl) {
            throw new Error('Server response did not include an image URL.');
        }
        
        return responseData.imageUrl;

    } catch (error) {
        console.error("Client-side uploadImage error:", error);
        // Re-throw the error so the calling component can catch it and show a toast
        throw error;
    }
}

/**
 * Deletes an image by proxying the request through a server-side API route.
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  // Don't try to call the API for invalid or placeholder URLs
  if (!imageUrl || imageUrl.includes('placehold.co')) {
    return;
  }

  try {
    const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        // Log the error but don't throw, as failing to delete an old image
        // shouldn't block the user's main action (like updating a product).
        console.error(`Failed to delete image: ${errorData.error || response.statusText}`);
    }
  } catch (error) {
     console.error("Client-side deleteImage error:", error);
  }
}
