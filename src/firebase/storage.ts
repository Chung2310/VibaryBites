'use client';

const MAX_IMAGE_DIMENSION = 1200; // Max width/height of 1200px

/**
 * Converts an image file to a resized PNG Data URL.
 * This helps to keep file sizes reasonable while preserving transparency.
 *
 * @param file The image file to convert.
 * @param onProgress Optional callback to report progress.
 * @returns A promise that resolves with the Data URL of the resized image.
 */
export const uploadImage = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (!file) {
    return Promise.reject(new Error('No file provided.'));
  }
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('File is not an image.'));
  }

  onProgress?.(10); // Initial progress

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        onProgress?.(30);

        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_IMAGE_DIMENSION) {
            height *= MAX_IMAGE_DIMENSION / width;
            width = MAX_IMAGE_DIMENSION;
          }
        } else {
          if (height > MAX_IMAGE_DIMENSION) {
            width *= MAX_IMAGE_DIMENSION / height;
            height = MAX_IMAGE_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Failed to get canvas context.'));
        }
        
        onProgress?.(60);
        ctx.drawImage(img, 0, 0, width, height);

        // Get the data URL from the canvas as a PNG to preserve transparency
        const dataUrl = canvas.toDataURL('image/png');
        onProgress?.(100);

        resolve(dataUrl);
      };

      img.onerror = (error) => {
        console.error('Image loading error:', error);
        reject(new Error('Failed to load image for resizing.'));
      };

      // Start loading the image
      img.src = e.target?.result as string;
      onProgress?.(20);
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
    // console.log('Skipping deletion for Data URL image.');
  } else {
    // console.log(`Skipping deletion for image URL: ${imageUrl}. Deletion is now a no-op.`);
  }
  return Promise.resolve();
};
