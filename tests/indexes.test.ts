import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { ensureUniqueStringIndex } from '../src/lib/backend/indexes.cjs';
let server: MongoMemoryServer;
let client: MongoClient;
before(async () => { server = await MongoMemoryServer.create(); client = await new MongoClient(server.getUri()).connect(); }, { timeout: 300000 });
after(async () => { await client?.close(); await server?.stop(); });

for (const [name, options] of [
  ['full', { unique: true }],
  ['sparse', { unique: true, sparse: true }],
  ['partial', { unique: true, partialFilterExpression: { slug: { $type: 'string' } } }],
] as const) {
  test('reuses legacy ' + name + ' unique index without altering it', async () => {
    const collection = client.db().collection(name);
    await collection.createIndex({ slug: 1 }, options);
    const before = await collection.listIndexes().toArray();
    assert.equal(await ensureUniqueStringIndex(collection, 'slug'), 'slug_1');
    assert.deepEqual(await collection.listIndexes().toArray(), before);
    await collection.insertOne({ slug: 'cake' });
    await assert.rejects(collection.insertOne({ slug: 'cake' }), { code: 11000 });
  });
}
test('adds a unique index beside a legacy non-unique slug_1; reruns and concurrent calls succeed', async () => {
  const collection = client.db().collection('nonunique');
  await collection.createIndex({ slug: 1 });
  await collection.insertMany([{ slug: 'a' }, { slug: 'b' }]);
  await assert.rejects(collection.createIndex({slug:1},{unique:true}), {code:86});
  await Promise.all([ensureUniqueStringIndex(collection, 'slug'), ensureUniqueStringIndex(collection, 'slug')]);
  await ensureUniqueStringIndex(collection, 'slug');
  const indexes = await collection.listIndexes().toArray();
  assert.equal(indexes.length, 3);
  assert.equal(indexes.find(i => i.name === 'slug_1')?.unique, undefined);
  assert.equal(await collection.countDocuments(), 2);
  await assert.rejects(collection.insertOne({ slug: 'a' }), { code: 11000 });
});
test('does not accept an index whose partial filter excludes some string values', async () => {
  const collection = client.db().collection('restricted');
  await collection.createIndex({ slug: 1 }, { unique: true, partialFilterExpression: { active: true } });
  await ensureUniqueStringIndex(collection, 'slug');
  await collection.insertOne({ slug: 'a', active: false });
  await assert.rejects(collection.insertOne({ slug: 'a', active: false }), { code: 11000 });
});
test('duplicate legacy values fail without deleting data or the old index', async () => {
  const collection = client.db().collection('duplicates');
  await collection.createIndex({ slug: 1 });
  await collection.insertMany([{ slug: 'a' }, { slug: 'a' }]);
  await assert.rejects(ensureUniqueStringIndex(collection, 'slug'), { code: 11000 });
  assert.equal(await collection.countDocuments(), 2);
  assert.ok((await collection.listIndexes().toArray()).some(i => i.name === 'slug_1'));
});
test('creates an index for a missing collection and permits legacy records without usernames', async () => {
  const collection = client.db().collection('new_users');
  await ensureUniqueStringIndex(collection, 'username');
  await collection.insertMany([{ legacy: 1 }, { legacy: 2 }, { username: 'owner' }]);
  await assert.rejects(collection.insertOne({ username: 'owner' }), { code: 11000 });
});
