'use client';

import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads an image file by proxying through the app's backend API.
 * This avoids direct client-side uploads and associated CORS issues.
 * @param file The image file to upload.
 * @param onProgress Optional callback to report upload progress. It's simulated for this implementation.
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const formData = new FormData();
  formData.append('file', file);

  // Simulate initial progress
  onProgress?.(10);

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });
  
  // Simulate completion progress
  onProgress?.(100);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to upload image. The server returned an invalid response.' }));
    throw new Error(errorData.error || 'Server responded with an error during upload.');
  }

  const { imageUrl } = await response.json();
  if (!imageUrl) {
    throw new Error('API did not return an image URL.');
  }

  return imageUrl;
};

/**
 * Deletes an image from Firebase Storage by proxying through the app's backend API.
 * @param imageUrl The public download URL of the image to delete.
 * @returns A promise that resolves when the image is deleted.
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) {
    console.warn("No image URL provided for deletion.");
    return;
  }
  
  // Only proxy deletion for Google Storage URLs. Other URLs (placeholders) can be ignored.
  if (!imageUrl.includes('storage.googleapis.com')) {
    console.log(`Skipping deletion for non-storage URL: ${imageUrl}`);
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
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete image.' }));
      // We log the error but don't re-throw, as a failed deletion isn't critical for UI flow.
      console.error(errorData.error || 'Server responded with an error during deletion.');
    }
    
  } catch (error) {
    console.error("Delete proxy error:", error);
    // A failed delete is not a critical user-facing error, so we don't re-throw.
  }
};
