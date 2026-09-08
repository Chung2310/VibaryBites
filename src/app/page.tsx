export const dynamic = 'force-dynamic';

import { HomeClient } from './home-client';
import { getProducts, getNewsArticles } from '@/lib/server-data';

async function getHomePageData() {
    // Chỉ lấy sản phẩm thuộc danh mục bánh sinh nhật cho trang chủ để đảm bảo tính nhất quán
    const [featuredProducts, latestArticles] = await Promise.all([
      getProducts({ categorySlug: 'banh-sinh-nhat', limit: 30 }),
      getNewsArticles({ limit: 4, orderBy: 'publicationDate', order: 'desc' }),
    ]);

    return { featuredProducts, latestArticles };
}


export default async function HomePage() {
    const { featuredProducts, latestArticles } = await getHomePageData();

    return (
        <HomeClient
            featuredProducts={featuredProducts}
            latestArticles={latestArticles}
        />
    );
}
