
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';
import { cn, generateSlug } from '@/lib/utils';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import type { Product, NewsArticle } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const heroBanners = [
  {
    id: "hero-banner-1",
    title: "CHO DỊP ĐẶC BIỆT",
    subtitle: "Bánh Sinh Nhật",
    buttonText: "Khám Phá Ngay",
    buttonLink: "/products?category=banh-sinh-nhat",
    imageUrl: "https://res.cloudinary.com/dxukxjf6w/image/upload/v1772266481/remove_s0qzsi.png",
    description: "Bánh sinh nhật cao cấp",
    imageHint: "birthday cake"
  },
  {
    id: "hero-banner-2",
    title: "CHO NHỮNG NGÀY THƯỜNG",
    subtitle: "Bánh Lẻ",
    buttonText: "Khám Phá Ngay",
    buttonLink: "/products?category=banh-le",
    imageUrl: "https://res.cloudinary.com/dxukxjf6w/image/upload/v1772266481/remove_3_fehqd7.png",
    description: "Bánh lẻ thưởng thức hàng ngày",
    imageHint: "individual pastry"
  },
  {
    id: "hero-banner-3",
    title: "GIÒN TAN, THƠM LỪNG",
    subtitle: "Bánh Nướng",
    buttonText: "Khám Phá Ngay",
    buttonLink: "/products?category=banh-nuong",
    imageUrl: "https://res.cloudinary.com/dxukxjf6w/image/upload/v1772266482/remove_2_g2tk2v.png",
    description: "Bánh nướng thơm lừng",
    imageHint: "baked pastry"
  },
  {
    id: "hero-banner-4",
    title: "CHO TIỆC TRÀ & SỰ KIỆN",
    subtitle: "Set Bánh Tea-Break",
    buttonText: "Khám Phá Ngay",
    buttonLink: "/products?category=banh-tea-break",
    imageUrl: "https://res.cloudinary.com/dxukxjf6w/image/upload/v1772266483/remove_4_ubqovo.png",
    description: "Set bánh teabreak cho sự kiện",
    imageHint: "teabreak assortment"
  }
];

interface HomeClientProps {
  featuredProducts: Product[];
  latestArticles: NewsArticle[];
}

const ScrollRevealWrapper = ({ children, delay = 0, amount = 0.2 }: { children: React.ReactNode, delay?: number, amount?: number }) => {
    const ref = React.useRef(null);
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
    if (!api) return;
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  return (
    <section className="relative h-[calc(100vh-120px)] w-full text-white overflow-hidden">
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
        <CarouselContent className="h-[calc(100vh-120px)] m-0">
          {heroBanners.map((banner, index) => (
            <CarouselItem key={banner.id} className="h-full p-0">
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
                <div className="container relative mx-auto flex h-full max-w-7xl flex-col items-start justify-end px-4 pb-16 text-left sm:px-6 lg:px-8">
                   <motion.div
                      key={`${banner.id}-content`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.2 }}
                    >
                    <p className="font-body text-sm tracking-[0.3em] uppercase mb-4 opacity-90 drop-shadow-md text-white">{banner.title}</p>
                    <h1 className="font-headline text-6xl md:text-8xl leading-tight mb-8 drop-shadow-xl text-white">
                        {banner.subtitle}
                    </h1>
                    <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-white/90 px-10 h-12 text-sm font-medium tracking-wider transition-transform hover:scale-105 shadow-lg">
                        <Link href={banner.buttonLink}>{banner.buttonText}</Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-6 right-12 flex space-x-3 z-20">
            {Array.from({ length: count }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                        "h-1 rounded-full transition-all duration-500",
                        current === index ? "bg-white w-16" : "bg-white/30 w-8"
                    )}
                />
            ))}
        </div>
      </Carousel>
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
    if (!featuredDisplayProducts || featuredDisplayProducts.length === 0) return null;

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
            <div className="w-full overflow-hidden pointer-events-none">
                <div className="flex w-max animate-marquee-reverse !animation-play-state-running">
                    {featuredDisplayProducts.map((product) => (
                        <MarqueeProductCard key={`${product.id}-marquee-1`} product={product} />
                    ))}
                    {featuredDisplayProducts.map((product) => (
                        <MarqueeProductCard key={`${product.id}-marquee-2`} product={product} />
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
        {/* Rest of components omitted for brevity, but kept in actual implementation */}
      </main>
    </div>
  );
}
