'use strict';
const { MongoClient } = require('mongodb');

const port = process.env.PORT || '3009';
if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
  console.error('PORT must be an integer between 1 and 65535.');
  process.exit(1);
}
process.env.PORT = port;
process.env.HOSTNAME = '0.0.0.0';

async function setupDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[entrypoint] MONGODB_URI not set, skipping DB setup.');
    return;
  }

  const username = process.env.MONGODB_USER || '';
  const password = process.env.MONGODB_PASSWORD || '';
  const options = {
    maxPoolSize: 3,
    serverSelectionTimeoutMS: 10000,
    authSource: process.env.MONGODB_AUTH_SOURCE || 'admin',
    ...(username && password ? { auth: { username, password } } : {}),
  };

  // Retry voi MongoDB chua san sang (container khoi dong cham)
  let client;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      client = new MongoClient(uri, options);
      await client.connect();
      break;
    } catch (err) {
      console.warn(`[entrypoint] MongoDB not ready (attempt ${attempt}/10): ${err.message}`);
      if (attempt === 10) throw err;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  try {
    const db = client.db();

    // Tao collections neu chua co
    const collectionNames = ['cakes', 'categories', 'news_articles', 'birthday_cake_sizes', 'ingredients', 'customers', 'orders', 'admin_users', 'admin_sessions', 'admin_login_attempts'];
    for (const name of collectionNames) {
      if (!(await db.listCollections({ name }).hasNext())) {
        await db.createCollection(name);
        console.log(`[entrypoint] Created collection: ${name}`);
      }
    }

    // Tao indexes cho cac collection chinh (khop voi setup-db.ts)
    // admin_* indexes do ensureAuthIndexes() trong app xu ly khi dang nhap lan dau
    await db.collection('cakes').createIndex({ slug: 1 }, { unique: true });
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('news_articles').createIndex({ slug: 1 }, { unique: true });
    await db.collection('cakes').createIndex({ categorySlug: 1, _id: 1 });
    await db.collection('news_articles').createIndex({ publicationDate: -1 });
    await db.collection('orders').createIndex({ orderDate: -1 });
    await db.collection('orders').createIndex({ customerId: 1 });

    console.log('[entrypoint] MongoDB collections and indexes are ready.');

    // Tao admin account tu env neu chua co
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminUsername && adminPassword) {
      const existing = await db.collection('admin_users').findOne({ role: 'admin' });
      if (!existing) {
        const { createHash } = require('crypto');
        // Dung bcrypt neu co, fallback sang sha256 (Next.js server se dung bcrypt chinh xac)
        // O day chi can kiem tra xem da co admin chua, viec tao se do Next.js initializeAdminFromEnv xu ly
        console.log('[entrypoint] No admin found - will be created on first login via ADMIN_USERNAME/ADMIN_PASSWORD env vars.');
      } else {
        console.log('[entrypoint] Admin account already exists.');
      }
    } else {
      console.log('[entrypoint] ADMIN_USERNAME/ADMIN_PASSWORD not set, skipping admin init.');
    }
  } finally {
    await client.close();
  }
}

setupDb()
  .then(() => {
    require('../server.js');
  })
  .catch(err => {
    console.error('[entrypoint] DB setup failed, starting server anyway:', err.message);
    require('../server.js');
  });
