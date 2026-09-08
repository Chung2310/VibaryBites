import { notFound } from 'next/navigation';
import { getProductBySlug, getCategories, getBirthdayCakeSizes } from '@/lib/server-data';
import ProductDetail from './product-detail';
export const dynamic = 'force-dynamic';
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, initialCategories, initialSizes] = await Promise.all([getProductBySlug(slug), getCategories(), getBirthdayCakeSizes()]);
  if (!product) notFound();
  return <ProductDetail key={product.id} product={product} initialCategories={initialCategories} initialSizes={initialSizes} />;
}
