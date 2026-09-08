import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { getDb } from './mongodb';
import { HttpError } from './http';
import type { AdminAccount } from './admin-accounts';
import type { AdminUser } from '../auth/types';
export const SESSION_COOKIE = 'vibary_admin_session';
export const SESSION_SECONDS = 12 * 60 * 60;
export type AdminSession = { _id: string; userId: string; expiresAt: Date };
export const sessionHash = (token: string) => createHash('sha256').update(token).digest('hex');
export function getSessionToken(request: Request) {
  const value = request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(SESSION_COOKIE + '='))?.slice(SESSION_COOKIE.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : undefined;
}
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) throw new HttpError(403, 'Nguồn yêu cầu không hợp lệ.');

  // FE va BE cung chay tren 1 cong nen origin luon trung voi host cua server.
  // So sanh voi APP_ORIGIN neu co, nguoc lai dung Host header (hoat dong dung ca khi chay sau reverse proxy).
  const expected = process.env.APP_ORIGIN
    ?? (() => {
        const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
        const proto = request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.replace(':', '');
        return host ? `${proto}://${host}` : new URL(request.url).origin;
      })();

  if (origin !== new URL(expected).origin) throw new HttpError(403, 'Nguồn yêu cầu không hợp lệ.');
}
const sessionUserCache = new Map<string, { user: AdminAccount | null; expiresAt: number }>();
const SESSION_CACHE_TTL_MS = 30_000;

export function publicUser(user: AdminAccount): AdminUser {
  return { id: user._id, username: user.username, displayName: user.displayName };
}
export async function getSessionUser(request: Request) {
  const token = getSessionToken(request);
  if (!token) return null;
  const hash = sessionHash(token);
  const now = Date.now();
  const cached = sessionUserCache.get(hash);
  if (cached && cached.expiresAt > now) return cached.user;

  const db = await getDb();
  const session = await db.collection<AdminSession>('admin_sessions').findOne({ _id: hash, expiresAt: { $gt: new Date() } });
  if (!session) {
    sessionUserCache.delete(hash);
    return null;
  }
  const user = await db.collection<AdminAccount>('admin_users').findOne({ _id: session.userId, disabled: false });
  if (sessionUserCache.size > 200) {
    const oldestKey = sessionUserCache.keys().next().value;
    if (oldestKey) sessionUserCache.delete(oldestKey);
  }
  sessionUserCache.set(hash, { user, expiresAt: now + SESSION_CACHE_TTL_MS });
  return user;
}
export async function requireAdmin(request: Request) {
  const user = await getSessionUser(request);
  if (!user) throw new HttpError(401, 'Vui lòng đăng nhập.');
  if (user.role !== 'admin') throw new HttpError(403, 'Tài khoản không có quyền quản trị.');
  if (!['GET', 'HEAD'].includes(request.method)) requireSameOrigin(request);
  return publicUser(user);
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  await (await getDb()).collection<AdminSession>('admin_sessions').insertOne({ _id: sessionHash(token), userId, expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000) });
  return token;
}
export async function revokeSession(request: Request) {
  const token = getSessionToken(request);
  if (token) {
    const hash = sessionHash(token);
    sessionUserCache.delete(hash);
    await (await getDb()).collection<AdminSession>('admin_sessions').deleteOne({ _id: hash });
  }
}
export function sessionCookieOptions(request: Request) {
  return { httpOnly: true, secure: new URL(process.env.APP_ORIGIN || request.url).protocol === 'https:', sameSite: 'lax' as const, path: '/', maxAge: SESSION_SECONDS };
}
export async function checkLoginRate(username: string) {
  const bucket = Math.floor(Date.now() / (15 * 60 * 1000));
  const limits = (await getDb()).collection<{ _id: string; count: number; expiresAt: Date }>('admin_login_attempts');
  for (const [key, limit] of [[sessionHash(username), 10], ['global', 200]] as const) {
    const attempt = await limits.findOneAndUpdate({ _id: `${key}:${bucket}` }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 1) * 15 * 60 * 1000) } }, { upsert: true, returnDocument: 'after' });
    if (!attempt || attempt.count > limit) throw new HttpError(429, 'Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút.');
  }
}
