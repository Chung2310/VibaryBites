'use client';

/**
 * Converts an image file to a Data URL.
 * This is a workaround for environments where direct cloud storage uploads fail.
 * The Data URL can be stored in Firestore and rendered directly by browsers.
 * NOTE: This is not efficient for production. It increases Firestore document size.
 *
 * @param file The image file to convert.
 * @param onProgress Optional callback to report progress (will be 0 or 100).
 * @returns A promise that resolves with the Data URL of the image.
 */
export const uploadImage = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (!file) {
    return Promise.reject(new Error('No file provided.'));
  }

  onProgress?.(50); // Simulate progress

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onProgress?.(100);
        resolve(dataUrl);
      } else {
        reject(new Error('Failed to read file as Data URL.'));
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('An error occurred while reading the file.'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * This is a no-op function to match the previous API.
 * Since images are stored as Data URLs in Firestore, there is no separate file
 * in cloud storage to delete. The data is deleted when the Firestore document is deleted.
 *
 * @param imageUrl The Data URL of the image (ignored).
 * @returns A promise that resolves immediately.
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  // No operation needed as the image is a data URL within the Firestore document.
  if (imageUrl?.startsWith('data:image')) {
    console.log('Skipping deletion for Data URL image.');
  } else {
    console.log(`Skipping deletion for image URL: ${imageUrl}. Deletion is now a no-op.`);
  }
  return Promise.resolve();
};
