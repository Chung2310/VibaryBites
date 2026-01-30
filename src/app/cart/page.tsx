"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, cartCount } = useAppStore();
  const { toast } = useToast();

  const firestore = useFirestore();
  // Fetch all products for stock checking
  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'cakes') : null, [firestore]);
  const { data: products } = useCollection<Product>(productsCollection);

  const handleUpdateQuantity = (id: string, quantity: number, size?: string) => {
    const product = products?.find(p => p.id === id);
    if (product && product.stock !== undefined && quantity > product.stock) {
        toast({
            variant: "destructive",
            title: "Số lượng tồn kho không đủ",
            description: `Chỉ còn ${product.stock} sản phẩm trong kho.`,
        });
        return;
    }
    updateQuantity(id, quantity, size);
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-4xl">Giỏ Hàng Của Bạn</h1>
      {cartCount === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground">Giỏ hàng của bạn đang trống.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul role="list" className="divide-y divide-border">
              {cartItems.map((item) => {
                const productInStock = products?.find(p => p.id === item.id);
                const stockAvailable = productInStock?.stock ?? 0;
                const hasStockIssue = productInStock ? item.quantity > stockAvailable : false;

                return (
                  <li key={`${item.id}-${item.size}`} className="flex py-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-foreground">
                          <h3>
                            <Link href={`/products/${item.slug}`}>{item.name}</Link>
                          </h3>
                          <p className="ml-4">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</p>
                        </div>
                        {item.size && <p className="mt-1 text-sm text-muted-foreground">{item.size}</p>}
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center border rounded-md">
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.size)}>
                                <Minus className="h-4 w-4" />
                           </Button>
                           <Input type="text" value={item.quantity} readOnly className="h-8 w-12 border-0 text-center bg-transparent" inputMode="numeric" />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.size)}>
                                <Plus className="h-4 w-4" />
                           </Button>
                        </div>

                        <div className="flex">
                          <Button variant="ghost" type="button" onClick={() => removeFromCart(item.id, item.size)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Xóa
                          </Button>
                        </div>
                      </div>
                       {hasStockIssue && (
                        <p className="mt-2 text-sm text-destructive">
                          Số lượng vượt quá tồn kho (chỉ còn {stockAvailable}). Vui lòng giảm số lượng.
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Tóm Tắt Đơn Hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span>Tạm tính</span>
                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Phí vận chuyển</span>
                        <span>Sẽ được tính khi thanh toán</span>
                    </div>
                     <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng</span>
                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full" size="lg" disabled={!products || cartItems.some(item => {
                        const product = products.find(p => p.id === item.id);
                        return product ? item.quantity > (product.stock ?? 0) : true;
                    })}>
                        <Link href="/checkout">Tiến hành thanh toán</Link>
                    </Button>
                </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
