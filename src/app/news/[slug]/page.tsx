import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getArticleBySlug } from '@/lib/server-data';
export const dynamic = 'force-dynamic';
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    if (!article) notFound();
    const formattedDate = article.publicationDate
        ? new Date(article.publicationDate).toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : 'No date';

    return (
        <article>
        <header className="relative h-[50vh] min-h-[300px] w-full">
            {article.imageUrl && (
            <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
            />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
            <div className="container relative mx-auto flex h-full max-w-4xl flex-col justify-end px-4 py-12 text-white sm:px-6 lg:px-8">
                <p className="text-lg font-medium text-gray-300">{article.category} &bull; {formattedDate}</p>
                <h1 className="mt-2 font-headline text-4xl leading-tight md:text-5xl">
                    {article.title}
                </h1>
            </div>
        </header>

        <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div
            className="prose prose-lg mx-auto max-w-none prose-h2:font-headline prose-p:text-muted-foreground prose-blockquote:border-accent prose-blockquote:text-accent prose-blockquote:font-headline prose-a:text-accent hover:prose-a:text-accent/80 prose-img:rounded-lg prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: article.content }}
            />
        </div>
        </article>
    );
}
