import { NextResponse } from 'next/server';
import { getDb } from '@/lib/backend/mongodb';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await (await getDb()).command({ ping: 1 });
    return NextResponse.json({ status: 'ok', database: 'connected' });
  } catch {
    return NextResponse.json({ status: 'unavailable', database: 'disconnected' }, { status: 503 });
  }
}
