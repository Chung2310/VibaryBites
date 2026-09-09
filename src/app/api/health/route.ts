import { NextResponse } from 'next/server';
import { getDb } from '@/lib/backend/mongodb';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
let lastPingTime = 0;
let lastPingResult = false;
const PING_CACHE_TTL_MS = 30_000;

export async function GET() {
  const now = Date.now();
  if (lastPingResult && now - lastPingTime < PING_CACHE_TTL_MS) {
    return NextResponse.json({ status: 'ok', database: 'connected' });
  }

  try {
    await (await getDb()).command({ ping: 1 });
    lastPingResult = true;
    lastPingTime = now;
    return NextResponse.json({ status: 'ok', database: 'connected' });
  } catch {
    lastPingResult = false;
    lastPingTime = 0;
    return NextResponse.json({ status: 'unavailable', database: 'disconnected' }, { status: 503 });
  }
}
