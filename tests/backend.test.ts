import { ensureAuthIndexes, type AdminAccount } from '../src/lib/backend/admin-accounts';
import { sessionHash, type AdminSession } from '../src/lib/backend/auth';
﻿import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { POST } from '../src/app/api/submit-order/route';
import { GET, PUT, PATCH, DELETE } from '../src/app/api/data/[resource]/[[...id]]/route';
import { getDb, getMongoClient } from '../src/lib/backend/mongodb';
import { changeOrderStatus } from '../src/lib/backend/orders';
import { getMongoConfig } from '../src/lib/backend/mongodb-config';
import { MongoClient } from 'mongodb';
import { checkoutSchema, resourceSchemas } from '../src/lib/backend/schemas';
let replica: MongoMemoryReplSet;
const cake = { name: 'Test cake', slug: 'test-cake', categorySlug: 'banh-le', price: 100000, stock: 10, imageUrl: '', description: 'Test product', detailedDescription: { flavor: '', ingredients: '', storage: '', dimensions: '', accessories: [] } };
const request = (body: unknown) => new Request('http://localhost/api/submit-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const order = (id: string, quantity = 1) => ({ customerName: 'Test Customer', phone: '0912345678', items: [{ id, quantity }], idempotencyKey: randomUUID() });
const context = (resource: string, id?: string) => ({ params: Promise.resolve({ resource, id: id ? [id] : undefined }) });
async function seed(id: string, extra = {}) {
  await (await getDb()).collection<{ _id: string }>('cakes').insertOne({ _id: id, ...cake, ...extra });
}
before(async () => {
  replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = replica.getUri('backend_test');
  process.env.MONGODB_USER = '';
  process.env.MONGODB_PASSWORD = '';
  process.env.MONGODB_AUTH_SOURCE = 'admin';
  process.env.APP_ORIGIN = 'http://localhost';
  const db = await getDb();
  await ensureAuthIndexes();
  for(const [id,role,token] of [['test-admin','admin','a'.repeat(64)],['regular-user','user','b'.repeat(64)]] as const) {
    await db.collection<AdminAccount>('admin_users').insertOne({ _id:id, username:id, displayName:id, role, disabled:false, passwordHash:'unused', createdAt:new Date() });
    await db.collection<AdminSession>('admin_sessions').insertOne({ _id:sessionHash(token),userId:id,expiresAt:new Date(Date.now()+60000) });
  }
  for (const name of ['cakes', 'orders', 'customers', 'birthday_cake_sizes']) await db.createCollection(name);
}, { timeout: 300000 });
after(async () => { if (replica) { await (await getMongoClient()).close(); await replica.stop(); } });

test('reject malformed and manipulated checkout data', async () => {
  assert.equal(checkoutSchema.safeParse({ ...order('x'), totalAmount: 1 }).success, false);
  assert.equal(checkoutSchema.safeParse({ ...order('x'), phone: '0|12345678' }).success, false);
  assert.equal((await POST(request({ ...order('x'), items: [] }))).status, 400);
  assert.equal((await POST(new Request('http://localhost', { method: 'POST', body: '{' }))).status, 400);
  assert.equal(resourceSchemas.cakes.safeParse({ ...cake, price: -1 }).success, false);
});
test('private reads and all mutations require server authentication', async () => {
  for (const resource of ['orders', 'customers', 'ingredients']) assert.equal((await GET(new Request('http://localhost'), context(resource))).status, 401);
  for (const handler of [PUT, PATCH, DELETE]) assert.equal((await handler(request(cake), context('cakes', 'x'))).status, 401);
});
test('public catalog supports filters and bounded pagination', async () => {
  await seed('catalog');
  const response = await GET(new Request('http://localhost?slug=test-cake&limit=1'), context('cakes'));
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.equal(data[0].id, 'catalog');
  assert.equal(data[0]._id, undefined);
  assert.equal((await GET(new Request('http://localhost?limit=0'), context('cakes'))).status, 400);
});
test('checkout persists server prices, contact and stock, with idempotent retry', async () => {
  await seed('checkout');
  const input = order('checkout', 2);
  const first = await POST(request(input));
  assert.equal(first.status, 201);
  assert.equal((await first.json()).totalAmount, 200000);
  assert.equal((await POST(request(input))).status, 201);
  const db = await getDb();
  assert.equal((await db.collection<{ _id: string; stock: number }>('cakes').findOne({ _id: 'checkout' }))?.stock, 8);
  assert.equal(await db.collection<{ _id: string }>('orders').countDocuments({ _id: input.idempotencyKey }), 1);
  assert.equal((await POST(request({ ...input, items: [{ id: 'checkout', quantity: 3 }] }))).status, 409);
});
test('failed multi-item checkout rolls back stock and customer/order writes', async () => {
  await seed('rollback');
  const input = { ...order('rollback'), items: [{ id: 'rollback', quantity: 2 }, { id: 'missing', quantity: 1 }] };
  assert.equal((await POST(request(input))).status, 400);
  const db = await getDb();
  assert.equal((await db.collection<{ _id: string; stock: number }>('cakes').findOne({ _id: 'rollback' }))?.stock, 10);
  assert.equal(await db.collection<{ _id: string }>('orders').countDocuments({ _id: input.idempotencyKey }), 0);
});
test('concurrent orders cannot oversell the last item', async () => {
  await seed('last-item', { stock: 1 });
  const responses = await Promise.all([POST(request(order('last-item'))), POST(request(order('last-item')))]);
  assert.deepEqual(responses.map(response => response.status).sort(), [201, 409]);
});
test('birthday size price comes from database and unknown sizes fail', async () => {
  await seed('birthday', { categorySlug: 'banh-sinh-nhat' });
  await (await getDb()).collection('birthday_cake_sizes').insertOne({ name: '20cm', price: 250000, order: 1 });
  assert.equal((await POST(request(order('birthday')))).status, 400);
  const response = await POST(request({ ...order('birthday'), items: [{ id: 'birthday', quantity: 1, size: '20cm' }] }));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).totalAmount, 250000);
});
test('cancellation restores stock once and terminal orders cannot reopen', async () => {
  await seed('cancel');
  const input = order('cancel', 3);
  assert.equal((await POST(request(input))).status, 201);
  await changeOrderStatus(input.idempotencyKey, 'cancelled');
  await changeOrderStatus(input.idempotencyKey, 'cancelled');
  assert.equal((await (await getDb()).collection<{ _id: string; stock: number }>('cakes').findOne({ _id: 'cancel' }))?.stock, 10);
  await assert.rejects(changeOrderStatus(input.idempotencyKey, 'processing'));
});

