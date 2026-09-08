import { z } from 'zod';
export const idSchema = z.string().min(1).max(160).regex(/^[\p{L}\p{N}_-]+$/u);
const text = z.string().max(10000);
const name = z.string().trim().min(1).max(300);
const money = z.number().finite().min(0).max(1_000_000_000);
const size = z.object({ name, price: money });
export const resourceSchemas = {
  cakes: z.object({
    slug: idSchema, name, subtitle: text.optional(), description: text,
    detailedDescription: z.object({ flavor: text, ingredients: text, storage: text, dimensions: text, accessories: z.array(text).max(100) }),
    price: money, sizes: z.array(size).max(100).optional(), imageUrl: z.string().max(2048), categorySlug: idSchema,
    flavorProfile: z.array(text).max(100).optional(), structure: z.array(text).max(100).optional(),
    stock: z.number().int().nonnegative().max(1_000_000).optional(),
  }),
  categories: z.object({ slug: idSchema, title: name, subtitle: text, description: text }),
  news_articles: z.object({ slug: idSchema, title: name, excerpt: text, content: z.string().max(500000), author: name, publicationDate: z.string().refine(value => !Number.isNaN(Date.parse(value))), category: name, imageUrl: z.string().max(2048) }),
  birthday_cake_sizes: size.extend({ order: z.number().int().nonnegative() }),
  ingredients: z.object({ name, stock: z.number().finite().nonnegative(), unit: z.enum(['g', 'kg', 'ml', 'l', 'units']), parLevel: z.number().finite().nonnegative() }),
};
export const resourceName = z.enum(['cakes', 'categories', 'news_articles', 'birthday_cake_sizes', 'ingredients', 'customers', 'orders']);
export const publicResources = new Set(['cakes', 'categories', 'news_articles', 'birthday_cake_sizes']);
export const orderStatusSchema = z.object({ orderStatus: z.enum(['new', 'processing', 'shipping', 'completed', 'cancelled']) }).strict();
export const checkoutSchema = z.object({
  customerName: name.min(2), phone: z.string().regex(/^0[35789][0-9]{8}$/),
  address: z.string().max(1000).default(''), notes: z.string().max(3000).default(''),
  items: z.array(z.object({ id: idSchema, quantity: z.number().int().min(1).max(100), size: name.optional() })).min(1).max(100),
  idempotencyKey: z.string().uuid(),
}).strict();
