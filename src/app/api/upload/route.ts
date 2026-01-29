import { NextResponse } from 'next/server';

/**
 * @deprecated This API route is no longer in use. Image uploads are now handled directly on the client.
 */
export async function POST(request: Request) {
    return NextResponse.json({ 
        error: 'This API route is deprecated.', 
        details: 'Image uploads are now handled directly on the client via the Firebase Storage SDK.' 
    }, { status: 410 }); // 410 Gone
}
