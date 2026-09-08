import ProductsClient from './products-client';
import { getProducts, getCategories } from '@/lib/server-data';
export const dynamic = 'force-dynamic';
export default async function ProductsPage() {
  const [initialProducts, initialCategories] = await Promise.all([getProducts(), getCategories()]);
  return <ProductsClient initialProducts={initialProducts} initialCategories={initialCategories} />;
}
