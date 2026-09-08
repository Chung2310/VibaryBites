import 'server-only';
import { getMongoConfig } from './mongodb-config';
import { MongoClient, type Document } from 'mongodb';
const globalDb = globalThis as typeof globalThis & { mongoConnection?: Promise<MongoClient> };
export function getMongoClient() {
  const { uri, options } = getMongoConfig();
  if (!globalDb.mongoConnection) {
    const client = new MongoClient(uri, options);
    globalDb.mongoConnection = client.connect().catch(async (error) => {
      globalDb.mongoConnection = undefined;
      await client.close();
      throw error;
    });
  }
  return globalDb.mongoConnection;
}
export async function getDb() {
  return (await getMongoClient()).db();
}
export type StoreDocument = Document & { _id: string };
export function serialize(document: StoreDocument) {
  const { _id, _migration, fingerprint, ...data } = document;
  return { ...data, id: _id };
}
