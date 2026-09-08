// Short-lived public response cache: share in-flight requests, bound memory,
// and never repopulate invalidated entries when an older request completes.
export function createRequestCache(ttlMs = 15000, maxEntries = 100, now = Date.now) {
  const entries = new Map<string, { promise: Promise<unknown>; expiresAt: number }>();
  return {
    get<T>(key: string, loader: () => Promise<T>): Promise<T> {
      const hit = entries.get(key);
      if (hit && hit.expiresAt > now()) return hit.promise as Promise<T>;
      const entry = { promise: Promise.resolve().then(loader) as Promise<unknown>, expiresAt: Infinity };
      entries.delete(key);
      entries.set(key, entry);
      while (entries.size > maxEntries) entries.delete(entries.keys().next().value!);
      entry.promise.then(() => { if (entries.get(key) === entry) entry.expiresAt = now() + ttlMs; }, () => { if (entries.get(key) === entry) entries.delete(key); });
      return entry.promise as Promise<T>;
    },
    invalidate(prefix = '') { for (const key of entries.keys()) if (key.startsWith(prefix)) entries.delete(key); },
  };
}
