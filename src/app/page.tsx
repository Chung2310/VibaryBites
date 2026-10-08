export const dynamic = 'force-dynamic';

import { HomeClient } from './home-client';
import { getProducts, getNewsArticles, getCategories } from '@/lib/server-data';

async function getHomePageData() {
    // Chỉ lấy sản phẩm thuộc danh mục bánh sinh nhật cho trang chủ để đảm bảo tính nhất quán
    const [featuredProducts, latestArticles, categories] = await Promise.all([
      getProducts({ categorySlug: 'banh-sinh-nhat', limit: 30 }),
      getNewsArticles({ limit: 4, orderBy: 'publicationDate', order: 'desc' }),
      getCategories(),
    ]);

    return {
      featuredProducts,
      latestArticles,
      categories: categories.filter(category => category.source === 'cake-catalog'),
    };
}


export default async function HomePage() {
    const { featuredProducts, latestArticles, categories } = await getHomePageData();

    return (
        <HomeClient
            featuredProducts={featuredProducts}
            latestArticles={latestArticles}
            categories={categories}
        />
    );
}
