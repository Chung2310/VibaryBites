
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


  return (
    <Card className="group flex h-full flex-col overflow-hidden border-0 shadow-none bg-transparent rounded-none">
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full text-center">
        <div className="relative w-full overflow-hidden aspect-square flex-grow">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          )}
           {randomPositionClass && (
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
            <span className="text-sm text-foreground group-hover:font-semibold">Xem chi tiết</span>
        </div>
      </Link>
    </Card>
  );
}
