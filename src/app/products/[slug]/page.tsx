
'use client';

import { faqs } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/use-app-store';
import { notFound } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import type { Product, ProductCategory } from '@/lib/types';
import { cn, generateSlug } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    const { products, addToCart } = useAppStore();
    
    const firestore = useFirestore();
    const categoriesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
    const { data: productCategories } = useCollection<ProductCategory>(categoriesCollection);

    const product = products.find((p) => {
        const pSlug = p.slug || generateSlug(p.name);
        return pSlug === slug;
    });

    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
    const { toast } = useToast();
    
    useEffect(() => {
        if (product) {
            setSelectedSize(product.sizes?.[0]?.name);
        }
    }, [product]);

    if (!product) {
        if (products.length > 0) {
            notFound();
        }
        return (
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-16 w-3/4" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    const isOutOfStock = product.stock !== undefined && product.stock <= 0;
    const priceToShow = product.sizes?.find(s => s.name === selectedSize)?.price || product.price;
    
    const imageUrl = product.imageUrl;
    const detailedDescription = product.detailedDescription || {};

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart({
        id: product.id,
        name: product.name,
        price: priceToShow,
        imageUrl: product.imageUrl,
        slug: product.slug,
        quantity: quantity,
        size: selectedSize,
        });
        // Do not reset quantity here, user might want to add more later.
    };

    const handleIncreaseQuantity = () => {
        if (product && product.stock !== undefined) {
        if (quantity >= product.stock) {
            toast({
            variant: "destructive",
            title: "Số lượng tồn kho không đủ",
            description: `Chỉ còn ${product.stock} sản phẩm trong kho.`,
            });
            return;
        }
        }
        setQuantity((q) => q + 1);
    };
    
    const category = productCategories?.find(cat => cat.slug === product.categorySlug);
                            
    return (
        <>
        <div className="sticky top-20 z-30">
            <AnnouncementBar />
        </div>
        <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
            {/* Image Gallery */}
            <div className="relative h-fit">
                 <div className="aspect-square w-full overflow-hidden rounded-lg">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            width={800}
                            height={800}
                            className="h-full w-full object-cover"
                            priority
                        />
                    ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">No Image</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Product Info */}
            <div className="relative row-start-1 md:row-start-auto">
                <div className="md:sticky md:top-24">
                    {category && (
                        <p className="text-sm uppercase tracking-widest text-muted-foreground">{category.title}</p>
                    )}
                    <h1 className="font-headline text-6xl mt-2">{product.name}</h1>
                    
                    {isOutOfStock ? (
                        <p className="mt-8 text-lg font-medium text-destructive">Sản phẩm tạm hết hàng</p>
                    ) : (
                        <>
                            {product.sizes && product.sizes.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-bold tracking-wider text-sm uppercase">Kích thước</h3>
                                <div className="mt-4 flex flex-wrap gap-2">
                                {product.sizes.map((size) => (
                                    <Button
                                    key={size.name}
                                    variant={selectedSize === size.name ? 'default' : 'outline'}
                                    onClick={() => setSelectedSize(size.name)}
                                    className="rounded-full"
                                    >
                                    {size.name}
                                    </Button>
                                ))}
                                </div>
                            </div>
                            )}

                            <div className="mt-8 flex items-center gap-4">
                            <div className="flex items-center border rounded-md">
                                <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input type="text" value={quantity} readOnly className="h-11 w-11 border-0 text-center bg-transparent" inputMode="numeric" />
                                <Button variant="ghost" size="icon" className="h-11 w-11" onClick={handleIncreaseQuantity} >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button size="lg" onClick={handleAddToCart} className="flex-1 bg-black text-white hover:bg-black/80 rounded-md">
                                {`THÊM VÀO GIỎ • ${new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(priceToShow * quantity)}`}
                            </Button>
                            </div>
                        </>
                    )}


                    <div className="mt-10 space-y-6 border-t pt-8">
                    {product.subtitle && detailedDescription?.flavor && (
                        <div>
                            <h3 className="font-bold tracking-wider text-sm uppercase">{product.subtitle}</h3>
                            <p className="mt-2 text-muted-foreground leading-relaxed">{detailedDescription.flavor}</p>
                        </div>
                    )}
                    
                    {product.flavorProfile && product.flavorProfile.length > 0 && (
                        <div>
                            <h3 className="font-bold tracking-wider text-sm uppercase">CẢM GIÁC BÁNH</h3>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {product.flavorProfile.map(tag => (
                                    <div key={tag} className="px-4 py-1.5 rounded-full border text-sm">
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {product.structure && product.structure.length > 0 && (
                        <div>
                            <h3 className="font-bold tracking-wider text-sm uppercase">CẤU TRÚC VỊ BÁNH</h3>
                            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                {product.structure.map((layer, index) => (
                                    <div key={index} className="flex justify-between border-b pb-2">
                                        <span>Lớp {String(index + 1).padStart(2, '0')}</span>
                                        <span className="text-right text-foreground">{layer}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
            </div>

            {/* --- Secondary Details Section --- */}
            <div className="mt-16 border-t border-b">
                <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
                    {detailedDescription?.dimensions && (
                        <div className="py-8 md:pr-8">
                        <h4 className="font-bold tracking-wider text-sm uppercase mb-4">KÍCH THƯỚC</h4>
                        <p className="text-muted-foreground text-sm">{detailedDescription.dimensions}</p>
                        {detailedDescription.serving && <p className="text-muted-foreground text-sm mt-1">{detailedDescription.serving}</p>}
                        </div>
                    )}
                    {detailedDescription?.storage && (
                        <div className="py-8 md:px-8">
                        <h4 className="font-bold tracking-wider text-sm uppercase mb-4">HƯỚNG DẪN SỬ DỤNG</h4>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                            {detailedDescription.storage.split('. ').filter(s => s).map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ul>
                        </div>
                    )}
                    {detailedDescription?.accessories && detailedDescription.accessories.length > 0 && (
                        <div className="py-8 md:pl-8">
                        <h4 className="font-bold tracking-wider text-sm uppercase mb-4">PHỤ KIỆN ĐÍNH KÈM</h4>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                            {detailedDescription.accessories.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                        </div>
                    )}
                </div>
            </div>
            
            {/* --- FAQ Section --- */}
            <div className="mt-16 sm:mt-24 grid grid-cols-1 gap-12 sm:grid-cols-3">
                <div className="sm:col-span-1">
                    <h2 className="font-headline text-3xl">Câu hỏi thường gặp</h2>
                    <p className="mt-4 text-muted-foreground">
                        Một số câu hỏi thường gặp khi đặt bánh. Ngoài ra, bạn có thể xem chi tiết hơn tại mục{' '}
                        <Link href="/faq" className="font-medium text-foreground underline hover:text-accent">
                            Hỏi Đáp
                        </Link>.
                    </p>
                </div>
                <div className="sm:col-span-2">
                    <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                </div>
            </div>

        </div>
        </>
    );
}
