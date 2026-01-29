import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { firebaseConfig } from '@/firebase/config';

// Initialize Google Cloud Storage
// This will automatically use the service account credentials available in the
// App Hosting environment.
const storage = new Storage();
const bucket = storage.bucket(firebaseConfig.storageBucket);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a unique filename
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const blob = bucket.file(uniqueFilename);

    // Create a writable stream and upload the buffer
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.type,
      },
    });

    // Handle stream events
    await new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('Blob stream error:', err);
        reject(new Error('Could not upload file.'));
      });

      blobStream.on('finish', () => {
        resolve(true);
      });

      blobStream.end(buffer);
    });

    // Make the file public and get the URL
    await blob.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    return NextResponse.json({ imageUrl: publicUrl });

  } catch (error) {
    console.error('Upload API error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: 'Failed to upload file.', details: message }, { status: 500 });
  }
}
