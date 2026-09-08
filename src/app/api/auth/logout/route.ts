import { NextResponse } from 'next/server';
import { apiError } from '@/lib/backend/http';
import { revokeSession, requireSameOrigin, SESSION_COOKIE, sessionCookieOptions } from '@/lib/backend/auth';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    await revokeSession(request);
    const response = NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(request), maxAge: 0 });
    return response;
  } catch (error) { return apiError(error); }
}
