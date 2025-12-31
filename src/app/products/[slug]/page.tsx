

import ProductDetailClient from './product-detail-client';

// Server component to fetch slug and pass to client component
export default function ProductDetailPage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    return <ProductDetailClient slug={slug} />;
}
