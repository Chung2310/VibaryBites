

import ArticleClient from './article-client';

// Server component to fetch slug and pass to client component
export default function ArticlePage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    return <ArticleClient slug={slug} />;
}
