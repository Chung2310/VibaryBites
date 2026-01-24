import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// This is secure because this code only runs on the server.
// The App Hosting environment provides default credentials.
const storage = new Storage();
const bucketName = 'gen-lang-client-0850828234.appspot.com';
const bucket = storage.bucket(bucketName);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `uploads/${uuidv4()}.${fileExtension}`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.type,
    });

    const fileBuffer = await file.arrayBuffer();

    await new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('Blob stream error:', err);
        reject(err);
      });
      blobStream.on('finish', () => {
        resolve(true);
      });
      blobStream.end(Buffer.from(fileBuffer));
    });

    // Make the file public to get a predictable URL
    await blob.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    return NextResponse.json({ imageUrl: publicUrl });
  } catch (error) {
    console.error('Upload API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Upload failed: ${errorMessage}` }, { status: 500 });
  }
}
