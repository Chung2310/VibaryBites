
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PackageOpen, ArrowRight, ChevronDown, LayoutGrid } from "lucide-react";
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
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => {
        const orderDifference = (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
        return orderDifference || a.title.localeCompare(b.title, 'vi');
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

  useEffect(() => {
    if (isLoadingCategories || sortedCategories.length === 0) return;

    let animationFrame = 0;
    const updateActiveCategory = () => {
      animationFrame = 0;
      const activationLine = window.scrollY + 176;
      let visibleCategory = sortedCategories[0].slug;

      for (const category of sortedCategories) {
        const section = sectionRefs.current[category.slug];
        if (section && section.offsetTop <= activationLine) visibleCategory = category.slug;
        else if (section) break;
      }

      setActiveCategory(current => current === visibleCategory ? current : visibleCategory);
    };
    const handleScroll = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateActiveCategory);
    };

    updateActiveCategory();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [isLoadingCategories, sortedCategories]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setActiveCategory(slug);
    setIsCategoryMenuOpen(false);
    window.history.pushState(null, "", `${pathname}?category=${encodeURIComponent(slug)}`);
    sectionRefs.current[slug]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hasNoData = !isLoadingCategories && !isLoadingProducts && (!categories || categories.length === 0) && (!products || products.length === 0);

  return (
    <>
    <div className="bg-background min-h-[60vh]">
        {!hasNoData && (
            <nav className="sticky top-20 z-30 bg-background/80 backdrop-blur-lg border-b">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <div className="hidden items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground sm:flex">
                            <LayoutGrid className="h-4 w-4" />
                            Khám phá theo danh mục
                        </div>
                        {isLoadingCategories ? (
                            <Skeleton className="h-10 w-full rounded-full sm:w-80" />
                        ) : (
                            <Popover open={isCategoryMenuOpen} onOpenChange={setIsCategoryMenuOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full min-w-0 justify-between rounded-full bg-background px-5 sm:w-80"
                                        aria-label="Chọn danh mục bánh"
                                    >
                                        <span className="truncate text-left">
                                            {sortedCategories.find(category => category.slug === activeCategory)?.title || 'Chọn danh mục'}
                                        </span>
                                        <span className="ml-3 flex shrink-0 items-center gap-2 text-muted-foreground">
                                            <ChevronDown className={cn("h-4 w-4 transition-transform", isCategoryMenuOpen && "rotate-180")} />
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    align="end"
                                    sideOffset={8}
                                    className="w-[calc(100vw-2rem)] max-w-4xl rounded-2xl p-3 sm:p-4"
                                >
                                    <div className="mb-3 px-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                        Chọn danh mục bánh
                                    </div>
                                    <div className="grid max-h-[65vh] grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                                        {sortedCategories.map(category => (
                                            <a
                                                key={category.slug}
                                                href={`/products?category=${category.slug}`}
                                                onClick={(event) => handleNavClick(event, category.slug)}
                                                aria-current={activeCategory === category.slug ? 'true' : undefined}
                                                className={cn(
                                                    "rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted",
                                                    activeCategory === category.slug && "bg-black text-white hover:bg-black/85"
                                                )}
                                            >
                                                {category.title}
                                            </a>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
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
                    className="scroll-mt-40"
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
