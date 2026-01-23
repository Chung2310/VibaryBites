
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/hooks/use-app-store';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { NewsArticle } from '@/lib/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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
    const categories = [
        { name: 'Bánh sinh nhật', description: 'Những chiếc bánh cho ngày đặc biệt', imageId: 'category-birthday-cake' },
        { name: 'Bánh lẻ', description: 'Thưởng thức hương vị mỗi ngày', imageId: 'category-sweet-cake' },
        { name: 'Bánh nướng', description: 'Giòn tan, thơm lừng từ lò nướng', imageId: 'category-other-cakes' },
        { name: 'Bánh Tea-Break', description: 'Set bánh cho tiệc trà & sự kiện', imageId: 'category-drinks' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
            },
        },
    };
  
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {categories.map((category) => {
              const image = PlaceHolderImages.find((p) => p.id === category.imageId);
              return (
                  <motion.div key={category.name} variants={itemVariants}>
                    <Link
                      href="/products"
                      className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105"
                    >
                      {image && (
                          <Image
                              src={image.imageUrl}
                              alt={category.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              data-ai-hint={image.imageHint}
                          />
                      )}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
                          <div>
                            <h3 className="font-lexend text-base font-medium tracking-wide text-foreground">
                                {category.name}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground font-fraunces">{category.description}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>
    );
  }

function WorkshopSection() {
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
                className="h-full w-full object-cover"
                src="https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0850828234.firebasestorage.app/o/FOODIE_1762401489.mp4?alt=media&token=2d8a68ba-f209-4749-befa-e507624cc36d" 
                autoPlay 
                loop 
                muted 
                playsInline
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

    if (birthdayCakes.length === 0) {
        return null;
    }

    const marqueeProducts = [...birthdayCakes, ...birthdayCakes];

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
                 <div className="w-full overflow-hidden">
                    <motion.div
                        className="flex"
                        animate={{
                            x: ['-50%', '0%'],
                            transition: {
                                x: {
                                    repeat: Infinity,
                                    repeatType: 'loop',
                                    duration: 80,
                                    ease: 'linear',
                                },
                            },
                        }}
                    >
                        {marqueeProducts.map((product, index) => (
                            <div key={`${product.id}-${index}`} className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2">
                                <ProductCard 
                                    product={product} 
                                    hideDescription={true}
                                    hidePrice={true}
                                />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function NewsArticleCard({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/news/${article.slug}`} className="flex-shrink-0 w-64 md:w-80 group">
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
