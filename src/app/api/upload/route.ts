import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import type { NextRequest } from 'next/server';

// Initialize Google Cloud Storage
// It will try to infer project ID and credentials from the environment.
const storage = new Storage();
const bucketName = "gen-lang-client-0850828234.appspot.com"; // Manually specify bucket name
const bucket = storage.bucket(bucketName);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    
    if (!path) {
        return NextResponse.json({ error: 'No path provided.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Create a unique filename
    const uniqueFilename = `${path}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;

    const blob = bucket.file(uniqueFilename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.type,
    });

    // Pipe the buffer to the stream
    await new Promise((resolve, reject) => {
      blobStream.on('finish', () => resolve(true));
      blobStream.on('error', (err) => {
          console.error("GCS Stream Error:", err);
          // Pass the original error from the GCS library to be caught below.
          reject(err);
      });
      blobStream.end(buffer);
    });

    // IMPORTANT: Make the file public before returning the URL
    await blob.makePublic();

    // The public URL for the file.
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    return NextResponse.json({ imageUrl: publicUrl });
  } catch (error) {
    console.error('Upload API Route Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: 'Server failed to upload file.', details: errorMessage }, { status: 500 });
  }
}
