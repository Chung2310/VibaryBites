

"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from 'react';

type ProductCardProps = {
  product: Product;
};

const positionClasses = [
  'justify-center items-center',
  'justify-start items-end',
  'justify-end items-start',
  'justify-start items-start',
  'justify-end items-end'
];

export function ProductCard({ product }: ProductCardProps) {
  const [randomPositionClass, setRandomPositionClass] = useState('');

  useEffect(() => {
    // This will only run on the client, after hydration
    // ensuring no server-client mismatch.
    setRandomPositionClass(positionClasses[Math.floor(Math.random() * positionClasses.length)]);
  }, []);

  const thumbnailUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '';
  const isOutOfStock = product.stock <= 0;


  return (
    <Card className="group flex h-full flex-col overflow-hidden border-0 shadow-none bg-transparent rounded-none">
      <Link 
        href={isOutOfStock ? '#' : `/products/${product.slug}`} 
        className={cn("flex flex-col h-full text-center", isOutOfStock && "pointer-events-none cursor-not-allowed")}
        aria-disabled={isOutOfStock}
        tabIndex={isOutOfStock ? -1 : undefined}
      >
        <div className="relative w-full overflow-hidden aspect-square flex-grow">
          {thumbnailUrl && (
            <Image
              src={thumbnailUrl}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          )}
           {isOutOfStock && (
             <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10">
                <span className="font-headline text-lg text-foreground border border-foreground px-4 py-2 rounded-full">Hết hàng</span>
            </div>
           )}
           {randomPositionClass && !isOutOfStock && (
             <div className={cn(
                "absolute inset-0 p-8 flex flex-col transition-opacity duration-300",
                randomPositionClass
             )}>
                <div className="bg-white text-black border border-black rounded-full px-4 py-1.5 inline-block">
                    <span className="text-xs font-body uppercase tracking-wider font-bold">{product.name}</span>
                </div>
             </div>
           )}
        </div>
        <div className="p-4 border-t border-transparent group-hover:border-foreground/20 transition-colors">
            <span className={cn("text-sm text-foreground", isOutOfStock ? "text-muted-foreground" : "group-hover:font-semibold")}>
              {isOutOfStock ? "Đã hết hàng" : "Xem chi tiết"}
            </span>
        </div>
      </Link>
    </Card>
  );
}
