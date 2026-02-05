
"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from 'react';
import { generateSlug } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  hideStockStatus?: boolean;
  hideDescription?: boolean;
  hidePrice?: boolean;
  hideSubtitle?: boolean;
};

export function ProductCard({ product, hideStockStatus = false, hideDescription = false, hidePrice = false, hideSubtitle = false }: ProductCardProps) {
  const thumbnailUrl = product.imageUrl || '';
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const sanitizedSlug = product.slug || generateSlug(product.name);

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-0 shadow-none bg-transparent rounded-none">
      {!hideStockStatus && isOutOfStock && (
         <div className="absolute top-0 right-0 bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-4 z-10 text-center leading-tight">
            TẠM<br/>HẾT<br/>HÀNG
        </div>
      )}
      <Link 
        href={`/products/${sanitizedSlug}`} 
        className="flex flex-col h-full text-left"
      >
        <div className="p-4">
            <h3 className="font-headline text-2xl uppercase">{product.name}</h3>
            {!hideSubtitle && product.subtitle && (
              <p className="mt-1 font-fraunces text-sm uppercase tracking-wider text-muted-foreground">{product.subtitle}</p>
            )}
            {!hideDescription && <p className="text-sm text-muted-foreground mt-1 font-fraunces line-clamp-2">{product.description}</p>}
            {!hidePrice && (
              <p className="text-base font-medium mt-2">
                {product.price > 0
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.price)
                  : "Giá: Liên hệ"}
              </p>
            )}
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
