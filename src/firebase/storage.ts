'use client';

/**
 * Uploads a file by proxying through a server-side API route.
 * @param file The file to upload.
 * @param path The destination path/folder in the storage bucket (e.g., 'products').
 * @returns A promise that resolves with the public download URL.
 * @throws An error if the upload fails.
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);

  // Set a timeout for the fetch request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to parse the error response from the server
      const errorBody = await response.json().catch(() => ({ 
        error: `Server responded with status: ${response.status}` 
      }));
      throw new Error(errorBody.details || errorBody.error || `Upload failed. Server responded with ${response.status}`);
    }

    const { imageUrl } = await response.json();
    if (!imageUrl) {
      throw new Error('Upload successful, but the server did not return an image URL.');
    }

    return imageUrl;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out after 120 seconds. Please check your network connection and try again.');
    }
    // Re-throw other errors
    throw error;
  }
}


/**
 * Deletes an image by proxying through a server-side API route.
 * This is a "fire-and-forget" operation from the client's perspective.
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl || imageUrl.includes('placehold.co')) {
    return;
  }

  try {
    // We don't await this, because we don't want to block the UI
    // on a non-critical cleanup task. The server will handle it.
    fetch('/api/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
      keepalive: true, // Helps ensure the request is sent even if the page is closing
    });
  } catch (error) {
    // Log the error but don't re-throw to avoid interrupting the user flow.
    console.warn('Client-side deleteImage call failed to dispatch (non-blocking):', error);
  }
}
