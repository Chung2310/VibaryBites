

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

export function ProductCard({ product }: ProductCardProps) {
  const thumbnailUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '';
  const isOutOfStock = product.stock <= 0;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-0 shadow-none bg-transparent rounded-none">
      {isOutOfStock && (
         <div className="absolute top-0 right-0 bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-4 z-10 text-center leading-tight">
            TẠM<br/>HẾT<br/>HÀNG
        </div>
      )}
      <Link 
        href={`/products/${product.slug}`} 
        className="flex flex-col h-full text-left"
      >
        <div className="p-4">
            <h3 className="font-headline text-2xl uppercase">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{product.subtitle}</p>
            <p className="text-base font-medium mt-2">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
            </p>
        </div>
        <div className="relative w-full overflow-hidden aspect-square flex-grow mt-auto">
          {thumbnailUrl && (
            <Image
              src={thumbnailUrl}
              alt={product.name}
              fill
              className={cn("object-contain transition-transform duration-300 ease-in-out group-hover:scale-105", isOutOfStock && "opacity-60")}
            />
          )}
        </div>
      </Link>
    </Card>
  );
}
