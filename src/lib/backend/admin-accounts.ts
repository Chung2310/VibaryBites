import 'server-only';
import { z } from 'zod';
import { getDb } from './mongodb';
import { hashPassword } from './password';
import { usernameSchema } from '../auth/username';
export type AdminAccount = { _id: string; username: string; displayName: string; passwordHash: string; role: 'admin' | 'user'; disabled: boolean; createdAt: Date };
export async function ensureAuthIndexes() {
  const db = await getDb();
  const users = db.collection('admin_users');
  await users.createIndex({ username: 1 }, { unique: true, partialFilterExpression: { username: { $type: 'string' } } });
  const oldIndex = (await users.indexes()).find(index => index.name === 'email_1' && index.key.email === 1 && Object.keys(index.key).length === 1);
  if (oldIndex) {
    try { await users.dropIndex('email_1'); }
    catch (error) { if ((error as { code?: number }).code !== 27) throw error; }
  }
  await db.collection('admin_sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection('admin_login_attempts').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}
// Existing accounts keep their password. Only the legacy initial account gains a username from env.
export async function initializeAdminFromEnv() {
  const users = (await getDb()).collection<AdminAccount>('admin_users');
  const existing = await users.findOne({ role: 'admin' });
  if (existing) {
    if (existing._id === 'initial-admin' && !existing.username) {
      if (!process.env.ADMIN_USERNAME) return 'not-configured' as const;
      const username = usernameSchema.parse(process.env.ADMIN_USERNAME);
      await ensureAuthIndexes();
      await users.updateOne({ _id: existing._id, username: { $exists: false } }, { $set: { username } });
      return 'migrated' as const;
    }
    return 'exists' as const;
  }
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return 'not-configured' as const;
  const username = usernameSchema.parse(process.env.ADMIN_USERNAME);
  const password = z.string().min(12).max(128).parse(process.env.ADMIN_PASSWORD);
  const displayName = z.string().trim().min(1).max(100).parse(process.env.ADMIN_NAME || 'Quản trị viên');
  await ensureAuthIndexes();
  const account: AdminAccount = { _id: 'initial-admin', username, displayName, passwordHash: await hashPassword(password), role: 'admin', disabled: false, createdAt: new Date() };
  const result = await users.updateOne({ _id: account._id }, { $setOnInsert: account }, { upsert: true });
  return result.upsertedCount ? 'created' as const : 'exists' as const;
}
