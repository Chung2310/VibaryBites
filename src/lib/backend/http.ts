import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MongoServerError } from 'mongodb';
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function readJson(request: Request) {
  const text = await request.text();
  if (Buffer.byteLength(text) > 1024 * 1024) throw new HttpError(413, 'Dữ liệu quá lớn.');
  try { return JSON.parse(text); }
  catch { throw new HttpError(400, 'JSON không hợp lệ.'); }
}
export function apiError(error: unknown, operation = 'request') {
  if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof z.ZodError) return NextResponse.json({ error: 'Dữ liệu không hợp lệ.', details: error.flatten() }, { status: 400 });
  if (error instanceof MongoServerError && error.code === 11000) return NextResponse.json({ error: 'Mã hoặc đường dẫn đã tồn tại.' }, { status: 409 });
  console.error('Backend request failed:', { operation, name: error instanceof Error ? error.name : 'UnknownError', ...(error instanceof MongoServerError ? { code: error.code, codeName: error.codeName } : {}) });
  return NextResponse.json({ error: 'Dịch vụ dữ liệu chưa sẵn sàng. Vui lòng thử lại sau.' }, { status: 503 });
}
