
'use client';

import { faqs } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAppStore } from '@/hooks/use-app-store';
import { notFound } from 'next/navigation';
import { Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default function ProductDetailClient({ slug }: { slug: string }) {
  const { products, addToCart } = useAppStore();
  const product = products.find((p) => p.slug === slug) as Product | undefined;
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes?.[0]?.name
  );
  
  if (!product) {
    // Let's give it a moment for the products to load from the store
    if (products.length > 0) {
      notFound();
    }
    // You might want to show a loading state here instead of an immediate notFound
    return <div>Đang tìm sản phẩm...</div>;
  }

  const priceToShow = product.sizes?.find(s => s.name === selectedSize)?.price || product.price;
  
  const images = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [];

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: priceToShow,
      imageUrl: images[0],
      slug: product.slug,
      quantity: quantity,
      size: selectedSize,
    });
    setQuantity(1);
  };

  const collectionTitle = product.collection === 'half-entremet' ? 'BÁNH NỬA ENTREMET' : 
                          product.collection === 'baby-collection' ? 'BÁNH PETIT' :
                          'BÁNH ENTREMET';
                          
  const detailedDescription = product.detailedDescription || {};

  return (
    <>
      <div className="sticky top-20 z-30">
        <AnnouncementBar />
      </div>
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
          
          {/* Image Gallery */}
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="relative flex aspect-square items-center justify-center p-0 overflow-hidden rounded-lg">
                        <Image
                          src={url}
                          alt={`${product.name} - image ${index + 1}`}
                          fill
                          className="object-cover w-full h-full"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
          
          {/* Product Info */}
          <div className="sticky top-24 h-fit">
              <div className="flex flex-col">
                <p className="text-sm uppercase tracking-widest text-muted-foreground">{collectionTitle}</p>
                <h1 className="font-headline text-6xl mt-2">{product.name}</h1>
                
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
                    <Input type="number" value={quantity} readOnly className="h-11 w-11 border-0 text-center bg-transparent" />
                    <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => setQuantity(q => q + 1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button size="lg" onClick={handleAddToCart} className="flex-1 bg-black text-white hover:bg-black/80 rounded-md">
                    THÊM VÀO GIỎ • {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(priceToShow * quantity)}
                  </Button>
                </div>

                <div className="mt-10 space-y-6 border-t pt-8">
                  {product.subtitle && (
                    <div>
                        <h3 className="font-bold tracking-wider text-sm uppercase">{product.subtitle}</h3>
                        {detailedDescription.flavor && <p className="mt-2 text-muted-foreground leading-relaxed">{detailedDescription.flavor}</p>}
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

        <div className="mt-16 border-t border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
            <div className="py-8 md:pr-8">
              <h4 className="font-bold tracking-wider text-sm uppercase mb-4">KÍCH THƯỚC</h4>
              <p className="text-muted-foreground text-sm">{detailedDescription.dimensions}</p>
              <p className="text-muted-foreground text-sm mt-1">{detailedDescription.serving}</p>
            </div>
            <div className="py-8 md:px-8">
              <h4 className="font-bold tracking-wider text-sm uppercase mb-4">HƯỚNG DẪN SỬ DỤNG</h4>
               {detailedDescription.storage && (
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                    {detailedDescription.storage.split('. ').filter(s => s).map((line, index) => (
                        <li key={index}>{line}</li>
                    ))}
                </ul>
               )}
            </div>
            <div className="py-8 md:pl-8">
              <h4 className="font-bold tracking-wider text-sm uppercase mb-4">PHỤ KIỆN ĐÍNH KÈM</h4>
              {detailedDescription.accessories && detailedDescription.accessories.length > 0 && (
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                    {detailedDescription.accessories.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>

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
