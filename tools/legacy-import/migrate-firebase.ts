import { config } from 'dotenv';
import { migratePublic, publicCollections } from './firestore-public';
import { parseArgs } from 'node:util';
import { readFile } from 'node:fs/promises';
import { applicationDefault, cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { FieldPath, getFirestore, type Query, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { MongoClient } from 'mongodb';
import { getMongoConfig } from './mongodb-config';
import { firebaseConfig } from './config';
import { collectionNames, groupCollections, migrateCollection, type SourceDocument } from './firestore-migration';

config({ path: '../../.env.local' });
config({ path: '../../.env' });
async function* pages(query: Query, batchSize: number): AsyncGenerator<QueryDocumentSnapshot> {
  let cursor: QueryDocumentSnapshot | undefined;
  const ordered = query.orderBy(FieldPath.documentId());
  while (true) {
    const page = await (cursor ? ordered.startAfter(cursor) : ordered).limit(batchSize).get();
    if (page.empty) return;
    for (const document of page.docs) yield document;
    cursor = page.docs.at(-1);
    if (page.size < batchSize) return;
  }
}
async function* documents(query: Query, batchSize: number): AsyncGenerator<SourceDocument> {
  for await (const document of pages(query, batchSize)) {
    const data = document.data();
    if (document.ref.parent.id === 'orders' && data.items === undefined) {
      const items: Record<string, unknown>[] = [];
      for await (const item of pages(document.ref.collection('order_items'), batchSize)) {
        const raw = item.data();
        const productId = typeof raw.cakeId === 'string' ? raw.cakeId.split('/').at(-1) : raw.cakeId?.id;
        if (typeof productId !== 'string' || !Number.isInteger(raw.quantity) || raw.quantity <= 0 || typeof raw.unitPrice !== 'number' || !Number.isFinite(raw.unitPrice) || raw.unitPrice < 0) {
          throw new Error(`Invalid legacy order item at ${item.ref.path}`);
        }
        items.push({ ...raw, id: productId, price: raw.unitPrice, quantity: raw.quantity });
      }
      data.items = items;
    }
    yield { path: document.ref.path, data };
  }
}
async function main() {
  const { values } = parseArgs({ options: {
    'resolve-slugs': { type: 'boolean', default: false },
    public: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false }, overwrite: { type: 'boolean', default: false },
    collections: { type: 'string' }, 'batch-size': { type: 'string', default: '200' },
    'service-account': { type: 'string' }, 'project-id': { type: 'string' }, help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log('Usage: npm run migrate -- [--public] [--resolve-slugs] [--dry-run] [--overwrite] [--collections=cakes,categories] [--batch-size=200] [--service-account=PATH] [--project-id=ID]');
    console.log('Default: import missing documents, preserve existing MongoDB documents. Firebase is read-only.');
    return;
  }
  const batchSize = Number(values['batch-size']);
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 1000) throw new Error('--batch-size must be between 1 and 1000');
  const selected = values.collections?.split(',').map(value => value.trim()).filter(Boolean) || (values.public ? publicCollections : collectionNames);
  if (!selected.length || selected.some(name => !collectionNames.includes(name))) throw new Error(`Supported collections: ${collectionNames.join(', ')}`);
  if (values.public) {
    if (values['project-id'] || values['service-account']) throw new Error('--public uses tools/legacy-import/config.ts; do not combine with --project-id or --service-account.');
    await migratePublic({ collections: selected, batchSize, dryRun: values['dry-run'], overwrite: values.overwrite, resolveSlugs: values['resolve-slugs'] });
    return;
  }
  const serviceAccount = values['service-account']
    ? JSON.parse(await readFile(values['service-account'], 'utf8'))
    : process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) : undefined;
  const projectId = values['project-id'] || firebaseConfig.projectId;
  const app = initializeApp({ projectId, credential: serviceAccount ? cert(serviceAccount) : applicationDefault() }, 'firestore-migration');
  const firestore = getFirestore(app);
  const { uri, options } = getMongoConfig();
  const client = new MongoClient(uri, options);
  let failed = false;
  try {
    await client.connect();
    const db = client.db();
    console.log(`Firestore project: ${projectId}; MongoDB database: ${db.databaseName}; mode: ${values['dry-run'] ? 'dry-run (no writes)' : values.overwrite ? 'overwrite' : 'insert missing only'}`);
    for (const name of [...new Set(selected)]) {
      try {
        const query = groupCollections.includes(name) ? firestore.collectionGroup(name) : firestore.collection(name);
        const counts = await migrateCollection(db, name, documents(query, batchSize), { projectId, dryRun: values['dry-run'], overwrite: values.overwrite });
        console.log(JSON.stringify({ collection: name, ...counts }));
        if (counts.failed) failed = true;
      } catch (error) {
        failed = true;
        // No document bodies or credentials in logs.
        console.error(`${name}: source read failed (${error instanceof Error ? error.name : 'UnknownError'}). Check Firebase credentials, permissions and source data.`);
      }
    }
    if (failed) throw new Error('Migration incomplete. Review failed collections/documents above; rerun safely after fixing them.');
    console.log(values['dry-run'] ? 'Dry-run completed. No MongoDB documents were written.' : 'Migration completed. Firebase data was not modified.');
  } finally {
    await client.close();
    await firestore.terminate();
    await deleteApp(app);
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Migration failed'); process.exitCode = 1; });
