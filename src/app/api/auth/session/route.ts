import { NextResponse } from 'next/server';
import { apiError } from '@/lib/backend/http';
import { getSessionUser, publicUser } from '@/lib/backend/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    return NextResponse.json({ user: user?.role === 'admin' ? publicUser(user) : null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiError(error); }
}
