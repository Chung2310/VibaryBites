
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { generateSlug } from '@/lib/utils';

function NewsArticleCard({ article }: { article: NewsArticle }) {
  const formattedDate = article.publicationDate
    ? new Date(article.publicationDate).toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'No date';

  const sanitizedSlug = article.slug || generateSlug(article.title);

  return (
    <Link href={`/news/${sanitizedSlug}`} key={article.id}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-xl">
        {article.imageUrl && (
          <div className="aspect-[4/3] relative">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            {formattedDate} &bull; {article.category}
          </p>
          <CardTitle className="font-headline text-xl">{article.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground font-fraunces line-clamp-3">{article.excerpt}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function NewsArticleCardSkeleton() {
    return (
        <Card className="h-full overflow-hidden">
            <div className="aspect-[4/3] relative bg-muted">
                <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
        </Card>
    );
}


export default function NewsPage() {
  const firestore = useFirestore();
  const articlesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'news_articles') : null, [firestore]);
  const { data: articles, isLoading } = useCollection<NewsArticle>(articlesCollection);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="font-headline text-4xl md:text-5xl">Tin Tức & Câu Chuyện</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground font-fraunces">
          Từ hành trình của người sáng lập đến những góc nhìn hậu trường, hãy lặn sâu vào thế giới của VIBARY.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({length: 3}).map((_, i) => <NewsArticleCardSkeleton key={i} />)}
        {articles?.map((article) => (
          <NewsArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
