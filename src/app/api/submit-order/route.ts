
import { NextResponse } from 'next/server';

// The original Google Apps Script URL is now stored on the server-side.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby1OG0fhORLrMGqcdUgujK08PY3nalyWZQzkir4U1c70_5M4E2Ac99CbreIatAMBgzu0Q/exec';

/**
 * This is a server-side API route that acts as a proxy.
 * It receives a request from the client, forwards it to the external Google Apps Script,
 * and then sends the script's response back to the client.
 * This avoids CORS errors in the browser because the cross-origin request
 * is made from server-to-server.
 */
export async function POST(request: Request) {
  try {
    // 1. Get the form data from the client's request.
    const formData = await request.json();
    
    // Prepend a single quote to the phone number to force Google Sheets to treat it as a string.
    if (formData.phone) {
        formData.phone = `'${formData.phone}`;
    }

    // 2. Re-create the payload in the format the Google Script expects (URLSearchParams).
    const payload = new URLSearchParams();
    for (const key in formData) {
        if (Object.prototype.hasOwnProperty.call(formData, key)) {
            payload.append(key, formData[key]);
        }
    }

    // 3. Make the fetch request from the server to the Google Script.
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: payload,
    });

    // 4. Handle the response from the Google Script.
    // We can't just check response.ok because Google Scripts often redirect,
    // which fetch handles gracefully, but the final response needs to be checked.
    const responseData = await response.json();

    // 5. Forward the script's result back to the client.
    if (responseData.result === 'success') {
        return NextResponse.json({ result: 'success' }, { status: 200 });
    } else {
        // Forward the specific error from the script.
        return NextResponse.json({ error: responseData.error || 'Unknown error from Google Script' }, { status: 400 });
    }

  } catch (error) {
    console.error('API route proxy error:', error);
    return NextResponse.json({ error: (error as Error).message || 'An internal server error occurred.' }, { status: 500 });
  }
}