const adminRequest = (body: unknown, token = 'admin-token') => new Request('http://localhost', { method: 'POST', headers: { Origin: 'http://localhost', Cookie: 'vibary_admin_session=' + (token === 'admin-token' ? 'a'.repeat(64) : token === 'user-token' ? 'b'.repeat(64) : token) }, body: JSON.stringify(body) });
test('verified users still need admin permission; admin CRUD validates fields', async () => {
  const ctx = context('categories', 'test-category');
  const category = { slug: 'test-category', title: 'Test', subtitle: '', description: '' };
  assert.equal((await PUT(adminRequest(category, 'user-token'), ctx)).status, 403);
  assert.equal((await PUT(adminRequest(category, 'invalid-token'), ctx)).status, 401);
  assert.equal((await PUT(adminRequest(category), ctx)).status, 200);
  assert.equal((await PATCH(adminRequest({ title: 'Changed' }), ctx)).status, 200);
  const saved = await (await GET(new Request('http://localhost'), ctx)).json();
  assert.equal(saved.data.title, 'Changed');
  assert.equal(saved.data.slug, 'test-category');
  assert.equal((await PATCH(adminRequest({ title: '' }), ctx)).status, 400);
  assert.equal((await DELETE(adminRequest({}), ctx)).status, 204);
  assert.equal((await GET(new Request('http://localhost'), ctx)).status, 404);
});
test('order status API uses transactional cancellation', async () => {
  await seed('cancel-api');
  const input = order('cancel-api', 2);
  assert.equal((await POST(request(input))).status, 201);
  const ctx = context('orders', input.idempotencyKey);
  assert.equal((await PATCH(adminRequest({ orderStatus: 'cancelled' }), ctx)).status, 200);
  assert.equal((await (await getDb()).collection<{ _id: string; stock: number }>('cakes').findOne({ _id: 'cancel-api' }))?.stock, 10);
  assert.equal((await PATCH(adminRequest({ orderStatus: 'new' }), ctx)).status, 409);
  assert.equal((await PATCH(adminRequest({ totalAmount: 1 }), ctx)).status, 400);
});

test('MongoDB configuration uses URI database and optional separate credentials', async () => {
  const local = getMongoConfig({ MONGODB_URI: 'mongodb://127.0.0.1:27017/luxcare', MONGODB_USER: '', MONGODB_PASSWORD: '', MONGODB_AUTH_SOURCE: 'admin' });
  assert.equal(local.options.auth, undefined);
  const client = new MongoClient(local.uri, local.options);
  assert.equal(client.db().databaseName, 'luxcare');
  await client.close();
  const secured = getMongoConfig({ MONGODB_URI: local.uri, MONGODB_USER: 'user@example', MONGODB_PASSWORD: 'p@ss:/?#', MONGODB_AUTH_SOURCE: 'accounts' });
  assert.deepEqual(secured.options.auth, { username: 'user@example', password: 'p@ss:/?#' });
  assert.equal(secured.options.authSource, 'accounts');
  assert.throws(() => getMongoConfig({ MONGODB_URI: local.uri, MONGODB_USER: 'user' }));
});
