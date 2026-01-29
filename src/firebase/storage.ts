'use client';

/**
 * This function acts as a client-side wrapper to upload a file.
 * It sends the file to our own Next.js API route (`/api/upload`),
 * which then acts as a trusted server to upload the file to Google Cloud Storage.
 * This proxy approach is more reliable in environments where direct client-to-storage
 * uploads might fail due to network or authentication complexities.
 *
 * @param file The file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!file) throw new Error("No file provided to upload.");

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.details || `Server error during upload: ${response.statusText}`);
  }

  const { imageUrl } = await response.json();
  if (!imageUrl) {
    throw new Error("API did not return an image URL.");
  }

  return imageUrl;
}


/**
 * Deletes an image from Firebase Storage via a proxy API.
 * For this project, this is a no-op as a secure deletion API is not implemented.
 * 
 * @param imageUrl The public URL of the image to delete.
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl || !imageUrl.includes('storage.googleapis.com')) {
    // Don't try to delete placeholders or non-GCS URLs
    return Promise.resolve();
  }
  
  // In a real production app, you would make a POST request to a secure `/api/delete-image` route
  // that verifies the user's permissions before deleting the object from the bucket.
  // For this project, we will skip implementing the delete proxy for simplicity.
  console.log(`Skipping deletion for: ${imageUrl}. A delete proxy API would be needed for this in production.`);
  
  return Promise.resolve();
}
