import { createHash } from 'node:crypto';
import { Timestamp, GeoPoint, DocumentReference } from 'firebase-admin/firestore';
import type { Db, Document } from 'mongodb';
import { idSchema } from './schemas';

export const rootCollections = ['cakes', 'categories', 'news_articles', 'birthday_cake_sizes', 'ingredients', 'customers', 'quiz_questions', 'settings', 'analytics'];
export const groupCollections = ['orders', 'order_items', 'reviews', 'addresses', 'favorites'];
export const collectionNames = [...rootCollections, ...groupCollections];
export type SourceDocument = { path: string; data: Record<string, unknown> };
export type MigrationDocument = Document & { _id: string; _migration: { projectId: string; path: string; originalSlug?: string } };
export type MigrationOptions = { projectId: string; dryRun: boolean; overwrite: boolean; resolveSlugs?: boolean };

export function normalize(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof DocumentReference) return value.path;
  if (value instanceof GeoPoint) return { latitude: value.latitude, longitude: value.longitude };
  if (Buffer.isBuffer(value)) return value;
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = Object.create(null);
    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.') || key.includes('\0')) throw new Error('Unsupported MongoDB field name');
      if (child !== undefined) result[key] = normalize(child);
    }
    return result;
  }
  return value;
}

export function transform(source: SourceDocument, projectId: string): { collection: string; document: MigrationDocument } {
  const parts = source.path.split('/');
  if (parts.length % 2 !== 0) throw new Error('Invalid Firestore document path');
  const collection = parts.at(-2)!;
  if (!collectionNames.includes(collection)) throw new Error('Unsupported collection');
  const sourceId = parts.at(-1)!;
  // Main entity IDs remain unchanged. Auxiliary subcollections have parent-scoped
  // IDs, so hash the full path to avoid merging unrelated reviews/items/addresses.
  const id = parts.length > 2 && collection !== 'orders'
    ? `fs-${createHash('sha256').update(source.path).digest('hex')}` : sourceId;
  if (['cakes', 'categories', 'news_articles', 'birthday_cake_sizes', 'ingredients', 'customers', 'orders'].includes(collection)) idSchema.parse(id);
  const data = normalize(source.data) as Record<string, unknown>;
  if ('_migration' in data || '_id' in data) throw new Error('Source contains reserved migration fields');
  const parentId = (name: string) => {
    const index = parts.lastIndexOf(name, parts.length - 3);
    return index >= 0 ? parts[index + 1] : undefined;
  };
  for (const [field, parent] of [['customerId', 'customers'], ['orderId', 'orders'], ['cakeId', 'cakes']] as const) {
    const value = parentId(parent);
    if (!value) continue;
    if (data[field] !== undefined && data[field] !== value && data[field] !== parts.slice(0, parts.lastIndexOf(parent) + 2).join('/')) {
      throw new Error(`Conflicting parent reference: ${field}`);
    }
    data[field] = value;
  }
  // Firebase document ID is authoritative, matching the previous UI.
  if (data.id !== undefined && data.id !== sourceId) throw new Error('Stored id differs from Firestore document ID');
  delete data.id;
  return { collection, document: { ...data, _id: id, _migration: { projectId, path: source.path } } };
}

export async function saveDocument(db: Db, collection: string, document: MigrationDocument, options: MigrationOptions) {
  const target = db.collection<MigrationDocument>(collection);
  const existing = await target.findOne({ _id: document._id });
  if (existing?._migration && (existing._migration.path !== document._migration.path || existing._migration.projectId !== options.projectId)) {
    throw new Error('ID collision with a different Firestore source');
  }
  if (existing && !options.overwrite) return 'skipped' as const;
  if (['cakes', 'categories', 'news_articles'].includes(collection) && typeof document.slug === 'string') {
    const duplicate = await target.findOne({ slug: document.slug, _id: { $ne: document._id } }, { projection: { _id: 1 } });
    if (duplicate) throw new Error('Slug already belongs to another MongoDB document');
  }
  if (options.dryRun) return existing ? 'wouldReplace' as const : 'wouldInsert' as const;
  if (existing) {
    // Compare provenance so a concurrent migration cannot replace another source.
    const result = await target.replaceOne({ _id: document._id, _migration: existing._migration ?? { $exists: false } }, document);
    if (!result.matchedCount) throw new Error('Target changed during migration; retry after stopping concurrent writes');
    return 'replaced' as const;
  }
  const result = await target.updateOne({ _id: document._id }, { $setOnInsert: document }, { upsert: true });
  return result.upsertedCount ? 'inserted' as const : 'skipped' as const;
}

export async function migrateCollection(db: Db, collection: string, source: AsyncIterable<SourceDocument>, options: MigrationOptions) {
  const counts = { scanned: 0, inserted: 0, replaced: 0, skipped: 0, wouldInsert: 0, wouldReplace: 0, failed: 0 };
  const seenIds = new Map<string, string>();
  const seenSlugs = new Map<string, string>();
  for await (const row of source) {
    counts.scanned++;
    try {
      const converted = transform(row, options.projectId);
      if (converted.collection !== collection) throw new Error('Unexpected source collection');
      const document = converted.document;
      const previousPath = seenIds.get(document._id);
      if (previousPath && previousPath !== row.path) throw new Error('Duplicate ID across Firestore parents');
      seenIds.set(document._id, row.path);
      if (['cakes', 'categories', 'news_articles'].includes(collection) && typeof document.slug === 'string') {
        if (options.resolveSlugs) {
          const sourceCollision = seenSlugs.has(document.slug) && seenSlugs.get(document.slug) !== document._id;
          const targetCollision = await db.collection<MigrationDocument>(collection).findOne({ slug: document.slug, _id: { $ne: document._id } }, { projection: { _id: 1 } });
          if (sourceCollision || targetCollision) {
            document._migration.originalSlug = document.slug;
            const suffix = document._id.length <= 80 ? document._id : createHash('sha256').update(document._id).digest('hex').slice(0, 32);
            document.slug = document.slug.slice(0, 159 - suffix.length) + '-' + suffix;
          }
        }
        const previousId = seenSlugs.get(document.slug);
        if (previousId && previousId !== document._id) throw new Error('Duplicate slug in Firestore source');
        seenSlugs.set(document.slug, document._id);
      }
      counts[await saveDocument(db, collection, document, options)]++;
    } catch (error) {
      counts.failed++;
      console.error(`[${collection}] ${row.path}: ${error instanceof Error ? error.message : 'Migration failed'}`);
    }
  }
  return counts;
}
