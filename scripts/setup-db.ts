import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import { getMongoConfig } from '../src/lib/backend/mongodb-config';
import { products } from '../src/lib/data';
import { resourceSchemas } from '../src/lib/backend/schemas';
config({ path: '.env.local' });
config();
async function main() {
  const { uri, options } = getMongoConfig();
  const client = new MongoClient(uri, options);
  try {
    await client.connect();
    const db = client.db();
    for (const name of ['cakes', 'categories', 'news_articles', 'birthday_cake_sizes', 'ingredients', 'customers', 'orders']) {
      if (!(await db.listCollections({ name }).hasNext())) await db.createCollection(name);
    }
    for (const name of ['cakes', 'categories', 'news_articles']) await db.collection(name).createIndex({ slug: 1 }, { unique: true });
    await db.collection('cakes').createIndex({ categorySlug: 1, _id: 1 });
    await db.collection('news_articles').createIndex({ publicationDate: -1 });
    await db.collection('orders').createIndex({ orderDate: -1 });
    await db.collection('orders').createIndex({ customerId: 1 });
    if (process.argv.includes('--demo')) {
      for (const product of products) {
        const data = resourceSchemas.cakes.parse({ ...product, stock: product.stock ?? 10 });
        await db.collection<{ _id: string }>('cakes').updateOne({ _id: product.id }, { $setOnInsert: data }, { upsert: true });
      }
      for (const slug of new Set(products.map(product => product.categorySlug))) {
        const title = slug === 'banh-sinh-nhat' ? 'Bánh sinh nhật' : slug.replaceAll('-', ' ');
        await db.collection<{ _id: string }>('categories').updateOne({ _id: slug }, { $setOnInsert: { slug, title, subtitle: title, description: title } }, { upsert: true });
      }
      console.log('Demo products inserted; existing documents were preserved.');
    }
    console.log('MongoDB collections and indexes are ready.');
  } finally { await client.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
