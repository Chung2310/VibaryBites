

"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import React from 'react';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';
import { useAppStore } from '@/hooks/use-app-store';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { NewsArticle } from '@/lib/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';


const marqueeVariantsLR = {
  animate: {
    x: ['-100%', '0%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 40,
        ease: "linear",
      },
    },
  },
};

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

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );
  
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
        plugins={[plugin.current]}
        className="w-full h-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
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
        { name: 'Bánh sinh nhật', description: 'Dành cho từ 2-10 người', imageId: 'category-birthday-cake' },
        { name: 'Bánh ngọt', description: 'Dành cho những tín đồ hảo ngọt', imageId: 'category-sweet-cake' },
        { name: 'Bánh mặn', description: 'Hương vị đậm đà khó cưỡng', imageId: 'category-salty-cake' },
        { name: 'Đồ uống', description: 'Giải nhiệt và thư giãn', imageId: 'category-drinks' },
        { name: 'Bánh khác', description: 'Khám phá những hương vị mới', imageId: 'category-other-cakes' },
        { name: 'Đồ ăn khác', description: 'Nhiều lựa chọn hấp dẫn khác', imageId: 'category-other-food' },
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
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
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
    const featuredProducts = [...products, ...products];

    return (
        <section className="py-12 sm:py-20 bg-white overflow-hidden">
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
             <motion.div 
                className="flex"
                variants={marqueeVariantsLR}
                animate="animate"
                whileHover={{ animationPlayState: 'paused' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
             >
                {featuredProducts.map((product, index) => (
                    <div key={`${product.id}-${index}`} className="flex-shrink-0 w-[90vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-1/4 px-4">
                        <ProductCard product={product} hideStockStatus={true} />
                    </div>
                ))}
            </motion.div>
        </section>
    );
}

function NewArrivals() {
  const { products } = useAppStore();
  const newProducts = products.slice(0, 4);
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-headline text-3xl md:text-4xl">Sản Phẩm Mới</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-fraunces text-muted-foreground">
            Tươi mới từ bếp bánh của chúng tôi, hãy khám phá những sáng tạo mới nhất.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newProducts.map((product) => (
             <div key={product.id} className="sm:px-8">
                <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HotNews() {
  const firestore = useFirestore();
  const articlesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'news_articles'),
      orderBy('publicationDate', 'desc'),
      limit(3) // Fetch 3 latest articles
    );
  }, [firestore]);

  const { data: latestArticles, isLoading } = useCollection<NewsArticle>(articlesQuery);

  const featuredArticle = latestArticles?.[0];
  const otherArticles = latestArticles?.slice(1) || [];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Skeleton className="w-full aspect-[4/3] rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        )}

        {featuredArticle && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <Link href={`/news/${featuredArticle.slug}`} className="group">
              <div className="w-full overflow-hidden rounded-lg aspect-[4/3]">
                {featuredArticle.imageUrl && (
                  <Image
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
            </Link>
            <div className="text-left">
              <span className="inline-block rounded-full border px-3 py-1 text-sm font-semibold">ĐỪNG BỎ LỠ</span>
              <h2 className="font-headline text-4xl md:text-5xl mt-4 group-hover:underline">
                <Link href={`/news/${featuredArticle.slug}`}>{featuredArticle.title}</Link>
              </h2>
              <p className="mt-4 text-muted-foreground font-fraunces">{featuredArticle.excerpt}</p>
              <Button asChild className="mt-6 bg-black text-white hover:bg-black/80 rounded-md font-bold" size="lg">
                <Link href={`/news/${featuredArticle.slug}`}>XEM NGAY</Link>
              </Button>
            </div>
          </div>
        )}

        {otherArticles.length > 0 && (
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {otherArticles.map((article) => (
              <Link href={`/news/${article.slug}`} key={article.id} className="group flex flex-col">
                <div className="w-full overflow-hidden rounded-lg aspect-[4/3]">
                  {article.imageUrl && (
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      width={600}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="mt-4 flex flex-grow flex-col">
                    <h3 className="font-headline text-xl group-hover:underline flex-grow">{article.title}</h3>
                    <p className="mt-2 text-sm font-fraunces text-muted-foreground line-clamp-2">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
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
      <NewArrivals />
      <WorkshopSection />
      <HotNews />
    </>
  );
}
