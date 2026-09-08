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
  let stage = 'validate';
  try {
    requireSameOrigin(request);
    const { username, password } = schema.parse(await readJson(request));
    stage = 'indexes';
    await ensureAuthIndexes();
    stage = 'rate-limit';
    await checkLoginRate(username);
    stage = 'initialize-admin';
    if (await initializeAdminFromEnv() === 'not-configured') throw new HttpError(503, 'Chưa cấu hình tài khoản quản trị ban đầu.');
    stage = 'find-account';
    const account = await (await getDb()).collection<AdminAccount>('admin_users').findOne({ username });
    stage = 'verify-password';
    dummyHash ||= hashPassword('unused-account-timing-placeholder');
    const valid = await verifyPassword(password, account?.passwordHash || await dummyHash);
    if (!account || !valid || account.disabled || account.role !== 'admin') throw new HttpError(401, 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    stage = 'create-session';
    const token = await createSession(account._id);
    stage = 'revoke-session';
    await revokeSession(request);
    const response = NextResponse.json({ user: publicUser(account) }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(request));
    return response;
  } catch (error) { return apiError(error, 'auth/login:' + stage); }
}
