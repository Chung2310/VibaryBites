
'use client';

import { ProductCard } from "@/components/product-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import type { ProductCategory } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const productCategories: ProductCategory[] = [
    { id: 'cat-banh-sinh-nhat', slug: 'banh-sinh-nhat', title: 'Bánh sinh nhật', subtitle: 'Cho ngày đặc biệt', description: 'Những chiếc bánh được trang trí lộng lẫy, hoàn hảo cho các bữa tiệc sinh nhật.' },
    { id: 'cat-banh-le', slug: 'banh-le', title: 'Bánh lẻ', subtitle: 'Thưởng thức mỗi ngày', description: 'Các loại bánh nhỏ, entremet, và bánh ngọt để bạn tự thưởng cho bản thân.' },
    { id: 'cat-banh-nuong', slug: 'banh-nuong', title: 'Bánh nướng', subtitle: 'Giòn tan, thơm lừng', description: 'Các loại bánh nướng cổ điển như bánh sừng bò, bánh tart, và nhiều hơn nữa.' },
    { id: 'cat-banh-tea-break', slug: 'banh-tea-break', title: 'Bánh Tea-Break', subtitle: 'Cho tiệc trà & sự kiện', description: 'Set bánh nhỏ gọn, đa dạng cho các buổi tiệc trà công ty hoặc sự kiện đặc biệt.' },
  ];

export default function ProductsPage() {
  const { products, isLoadingProducts } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const categorySlugFromQuery = searchParams.get('category');
    const slugToHandle = categorySlugFromQuery || productCategories[0].slug;
    
    setActiveCategory(slugToHandle);
    
    if (categorySlugFromQuery) {
        const element = sectionRefs.current[categorySlugFromQuery];
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
  }, [searchParams]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    router.push(`${pathname}?category=${slug}`, { scroll: false });
  };


  return (
    <>
    <div className="bg-background">
        <nav className="sticky top-20 z-30 bg-background/80 backdrop-blur-lg border-b">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-start items-center h-16 space-x-6 overflow-x-auto">
                    {productCategories.map(category => (
                        <a
                            key={category.slug}
                            href={`/products?category=${category.slug}`}
                            onClick={(e) => handleNavClick(e, category.slug)}
                            className={cn(
                                "text-sm font-lexend uppercase text-[#0A0A0A] hover:opacity-70 transition-all whitespace-nowrap pb-1",
                                activeCategory === category.slug ? 'border-b-2 border-[#0A0A0A]' : 'border-b-2 border-transparent'
                            )}
                        >
                            {category.title}
                        </a>
                    ))}
                </div>
            </div>
        </nav>

      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {productCategories.map((category, index) => {
          const categoryProducts = products.filter(p => p.categorySlug === category.slug);

          return (
            <section 
                key={category.slug} 
                id={category.slug} 
                ref={el => sectionRefs.current[category.slug] = el}
                className="scroll-mt-24"
            >
              <div className="mb-12 pt-12 text-center">
                <p className="text-sm uppercase tracking-widest text-muted-foreground">{category.subtitle}</p>
                <div className="inline-block text-left">
                  <h1 className="font-headline text-4xl md:text-5xl mt-2 uppercase font-bold">{category.title}</h1>
                  <Separator className="my-2 h-0.5 w-full bg-foreground" />
                </div>
                <p className="mx-auto mt-4 max-w-2xl text-lg font-fraunces text-muted-foreground">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 sm:divide-x">
                {isLoadingProducts ? (
                   Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="sm:px-8">
                      <div className="space-y-4">
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                        <Skeleton className="relative w-full aspect-square" />
                      </div>
                    </div>
                  ))
                ) : categoryProducts.length > 0 ? (
                    categoryProducts.map((product) => (
                        <div key={product.id} className="sm:px-8">
                            <ProductCard product={product} hideDescription={true} />
                        </div>
                    ))
                ) : (
                    <div className="sm:col-span-3 text-center text-muted-foreground py-8">
                        Chưa có sản phẩm nào trong danh mục này.
                    </div>
                )}
              </div>

              {index < productCategories.length - 1 && (
                <Separator className="my-16 sm:my-24" />
              )}
            </section>
          );
        })}
      </div>
    </div>
    <AnnouncementBar />
    </>
  );
}
