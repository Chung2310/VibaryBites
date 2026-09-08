const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const source = readFileSync('docker/entrypoint.cjs', 'utf8');

for (const failures of [2, 10]) {
  test('closes Mongo clients after ' + failures + ' failed connection attempts', async () => {
    const clients = [];
    let starts = 0;
    class MongoClient {
      constructor() { this.closed = false; clients.push(this); }
      async connect() { if (clients.length <= failures) throw new Error('offline'); }
      async close() { this.closed = true; }
      db() { return {
        listCollections: () => ({ hasNext: async () => true }),
        collection: () => ({ createIndex: async () => {} }),
      }; }
    }
    await runInNewContext(source, {
      require: name => {
        if (name === 'mongodb') return { MongoClient };
        if (name === '../server.js') { starts++; return {}; }
        throw new Error(name);
      },
      process: { env: { MONGODB_URI: 'mongodb://test/db' } },
      console: { log() {}, warn() {}, error() {} },
      setTimeout: callback => callback(),
    });
    assert.equal(clients.length, failures === 10 ? 10 : failures + 1);
    assert.ok(clients.every(client => client.closed));
    assert.equal(starts, 1);
  });
}
