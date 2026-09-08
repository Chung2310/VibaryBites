import type { MongoClientOptions } from 'mongodb';

// Shared by the server and setup script; call only in the server environment.
export function getMongoConfig(env: Record<string, string | undefined> = process.env) {
  const uri = env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');
  const username = env.MONGODB_USER || '';
  const password = env.MONGODB_PASSWORD || '';
  if (Boolean(username) !== Boolean(password)) {
    throw new Error('Set both MONGODB_USER and MONGODB_PASSWORD, or leave both empty.');
  }
  const options: MongoClientOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    authSource: env.MONGODB_AUTH_SOURCE || 'admin',
    ...(username ? { auth: { username, password } } : {}),
  };
  return { uri, options };
}
