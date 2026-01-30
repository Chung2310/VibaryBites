import { HomeClient } from './home-client';
import { getProducts, getNewsArticles } from '@/lib/server-data';

async function getHomePageData() {
    const birthdayCakesQuery = getProducts({ categorySlug: 'banh-sinh-nhat', limit: 6 });
    const latestArticlesQuery = getNewsArticles({ limit: 4, orderBy: 'publicationDate', order: 'desc' });

    const [birthdayCakes, latestArticles] = await Promise.all([
        birthdayCakesQuery,
        latestArticlesQuery,
    ]);

    let featuredProducts = birthdayCakes;
    if (birthdayCakes.length === 0) {
        // Fallback to any 6 products if no birthday cakes are found
        featuredProducts = await getProducts({ limit: 6 });
    }

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
