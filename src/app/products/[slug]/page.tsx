

import ProductDetailClient from './product-detail-client';
import { products } from '@/lib/data';

// Server component to fetch slug and pass to client component
export default function ProductDetailPage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    return <ProductDetailClient slug={slug} />;
}

// Re-generate static paths at build time
export async function generateStaticParams() {
    // This should fetch from Firestore in a real app
    return products.map(product => ({
        slug: product.slug
    }))
}
