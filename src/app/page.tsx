"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React, {useRef, useEffect} from 'react';
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
import { motion } from 'framer-motion';

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
    const pathname = usePathname();

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
     const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Autoplay was prevented:", error);
            });
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
                            src="https://res.cloudinary.com/dqhgnzmtk/video/upload/v1769312690/6138261-uhd_3840_2160_25fps_dqlliq.mp4"
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

const marqueeVariantsReverse = {
  animate: {
    x: ['-50%', '0%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 80,
        ease: "linear",
      },
    },
  },
};

function MarqueeProductCard({ product }: { product: Product }) {
    const sanitizedSlug = product.slug || generateSlug(product.name);
    return (
        <div className="relative mx-8 flex-shrink-0 w-80">
            <Link href={`/products/${sanitizedSlug}`} className="group block">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={800}
                    height={800}
                    className="h-auto w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                    <div className="whitespace-nowrap rounded-full border border-black bg-white/80 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-black shadow-md backdrop-blur-sm transition-all group-hover:bg-white">
                        {product.name}
                    </div>
                </div>
            </Link>
        </div>
    );
}

function FeaturedProducts() {
    const { products, isLoadingProducts } = useAppStore();

    const birthdayCakes = products.filter(p => p.categorySlug === 'banh-sinh-nhat');
    const featuredDisplayProducts = (birthdayCakes.length > 0 ? birthdayCakes : products).slice(0, 6);

    if (isLoadingProducts && featuredDisplayProducts.length === 0) {
      return (
        <section className="py-12 sm:py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Skeleton className="h-10 w-3/4 mx-auto" />
              <Skeleton className="h-8 w-1/2 mx-auto mt-6" />
              <Skeleton className="h-12 w-48 mx-auto mt-8 rounded-full" />
            </div>
            <div className="w-full overflow-hidden mt-8">
                <div className="flex">
                    {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="relative mx-8 flex-shrink-0 w-80 aspect-square">
                            <Skeleton className="h-full w-full"/>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>
      )
    }

    const MarqueeItems = ({ items }: { items: Product[] }) => (
        <>
            {items.map((product) => (
                <MarqueeProductCard key={product.id} product={product} />
            ))}
        </>
    );

    return (
        <section className="overflow-x-clip bg-white py-16 sm:py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-24 text-center">
                    <h2 className="font-headline text-4xl md:text-5xl">
                        Mang tới trải nghiệm<br/>đặt bánh Pháp cao cấp trực tuyến
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-lg font-fraunces text-muted-foreground">
                        Những chiếc bánh được trang trí lộng lẫy, hoàn hảo cho các bữa tiệc sinh nhật.
                    </p>
                    <div className="mt-8">
                        <Button asChild className="rounded-full bg-black text-white hover:bg-black/80 font-bold" size="lg">
                            <Link href="/products?category=banh-sinh-nhat">ĐẶT BÁNH NGAY</Link>
                        </Button>
                    </div>
                </div>
            </div>
            
            {featuredDisplayProducts.length > 0 && (
                <div className="w-full overflow-hidden">
                    <motion.div
                        className="flex"
                        variants={marqueeVariantsReverse}
                        animate="animate"
                    >
                        <MarqueeItems items={featuredDisplayProducts} />
                        <MarqueeItems items={featuredDisplayProducts} />
                    </motion.div>
                </div>
            )}
        </section>
    );
}

function NewsArticleCard({ article }: { article: NewsArticle }) {
  const sanitizedSlug = article.slug || generateSlug(article.title);
  return (
    <Link href={`/news/${sanitizedSlug}`} className="group">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading && Array.from({length: 4}).map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            ))}
            {latestArticles?.map((article, index) => (
              <NewsArticleCard key={`${article.id}-${index}`} article={article} />
            ))}
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
