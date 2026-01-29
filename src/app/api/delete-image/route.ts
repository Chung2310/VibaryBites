
import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { firebaseConfig } from '@/firebase/config';
import type { NextRequest } from 'next/server';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: firebaseConfig.projectId,
});

const bucketName = firebaseConfig.storageBucket;

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'No image URL provided.' }, { status: 400 });
    }

    // Don't try to delete placeholders
    if (imageUrl.includes('placehold.co')) {
      return NextResponse.json({ message: 'Skipped placeholder image.' });
    }
    
    // Check if the URL is a GCS URL and parse the filename
    const gcsUrlPattern = `https://storage.googleapis.com/${bucketName}/`;
    if (!imageUrl.startsWith(gcsUrlPattern)) {
      console.warn(`Attempted to delete non-GCS URL: ${imageUrl}`);
      // Silently succeed as it's not a file we can manage.
      return NextResponse.json({ message: 'URL is not a direct GCS URL, skipped.' });
    }
    
    const fileName = imageUrl.substring(gcsUrlPattern.length);
    if (!fileName) {
        return NextResponse.json({ error: 'Could not parse filename from URL.' }, { status: 400 });
    }

    await storage.bucket(bucketName).file(fileName).delete();

    return NextResponse.json({ success: true, message: `Deleted ${fileName}` });
  } catch (error: any) {
    // It's okay if the object doesn't exist, maybe it was already deleted.
    if (error.code === 404) {
        return NextResponse.json({ success: true, message: 'File not found, assumed already deleted.' });
    }
    console.error('Delete API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: 'Failed to delete file.', details: errorMessage }, { status: 500 });
  }
}
