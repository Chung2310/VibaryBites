
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn, generateSlug } from '@/lib/utils';
import { useAppStore } from '@/hooks/use-app-store';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Product, NewsArticle, ProductCategory } from '@/lib/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRouter, usePathname } from 'next/navigation';

const heroBanners = [
  {
    id: "hero-banner-1",
    title: "BST BÁNH ENTREMET DÀNH CHO",
    subtitle: "Mọi dịp đặc biệt của bạn",
    buttonText: "KHÁM PHÁ NGAY",
    buttonLink: "/products?collection=special-occasions",
    imageUrl: "/images/banner/1.webp",
    description: "Beautifully crafted entremet cake on a platter.",
    imageHint: "entremet cake"
  },
  {
    id: "hero-banner-2",
    title: "BST BÁNH ENTREMET DÀNH CHO",
    subtitle: "Mọi dịp đặc biệt của bạn",
    buttonText: "KHÁM PHÁ NGAY",
    buttonLink: "/products?collection=special-occasions",
    imageUrl: "/images/banner/2.webp",
    description: "Close up shot of a slice of layered mousse cake.",
    imageHint: "mousse cake"
  },
  {
    id: "hero-banner-3",
    title: "BST BÁNH ENTREMET DÀNH CHO",
    subtitle: "Mọi dịp đặc biệt của bạn",
    buttonText: "KHÁM PHÁ NGAY",
    buttonLink: "/products?collection=special-occasions",
    imageUrl: "/images/banner/3.webp",
    description: "A variety of colorful French pastries on display.",
    imageHint: "french pastry"
  },
  {
    id: "hero-banner-4",
    title: "BST BÁNH ENTREMET DÀNH CHO",
    subtitle: "Mọi dịp đặc biệt của bạn",
    buttonText: "KHÁM PHÁ NGAY",
    buttonLink: "/products?collection=special-occasions",
    imageUrl: "/images/banner/4.webp",
    description: "A baker decorating a modern cake with precision.",
    imageHint: "cake decorating"
  },
  {
    id: "hero-banner-5",
    title: "BST BÁNH ENTREMET DÀNH CHO",
    subtitle: "Mọi dịp đặc biệt của bạn",
    buttonText: "KHÁM PHÁ NGAY",
    buttonLink: "/products?collection=special-occasions",
    imageUrl: "/images/banner/5.webp",
    description: "Luxurious chocolate entremet with a glossy finish.",
    imageHint: "chocolate entremet"
  }
];


function Hero() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])


  return (
    <section className="relative h-screen w-full text-white">
      <Carousel
        setApi={setApi}
        className="w-full h-full"
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
          }),
        ]}
      >
        <CarouselContent className="h-screen">
          {heroBanners.map((banner, index) => (
            <CarouselItem key={banner.id} className="h-full">
              <div className="relative w-full h-full">
                <Image
                  src={banner.imageUrl}
                  alt={banner.description}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  data-ai-hint={banner.imageHint}
                />
                
                <div className="container relative mx-auto flex h-full max-w-7xl flex-col items-start justify-end px-4 pb-20 text-left sm:px-6 lg:px-8">
                  <h2 className="font-body text-xl tracking-widest uppercase">{banner.title}</h2>
                  <h1 className="font-headline text-5xl leading-tight md:text-7xl mt-2">
                    {banner.subtitle}
                  </h1>
                  <Button asChild size="lg" className="mt-8 rounded-full bg-white text-black hover:bg-white/90">
                    <Link href={banner.buttonLink}>{banner.buttonText}</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-8 right-8 flex space-x-2">
            {Array.from({ length: count }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                        "h-1.5 w-12 rounded-full transition-all duration-300",
                        current === index ? "bg-white" : "bg-white/30"
                    )}
                />
            ))}
        </div>
      </Carousel>
    </section>
  );
}

function CategorySection() {
    const firestore = useFirestore();
    const categoriesCollection = useMemoFirebase(() => firestore ? query(collection(firestore, 'product_categories'), limit(4)) : null, [firestore]);
    const { data: categories, isLoading } = useCollection<ProductCategory>(categoriesCollection);
    const router = useRouter();

    const categoryImageMap: Record<string, string> = {
        'banh-sinh-nhat': 'category-birthday-cake',
        'banh-le': 'category-sweet-cake',
        'banh-nuong': 'category-other-cakes',
        'banh-tea-break': 'category-drinks',
    };
    
    const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
        e.preventDefault();
        router.push(`/products?category=${slug}`);
    };
  
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] w-full">
                        <Skeleton className="h-full w-full rounded-2xl" />
                    </div>
                ))
            ) : (
                categories?.map((category) => {
                const imageId = categoryImageMap[category.slug] || 'category-birthday-cake';
                const image = PlaceHolderImages.find(p => p.id === imageId);
                return (
                    <div key={category.slug}>
                        <Link
                            href={`/products?category=${category.slug}`}
                            onClick={(e) => handleCategoryClick(e, category.slug)}
                            className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105"
                        >
                        {image && (
                            <Image
                                src={image.imageUrl}
                                alt={category.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                data-ai-hint={image.imageHint}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between rounded-lg bg-white/90 backdrop-blur-sm p-4 shadow-md">
                                <div>
                                    <h3 className="font-lexend text-base font-medium tracking-wide text-foreground">
                                        {category.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground font-fraunces">{category.subtitle}</p>
                                </div>
                            </div>
                        </div>
                        </Link>
                    </div>
                )
                })
            )}
          </div>
        </div>
      </section>
    );
  }

function WorkshopSection() {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        const video = videoRef.current;
        if (video) {
            // Ensure it's muted, as this is often a requirement for autoplay
            video.muted = true; 
            // Attempt to play the video
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Autoplay was prevented. This is common in some browsers.
                    // The user might need to interact with the page first.
                    console.error("Video autoplay was prevented:", error);
                });
            }
        }
    }, []);

    return (
        <section className="bg-[#F9F7F5] py-16 sm:py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    <div className="text-center lg:text-left">
                        <p className="font-body text-sm uppercase tracking-widest text-muted-foreground">
                            MỘT NGÀY TẠI XƯỞNG
                        </p>
                        <h2 className="mt-4 font-headline text-4xl md:text-5xl">
                            Công việc mà chúng tôi yêu thích mỗi ngày
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg font-fraunces text-muted-foreground">
                            Ghé thăm Tiktok của VIBARY để xem những tư liệu chân thực
                            nhất – về cách mà chúng tôi hoàn thiện một chiếc bánh thật tinh tế
                            gửi trao tới bạn.
                        </p>
                        <Button asChild className="mt-8 bg-black text-white hover:bg-black/80 rounded-full font-bold" size="lg">
                            <Link href="#">THEO DÕI NGAY</Link>
                        </Button>
                    </div>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-xl">
                        <video
                            ref={videoRef}
                            className="h-full w-full object-cover"
                            src="https://videos.pexels.com/video-files/4782845/4782845-hd_1920_1080_25fps.mp4"
                            loop
                            muted
                            playsInline
                            autoPlay
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}


