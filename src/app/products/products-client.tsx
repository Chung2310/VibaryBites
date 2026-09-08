
'use client';

import { ProductCard } from "@/components/product-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import type { Product, ProductCategory } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, usePathname } from 'next/navigation';
import { useCollection, useDatabase, useDataMemo } from '@/lib/data-client';
import { collection } from '@/lib/data-client';
import { Button } from "@/components/ui/button";
import { PackageOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

function ProductsContent({ initialProducts, initialCategories }: CatalogProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const database = useDatabase();

  // Fetch products directly in this component
  const productsCollection = useDataMemo(() => database ? collection(database, 'cakes') : null, [database]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsCollection, initialProducts);

  const categoriesCollection = useDataMemo(() => database ? collection(database, 'categories') : null, [database]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<ProductCategory>(categoriesCollection, initialCategories);

  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Define the desired order
  const desiredCategoryOrder = ["Bánh sinh nhật", "Bánh lẻ", "Bánh nướng", "Bánh Tea-Break"];

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => {
        const indexA = desiredCategoryOrder.indexOf(a.title);
        const indexB = desiredCategoryOrder.indexOf(b.title);
        // If a category is not in the desired order, push it to the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
  }, [categories]);

  useEffect(() => {
    if (isLoadingCategories || !sortedCategories || sortedCategories.length === 0) return;

    const categorySlugFromQuery = searchParams.get('category');
    // Default to the first category if none is in the query params
    const slugToHandle = categorySlugFromQuery || sortedCategories[0].slug;

    setActiveCategory(slugToHandle);

    if (categorySlugFromQuery) {
        const element = sectionRefs.current[categorySlugFromQuery];
        if (element) {
            element.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
    }
  }, [searchParams, sortedCategories, isLoadingCategories]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    window.history.pushState(null, "", `${pathname}?category=${encodeURIComponent(slug)}`);
  };

  const hasNoData = !isLoadingCategories && !isLoadingProducts && (!categories || categories.length === 0) && (!products || products.length === 0);

  return (
    <>
    <div className="bg-background min-h-[60vh]">
        {!hasNoData && (
            <nav className="sticky top-20 z-30 bg-background/80 backdrop-blur-lg border-b">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-start items-center h-16 space-x-6 overflow-x-auto">
                        {isLoadingCategories && Array.from({length: 4}).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-24" />
                        ))}
                        {sortedCategories.map(category => (
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
        )}

      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {hasNoData ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                <div className="bg-muted p-6 rounded-full">
                    <PackageOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h2 className="font-headline text-3xl">Chưa có sản phẩm nào</h2>
                    <p className="text-muted-foreground max-w-md font-fraunces">
                        Cửa hàng hiện chưa có dữ liệu. Hãy đăng nhập vào trang quản trị để thêm danh mục và sản phẩm đầu tiên nhé!
                    </p>
                </div>
                <Button asChild size="lg" className="rounded-full">
                    <Link href="/admin/products">
                        Đến Trang Quản Trị <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        ) : (
            (isLoadingCategories ? Array.from({length: 4}).map((_, i) => ({ id: `skel-${i}`, slug: `skel-${i}`, title: '', subtitle: '', description: ''})) : (sortedCategories || [])).map((category, index) => {
            if (isLoadingCategories) {
                return (
                    <section key={category.id} className="scroll-mt-24">
                        <div className="mb-12 pt-12 text-center">
                            <Skeleton className="h-4 w-1/4 mx-auto mb-2" />
                            <Skeleton className="h-12 w-1/2 mx-auto mb-2" />
                            <Skeleton className="h-4 w-3/4 mx-auto mt-4" />
                        </div>
                        <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 sm:divide-x">
                        {Array.from({ length: 3 }).map((_, i) => (
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
                        ))}
                        </div>
                        {index < (sortedCategories.length || 4) - 1 && (
                            <Separator className="my-16 sm:my-24" />
                        )}
                    </section>
                )
            }

            const categoryProducts = products?.filter(p => p.categorySlug === category.slug) || [];

            return (
                <section
                    key={category.slug}
                    id={category.slug}
                    ref={el => { sectionRefs.current[category.slug] = el; }}
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
                    {isLoadingProducts && categoryProducts.length === 0 ? (
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

                {index < (sortedCategories.length || 0) - 1 && (
                    <Separator className="my-16 sm:my-24" />
                )}
                </section>
            );
            })
        )}
      </div>
    </div>
    <AnnouncementBar />
    </>
  );
}

export default function ProductsClient(props: CatalogProps) {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-24 text-center">
        <div className="animate-pulse font-headline text-2xl">Đang tải danh sách sản phẩm...</div>
      </div>
    }>
      <ProductsContent {...props} />
    </Suspense>
  );
}

type CatalogProps = { initialProducts: Product[]; initialCategories: ProductCategory[] };
