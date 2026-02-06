
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React, {useRef, useEffect, useState} from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn, generateSlug } from '@/lib/utils';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import type { Product, NewsArticle, ProductCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';

const heroBanners = [
  {
    id: "hero-banner-1",
    title: "BST BÁNH ENTREMET DÀNH CHO",
    subtitle: "Mọi dịp đặc biệt của bạn",
    buttonText: "KHÁM PHÁ NGAY",
    buttonLink: "/products?collection=special-occasions",
    imageUrl: "https://res.cloudinary.com/dg7eosdgf/image/upload/w_1920,f_auto,q_auto/v1769694694/659b70c2531ac2845a273377_L1000281_m54va0.avif",
    description: "Beautifully crafted entremet cake on a platter.",
    imageHint: "entremet cake"
  },
  {
    id: "hero-banner-2",
    title: "HƯƠNG VỊ MÙA HÈ",
    subtitle: "Bánh Trái Cây Nhiệt Đới",
    buttonText: "THỬ NGAY",
    buttonLink: "/products",
    imageUrl: "https://res.cloudinary.com/dg7eosdgf/image/upload/w_1920,f_auto,q_auto/v1769694693/aMgSLmGNHVfTPPcR_120A8985_nof9r9.avif",
    description: "Close up shot of a slice of layered mousse cake.",
    imageHint: "mousse cake"
  },
  {
    id: "hero-banner-3",
    title: "QUÀ TẶNG TINH TẾ",
    subtitle: "Hộp Bánh Entremet Mini",
    buttonText: "XEM QUÀ TẶNG",
    buttonLink: "/products?category=banh-le",
    imageUrl: "https://res.cloudinary.com/dg7eosdgf/image/upload/w_1920,f_auto,q_auto/v1769694763/aC309ydWJ-7kSZ7y_LAFUONG_1.6_Cover_01_gejq78.avif",
    description: "A variety of colorful French pastries on display.",
    imageHint: "french pastry"
  },
  {
    id: "hero-banner-4",
    title: "NGHỆ THUẬT LÀM BÁNH",
    subtitle: "Tạo nên từ tâm huyết",
    buttonText: "VỀ CHÚNG TÔI",
    buttonLink: "/about",
    imageUrl: "https://res.cloudinary.com/dg7eosdgf/image/upload/w_1920,f_auto,q_auto/v1769694693/aFeOnnfc4bHWil8I_LF_Cover_Lovers_kccgcv.avif",
    description: "A baker decorating a modern cake with precision.",
    imageHint: "cake decorating"
  }
];

interface HomeClientProps {
  featuredProducts: Product[];
  latestArticles: NewsArticle[];
}

// Reusable component for scroll animations
const ScrollRevealWrapper = ({ children, delay = 0, amount = 0.2 }: { children: React.ReactNode, delay?: number, amount?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
            transition={{ duration: 0.8, delay, ease: [0.25, 0.25, 0.25, 0.75] }}
        >
            {children}
        </motion.div>
    );
};

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
                  sizes="100vw"
                  data-ai-hint={banner.imageHint}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="container relative mx-auto flex h-full max-w-7xl flex-col items-start justify-end px-4 pb-20 text-left sm:px-6 lg:px-8">
                   <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                    <h2 className="font-body text-xl tracking-widest uppercase">{banner.title}</h2>
                    <h1 className="font-headline text-5xl leading-tight md:text-7xl mt-2">
                        {banner.subtitle}
                    </h1>
                    <Button asChild size="lg" className="mt-8 rounded-full bg-white text-black hover:bg-white/90">
                        <Link href={banner.buttonLink}>{banner.buttonText}</Link>
                    </Button>
                  </motion.div>
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
    const router = useRouter();

    const categories = [
      { slug: 'banh-sinh-nhat', title: 'Bánh sinh nhật', subtitle: 'Cho ngày đặc biệt', imageId: 'category-birthday-cake' },
      { slug: 'banh-le', title: 'Bánh lẻ', subtitle: 'Thưởng thức mỗi ngày', imageId: 'category-sweet-cake' },
      { slug: 'banh-nuong', title: 'Bánh nướng', subtitle: 'Giòn tan, thơm lừng', imageId: 'category-other-cakes' },
      { slug: 'banh-tea-break', title: 'Bánh Tea-Break', subtitle: 'Cho tiệc trà & sự kiện', imageId: 'category-drinks' },
    ];
    
    const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
        e.preventDefault();
        router.push(`/products?category=${slug}`);
    };
  
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => {
              const image = PlaceHolderImages.find(p => p.id === category.imageId);
              return (
                <ScrollRevealWrapper key={category.slug} delay={index * 0.1}>
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
                </ScrollRevealWrapper>
              )
            })}
          </div>
        </div>
      </section>
    );
  }