function FeaturedProducts() {
    const { products } = useAppStore();
    const birthdayCakes = products.filter(p => p.categorySlug === 'banh-sinh-nhat');
    
    const ProductMarqueeItem = ({ product }: { product: Product }) => {
        const sanitizedSlug = product.slug || generateSlug(product.name);
        const thumbnailUrl = product.imageUrl || '';

        return (
            <div className="flex-shrink-0 w-64 sm:w-72 mx-4">
                 <Link href={`/products/${sanitizedSlug}`} className="group block text-center">
                    <div className="relative w-full overflow-hidden aspect-square rounded-lg shadow-sm">
                        {thumbnailUrl ? (
                             <Image
                                src={thumbnailUrl}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground text-sm">No Image</span>
                            </div>
                        )}
                    </div>
                    <h3 className="mt-4 font-headline text-xl uppercase group-hover:text-primary transition-colors truncate">
                        {product.name}
                    </h3>
                </Link>
            </div>
        );
    };

    if (birthdayCakes.length === 0) {
        return null;
    }

    return (
        <section className="py-12 sm:py-20 bg-white">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl md:text-4xl">Mang tới trải nghiệm<br/>đặt bánh Pháp cao cấp trực tuyến</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg font-fraunces text-muted-foreground">
                        VIBARY có mặt tại đây là để mang tới cho bạn trải nghiệm thưởng thức bánh ngọt Pháp hiện đại, dành cho người Việt.
                    </p>
                    <Button asChild className="mt-8 bg-black text-white hover:bg-black/80 rounded-full font-bold" variant="default" size="lg">
                        <Link href="/products">ĐẶT BÁNH NGAY</Link>
                    </Button>
                </div>
            </div>
            
            <div className="w-full overflow-x-auto mt-8">
                <div className="flex animate-marquee hover:pause">
                    {[...birthdayCakes, ...birthdayCakes, ...birthdayCakes, ...birthdayCakes].map((product, index) => (
                       <ProductMarqueeItem key={`${product.id}-${index}`} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function NewsArticleCard({ article }: { article: NewsArticle }) {
  const sanitizedSlug = article.slug || generateSlug(article.title);
  return (
    <Link href={`/news/${sanitizedSlug}`} className="flex-shrink-0 w-64 md:w-80 group">
      <div className="overflow-hidden rounded-lg">
        <Image
          src={article.imageUrl}
          alt={article.title}
          width={320}
          height={240}
          className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
        <h3 className="text-lg leading-snug">{article.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground font-fraunces line-clamp-2">{article.excerpt}</p>
      </div>
    </Link>
  );
}


function HotNews() {
  const firestore = useFirestore();
  const articlesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'news_articles'),
      orderBy('publicationDate', 'desc'),
      limit(4) // Fetch 4 articles
    );
  }, [firestore]);

  const { data: latestArticles, isLoading } = useCollection<NewsArticle>(articlesQuery);

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
         <div className="mb-8">
            <h2 className="font-headline text-3xl md:text-4xl">Tin tức “nóng hổi”</h2>
        </div>

        <div className="flex space-x-8 overflow-x-auto pb-4 -mx-4 px-4">
            {isLoading && Array.from({length: 4}).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 md:w-80 space-y-4">
                    <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            ))}
            {latestArticles?.map((article, index) => (
              <NewsArticleCard key={`${article.id}-${index}`} article={article} />
            ))}
             {/* Add an empty div for spacing at the end of the scroll */}
            <div className="flex-shrink-0 w-1"></div>
        </div>
      </div>
    </section>
  );
}


export default function Home() {
  return (
    <>
      <Hero />
      <div className="sticky top-20 z-30">
        <AnnouncementBar />
      </div>
      <FeaturedProducts />
      <CategorySection />
      <WorkshopSection />
      <HotNews />
    </>
  );
}
