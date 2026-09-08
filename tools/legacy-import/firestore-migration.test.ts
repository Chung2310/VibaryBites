import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { Timestamp, GeoPoint } from 'firebase-admin/firestore';
import { MongoClient, type Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { migrateCollection, normalize, transform, type SourceDocument, type MigrationDocument } from './firestore-migration';
let server: MongoMemoryServer;
let client: MongoClient;
let db: Db;
const options = { projectId: 'test-project', dryRun: false, overwrite: false };
async function* source(...rows: SourceDocument[]) { yield* rows; }
before(async () => {
  server = await MongoMemoryServer.create();
  client = await new MongoClient(server.getUri()).connect();
  db = client.db('migration_test');
}, { timeout: 300000 });
after(async () => { await client?.close(); await server?.stop(); });
test('normalize Firebase values recursively without losing binary data', () => {
  const result = normalize({ created: Timestamp.fromDate(new Date('2026-01-01T00:00:00Z')), nested: [new GeoPoint(10, 20)], bytes: Buffer.from('hello'), empty: null }) as Record<string, any>;
  assert.equal(result.created, '2026-01-01T00:00:00.000Z');
  assert.deepEqual(result.nested, [{ latitude: 10, longitude: 20 }]);
  assert.equal(result.bytes.toString(), 'hello');
  assert.equal(result.empty, null);
});
test('nested orders keep IDs, infer customer and reject conflicting ownership', () => {
  const result = transform({ path: 'customers/customer-1/orders/order-1', data: { totalAmount: 100 } }, 'test-project');
  assert.equal(result.collection, 'orders');
  assert.equal(result.document._id, 'order-1');
  assert.equal(result.document.customerId, 'customer-1');
  assert.throws(() => transform({ path: 'customers/customer-1/orders/order-1', data: { customerId: 'customer-2' } }, 'test-project'));
});
test('auxiliary subcollections use stable IDs scoped to their parents', () => {
  const a = transform({ path: 'cakes/a/reviews/1', data: {} }, 'test-project');
  const b = transform({ path: 'cakes/b/reviews/1', data: {} }, 'test-project');
  assert.notEqual(a.document._id, b.document._id);
  assert.equal(a.document.cakeId, 'a');
  assert.equal(a.document._id, transform({ path: 'cakes/a/reviews/1', data: {} }, 'test-project').document._id);
});
test('dry-run never writes, first import inserts, rerun preserves local edits', async () => {
  const row = { path: 'cakes/cake-1', data: { name: 'Original', slug: 'original', price: 100 } };
  const dry = await migrateCollection(db, 'cakes', source(row), { ...options, dryRun: true });
  assert.equal(dry.wouldInsert, 1);
  assert.equal(await db.collection('cakes').countDocuments(), 0);
  assert.equal((await migrateCollection(db, 'cakes', source(row), options)).inserted, 1);
  await db.collection<MigrationDocument>('cakes').updateOne({ _id: 'cake-1' }, { $set: { price: 999 } });
  assert.equal((await migrateCollection(db, 'cakes', source(row), options)).skipped, 1);
  assert.equal((await db.collection<MigrationDocument>('cakes').findOne({ _id: 'cake-1' }))?.price, 999);
  assert.equal((await migrateCollection(db, 'cakes', source(row), { ...options, overwrite: true })).replaced, 1);
  assert.equal((await db.collection<MigrationDocument>('cakes').findOne({ _id: 'cake-1' }))?.price, 100);
});
test('same order ID under different customers is reported, never overwritten', async () => {
  const first = { path: 'customers/a/orders/collision', data: { totalAmount: 100 } };
  const second = { path: 'customers/b/orders/collision', data: { totalAmount: 200 } };
  const result = await migrateCollection(db, 'orders', source(first, second), options);
  assert.equal(result.inserted, 1);
  assert.equal(result.failed, 1);
  const rerun = await migrateCollection(db, 'orders', source(second), { ...options, overwrite: true });
  assert.equal(rerun.failed, 1);
  assert.equal((await db.collection<MigrationDocument>('orders').findOne({ _id: 'collision' }))?.customerId, 'a');
});
test('duplicate source slugs are caught during dry-run', async () => {
  const result = await migrateCollection(db, 'categories', source(
    { path: 'categories/one', data: { slug: 'duplicate' } },
    { path: 'categories/two', data: { slug: 'duplicate' } },
  ), { ...options, dryRun: true });
  assert.equal(result.wouldInsert, 1);
  assert.equal(result.failed, 1);
  assert.equal(await db.collection('categories').countDocuments(), 0);
});

test('explicit slug resolution preserves both IDs and is stable on rerun', async () => {
  const rows = [
    { path: 'cakes/slug-a', data: { slug: 'same-slug' } },
    { path: 'cakes/slug-b', data: { slug: 'same-slug' } },
  ];
  const result = await migrateCollection(db, 'cakes', source(...rows), { ...options, resolveSlugs: true });
  assert.equal(result.inserted, 2);
  assert.equal(result.failed, 0);
  const copied = await db.collection<MigrationDocument>('cakes').findOne({ _id: 'slug-b' });
  assert.equal(copied?.slug, 'same-slug-slug-b');
  assert.equal(copied?._migration.originalSlug, 'same-slug');
  const rerun = await migrateCollection(db, 'cakes', source(...rows), { ...options, resolveSlugs: true });
  assert.equal(rerun.skipped, 2);
  assert.equal(rerun.failed, 0);
});
