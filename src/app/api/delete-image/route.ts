import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucketName = 'gen-lang-client-0850828234.appspot.com';
const bucket = storage.bucket(bucketName);

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl || !imageUrl.startsWith(`https://storage.googleapis.com/${bucketName}/`)) {
      return NextResponse.json({ error: 'Invalid image URL provided.' }, { status: 400 });
    }
    
    // Extract the file path from the URL
    // e.g., https://storage.googleapis.com/bucket-name/uploads/file.jpg -> uploads/file.jpg
    const filePath = decodeURIComponent(imageUrl.substring(`https://storage.googleapis.com/${bucketName}/`.length));
    
    await bucket.file(filePath).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete API error:', error);
    // It's common to try to delete a non-existent file, so we can be lenient.
    if (error.code === 404) {
        console.warn(`Attempted to delete an image that does not exist: ${ (await request.json()).imageUrl }`);
        return NextResponse.json({ success: true, message: 'File not found, but considered successful.' });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Delete failed: ${errorMessage}` }, { status: 500 });
  }
}
