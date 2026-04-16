import { HomeClient } from './home-client';
import { getProducts, getNewsArticles } from '@/lib/server-data';

async function getHomePageData() {
    // Chỉ lấy sản phẩm thuộc danh mục bánh sinh nhật cho trang chủ
    const featuredProducts = await getProducts({ categorySlug: 'banh-sinh-nhat', limit: 20 });
    const latestArticles = await getNewsArticles({ limit: 4, orderBy: 'publicationDate', order: 'desc' });

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
