import 'server-only';
import { getDb, serialize, type StoreDocument } from '@/lib/backend/mongodb';
import type { Product, NewsArticle, ProductCategory } from '@/lib/types';
export async function getProducts(options: { categorySlug?: string; limit?: number } = {}): Promise<Product[]> {
  const db = await getDb();
  const result = await db.collection<StoreDocument>('cakes').find(options.categorySlug ? { categorySlug: options.categorySlug } : {}).limit(options.limit ? Math.max(1, Math.min(options.limit, 200)) : 0).toArray();
  return result.map(serialize) as Product[];
}
export async function getNewsArticles(options: { limit?: number; orderBy?: string; order?: 'asc' | 'desc' } = {}): Promise<NewsArticle[]> {
  const db = await getDb();
  const sort = options.orderBy === 'publicationDate' ? 'publicationDate' : '_id';
  const result = await db.collection<StoreDocument>('news_articles').find().sort({ [sort]: options.order === 'desc' ? -1 : 1 }).limit(Math.max(1, Math.min(options.limit || 200, 200))).toArray();
  return result.map(serialize) as NewsArticle[];
}
export async function getCategories(): Promise<ProductCategory[]> {
  const result = await (await getDb()).collection<StoreDocument>('categories').find().toArray();
  return result.map(serialize) as ProductCategory[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await (await getDb()).collection<StoreDocument>('cakes').findOne({ slug });
  return row ? serialize(row) as Product : null;
}
export async function getBirthdayCakeSizes(): Promise<import('@/lib/types').BirthdayCakeSize[]> {
  const rows = await (await getDb()).collection<StoreDocument>('birthday_cake_sizes').find().sort({ order: 1, _id: 1 }).toArray();
  return rows.map(serialize) as import('@/lib/types').BirthdayCakeSize[];
}
export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const row = await (await getDb()).collection<StoreDocument>('news_articles').findOne({ slug });
  return row ? serialize(row) as NewsArticle : null;
}
