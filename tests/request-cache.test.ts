import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequestCache } from '../src/lib/data-client/request-cache';
test('simultaneous requests share one load and expire after the TTL', async () => {
  let now = 0; let loads = 0;
  const cache = createRequestCache(15, 10, () => now);
  const load = async () => ++loads;
  assert.deepEqual(await Promise.all([cache.get('cakes',load),cache.get('cakes',load)]),[1,1]);
  assert.equal(await cache.get('cakes',load),1);
  now=16;
  assert.equal(await cache.get('cakes',load),2);
});
test('failed requests can retry and cache storage is bounded', async () => {
  const cache=createRequestCache(1000,1);
  await assert.rejects(cache.get('cakes',async()=>{throw new Error('offline')}));
  assert.equal(await cache.get('cakes',async()=>1),1);
  await cache.get('news',async()=>2);
  assert.equal(await cache.get('cakes',async()=>3),3);
});
test('invalidated in-flight requests cannot replace newer data', async () => {
  const cache=createRequestCache();
  let release!: (value:number)=>void;
  const old=cache.get('/api/data/cakes',()=>new Promise<number>(resolve=>{release=resolve;}));
  await Promise.resolve();
  cache.invalidate('/api/data/cakes');
  assert.equal(await cache.get('/api/data/cakes',async()=>2),2);
  release(1);
  await old;
  assert.equal(await cache.get('/api/data/cakes',async()=>3),2);
});
