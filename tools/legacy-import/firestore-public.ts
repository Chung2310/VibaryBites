import { initializeApp, deleteApp } from 'firebase/app';
import { Bytes, DocumentReference, GeoPoint, Timestamp, collection, collectionGroup, documentId, getDocsFromServer, getFirestore, limit, orderBy, query, startAfter, terminate, type QueryDocumentSnapshot } from 'firebase/firestore';
import { MongoClient } from 'mongodb';
import { firebaseConfig } from './config';
import { getMongoConfig } from './mongodb-config';
import { migrateCollection, type SourceDocument } from './firestore-migration';

export const publicCollections = ['cakes', 'categories', 'news_articles', 'birthday_cake_sizes', 'quiz_questions', 'reviews'];
export function normalizeClientValue(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof DocumentReference) return value.path;
  if (value instanceof GeoPoint) return { latitude: value.latitude, longitude: value.longitude };
  if (value instanceof Bytes) return Buffer.from(value.toUint8Array());
  if (Array.isArray(value)) return value.map(normalizeClientValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeClientValue(item)]));
  return value;
}
export async function migratePublic(options: { collections: string[]; batchSize: number; dryRun: boolean; overwrite: boolean; resolveSlugs?: boolean }) {
  if (options.collections.some(name => !publicCollections.includes(name))) throw new Error(`Public mode supports: ${publicCollections.join(', ')}`);
  const { uri, options: mongoOptions } = getMongoConfig();
  const client = new MongoClient(uri, mongoOptions);
  const app = initializeApp(firebaseConfig, 'firestore-public-migration');
  const firestore = getFirestore(app);
  let failed = false;
  try {
    await client.connect();
    const db = client.db();
    console.log(`Firebase client config project: ${firebaseConfig.projectId}; MongoDB database: ${db.databaseName}; public data only; mode: ${options.dryRun ? 'dry-run' : options.overwrite ? 'overwrite' : 'insert missing only'}`);
    for (const name of [...new Set(options.collections)]) {
      async function* documents(): AsyncGenerator<SourceDocument> {
        const reference = name === 'reviews' ? collectionGroup(firestore, name) : collection(firestore, name);
        let cursor: QueryDocumentSnapshot | undefined;
        while (true) {
          const constraints = [orderBy(documentId()), limit(options.batchSize), ...(cursor ? [startAfter(cursor)] : [])];
          const page = await getDocsFromServer(query(reference, ...constraints));
          for (const row of page.docs) yield { path: row.ref.path, data: normalizeClientValue(row.data()) as Record<string, unknown> };
          if (page.size < options.batchSize) return;
          cursor = page.docs.at(-1);
        }
      }
      try {
        const counts = await migrateCollection(db, name, documents(), { projectId: firebaseConfig.projectId, dryRun: options.dryRun, overwrite: options.overwrite, resolveSlugs: options.resolveSlugs });
        console.log(JSON.stringify({ collection: name, ...counts }));
        if (counts.failed) failed = true;
      } catch (error) {
        failed = true;
        console.error(`${name}: Firebase read failed (${(error as { code?: string }).code || 'unknown'}).`);
      }
    }
    if (failed) throw new Error('Public migration incomplete; review collection errors above.');
    console.log(options.dryRun ? 'Public dry-run completed; no MongoDB writes.' : 'Public migration completed. Private collections were not accessed.');
  } finally {
    await client.close();
    await terminate(firestore);
    await deleteApp(app);
  }
}
