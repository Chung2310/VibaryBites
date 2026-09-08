import { NextResponse } from 'next/server';
import { z } from 'zod';
import { usernameSchema } from '@/lib/auth/username';
import { getDb } from '@/lib/backend/mongodb';
import { apiError, HttpError, readJson } from '@/lib/backend/http';
import { initializeAdminFromEnv, ensureAuthIndexes, type AdminAccount } from '@/lib/backend/admin-accounts';
import { verifyPassword, hashPassword } from '@/lib/backend/password';
import { requireSameOrigin, checkLoginRate, createSession, revokeSession, publicUser, SESSION_COOKIE, sessionCookieOptions } from '@/lib/backend/auth';
export const runtime = 'nodejs';
const schema = z.object({ username: usernameSchema, password: z.string().min(1).max(128) }).strict();
let dummyHash: Promise<string> | undefined;
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const { username, password } = schema.parse(await readJson(request));
    await ensureAuthIndexes();
    await checkLoginRate(username);
    if (await initializeAdminFromEnv() === 'not-configured') throw new HttpError(503, 'Chưa cấu hình tài khoản quản trị ban đầu.');
    const account = await (await getDb()).collection<AdminAccount>('admin_users').findOne({ username });
    dummyHash ||= hashPassword('unused-account-timing-placeholder');
    const valid = await verifyPassword(password, account?.passwordHash || await dummyHash);
    if (!account || !valid || account.disabled || account.role !== 'admin') throw new HttpError(401, 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    const token = await createSession(account._id);
    await revokeSession(request);
    const response = NextResponse.json({ user: publicUser(account) }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(request));
    return response;
  } catch (error) { return apiError(error); }
}
