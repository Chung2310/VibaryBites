

'use client';

import { ProductCard } from "@/components/product-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { productCategories } from "@/lib/data";

export default function ProductsPage() {
  const { products } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('banh-sinh-nhat');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px', threshold: 0 }
    );

    productCategories.forEach((category) => {
      const el = sectionRefs.current[category.slug];
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      productCategories.forEach((category) => {
        const el = sectionRefs.current[category.slug];
        if (el) {
          observer.unobserve(el);
        }
      });
    };
  }, []);


  return (
    <>
    <div className="bg-background">
        <nav className="sticky top-20 z-30 bg-background/80 backdrop-blur-lg border-b">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-start items-center h-16 space-x-6 overflow-x-auto">
                    {productCategories.map(category => (
                        <a
                            key={category.slug}
                            href={`#${category.slug}`}
                            onClick={() => setActiveCategory(category.slug)}
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
                {categoryProducts.length > 0 ? (
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
