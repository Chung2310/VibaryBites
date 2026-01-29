
/**
 * Uploads a file to the server via the `/api/upload` endpoint.
 * @param file The file to upload.
 * @param path The destination path in the storage bucket (e.g., 'products', 'news').
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Gracefully handle non-json responses
        throw new Error(errorData.details || `Server error: ${response.statusText}`);
    }

    const { imageUrl } = await response.json();
    if (!imageUrl) {
        throw new Error('API did not return an image URL.');
    }
    
    return imageUrl;
}

/**
 * Requests deletion of a file via the `/api/delete-image` endpoint.
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteFile(imageUrl: string): Promise<void> {
    if (!imageUrl || imageUrl.includes('placehold.co') || imageUrl.startsWith('blob:')) {
        return; // Don't try to delete placeholders or blob URLs
    }
    
    const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // We don't need to throw an error for deletion failures,
        // as it's not a critical blocking operation. Just log it.
        console.error('Failed to delete image:', errorData.details || response.statusText);
    }
}
