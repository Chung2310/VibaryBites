
'use client';

import { useFirestore } from '@/firebase';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { notFound } from "next/navigation";
import Image from "next/image";
import type { NewsArticle } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

async function getArticleBySlug(firestore: any, slug: string): Promise<NewsArticle | null> {
    const articlesRef = collection(firestore, 'news_articles');
    const q = query(articlesRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const docData = querySnapshot.docs[0].data();
    return { ...docData, id: querySnapshot.docs[0].id } as NewsArticle;
}

export default function ArticleClient({ slug }: { slug: string }) {
  const firestore = useFirestore();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!firestore || !slug) return;

    const fetchArticle = async () => {
        setIsLoading(true);
        setError(false);
        try {
            const articleData = await getArticleBySlug(firestore, slug);
            if (!articleData) {
                setError(true);
            } else {
                setArticle(articleData);
            }
        } catch (e) {
            console.error("Error fetching article:", e);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchArticle();
  }, [firestore, slug]);
  
  if (isLoading) {
    return (
        <article>
            <header className="relative h-[50vh] min-h-[300px] w-full bg-muted">
                <Skeleton className="h-full w-full" />
            </header>
             <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-12 w-3/4 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
             </div>
        </article>
    );
  }

  if (error || !article) {
    notFound();
  }

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
