'use client';

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  FirebaseStorage,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const MAX_IMAGE_DIMENSION = 1200; // A good balance for quality and size

const resizeImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

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
        if (!ctx) return reject(new Error('Failed to get canvas context.'));
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP for better compression
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Canvas to Blob conversion failed.'));
            resolve(blob);
          },
          'image/webp',
          0.85 // Quality setting for WebP
        );
      };
      img.onerror = (err) => reject(err);
      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('FileReader did not produce a result.'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const uploadImage = (
  storage: FirebaseStorage,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (!storage) {
      return reject(new Error('Firebase Storage instance was not provided.'));
    }
    if (!file) {
      return reject(new Error('No file provided.'));
    }
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image.'));
    }

    try {
      const imageBlob = await resizeImage(file);
      const fileName = `images/${uuidv4()}.webp`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, imageBlob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
        }
      );
    } catch (error) {
      console.error('Error during image processing or upload:', error);
      reject(error);
    }
  });
};

export const deleteImage = async (storage: FirebaseStorage, imageUrl: string): Promise<void> => {
  if (!storage) {
    console.warn('Firebase Storage instance not provided, skipping deletion.');
    return;
  }
  if (!imageUrl || !(imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.includes('storage.googleapis.com'))) {
    // Not a Firebase Storage URL, likely a placeholder or data URI, so do nothing.
    return;
  }

  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn(`Image not found for deletion, but proceeding: ${imageUrl}`);
    } else {
      console.error(`Error deleting image ${imageUrl}:`, error);
      throw error;
    }
  }
};