function WorkshopSection() {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.muted = false;
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.muted = true;
        }
    };

    return (
        <section className="bg-[#F9F7F5] py-16 sm:py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    <ScrollRevealWrapper>
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
                                <Link href="https://www.tiktok.com/@vi_bary" target="_blank" rel="noopener noreferrer">THEO DÕI NGAY</Link>
                            </Button>
                        </div>
                    </ScrollRevealWrapper>
                    <ScrollRevealWrapper delay={0.2}>
                        <div 
                            className="relative aspect-video w-full overflow-hidden rounded-lg shadow-xl"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <video
                                ref={videoRef}
                                className="h-full w-full object-cover"
                                src="https://res.cloudinary.com/djnocnodz/video/upload/v1770360725/0206_2_fddalj.mp4"
                                loop
                                muted
                                playsInline
                                autoPlay
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            </div>
                        </div>
                    </ScrollRevealWrapper>
                </div>
            </div>
        </section>
    );
}

const MarqueeProductCard = React.memo(function MarqueeProductCard({ product }: { product: Product }) {
    const sanitizedSlug = product.slug || generateSlug(product.name);
    return (
      <div className="group/card relative mx-8 flex-shrink-0 w-96">
        <Link href={`/products/${sanitizedSlug}`} className="block">
          <div className="relative aspect-square">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={500}
              height={500}
              className="object-contain transition-transform duration-500 group-hover/card:scale-105"
            />
          </div>
          <div className="absolute inset-x-0 bottom-8">
            <div className="mx-auto w-fit rounded-full border border-black bg-white px-4 py-2 text-center text-sm font-semibold uppercase tracking-wider text-black shadow-md transition-all group-hover/card:shadow-lg">
              {product.name}
            </div>
          </div>
        </Link>
      </div>
    );
});
MarqueeProductCard.displayName = 'MarqueeProductCard';

function FeaturedProducts({ products: featuredDisplayProducts }: { products: Product[] }) {
    if (!featuredDisplayProducts || featuredDisplayProducts.length === 0) {
      return (
        <section className="py-16 sm:py-24 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
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
            <div className="w-full overflow-hidden mt-8">
                <div className="flex">
                    {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="relative mx-8 flex-shrink-0 w-96 aspect-square">
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
                <MarqueeProductCard key={`${product.id}-marquee`} product={product} />
            ))}
        </>
    );

    return (
        <section className="overflow-x-hidden bg-white py-16 sm:py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                 <ScrollRevealWrapper>
                    <div className="mb-16 text-center">
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
                 </ScrollRevealWrapper>
            </div>
            
            {featuredDisplayProducts.length > 0 && (
                <div className="group w-full overflow-hidden">
                    <div
                        className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused]"
                    >
                        <MarqueeItems items={featuredDisplayProducts} />
                        <MarqueeItems items={featuredDisplayProducts} />
                    </div>
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


function HotNews({ articles: latestArticles }: { articles: NewsArticle[] }) {
  const isLoading = !latestArticles;

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
         <ScrollRevealWrapper>
            <div className="mb-8">
                <h2 className="font-headline text-3xl md:text-4xl">Tin tức “nóng hổi”</h2>
            </div>
         </ScrollRevealWrapper>

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
              <ScrollRevealWrapper key={`${article.id}-${index}`} delay={index * 0.1}>
                <NewsArticleCard article={article} />
              </ScrollRevealWrapper>
            ))}
        </div>
      </div>
    </section>
  );
}


export function HomeClient({ featuredProducts, latestArticles }: HomeClientProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <div className="sticky top-20 z-30">
        <AnnouncementBar />
      </div>
      <main className="flex-grow">
        <FeaturedProducts products={featuredProducts} />
        <CategorySection />
        <WorkshopSection />
        <HotNews articles={latestArticles} />
      </main>
    </div>
  );
}
