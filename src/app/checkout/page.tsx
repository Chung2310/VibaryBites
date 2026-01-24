
"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

import { useFirestore } from "@/firebase";
import { runTransaction, doc } from "firebase/firestore";
import type { Product } from "@/lib/types";

const checkoutSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }),
  phone: z.string().min(10, { message: "Vui lòng nhập số điện thoại hợp lệ." }),
  address: z.string().min(5, { message: "Vui lòng nhập địa chỉ hợp lệ tại Bắc Ninh." }),
  notes: z.string().optional(),
});

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useAppStore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    setIsSubmitting(true);
    
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể kết nối đến cơ sở dữ liệu để cập nhật kho."
        });
        setIsSubmitting(false);
        return;
    }

    try {
        await runTransaction(firestore, async (transaction) => {
            const stockIssues: string[] = [];

            const productRefsAndQuantities = cartItems.map(item => ({
                ref: doc(firestore, 'cakes', item.id),
                quantity: item.quantity,
                name: item.name
            }));
            
            const productDocs = await Promise.all(
                productRefsAndQuantities.map(pq => transaction.get(pq.ref))
            );

            for (let i = 0; i < productDocs.length; i++) {
                const productDoc = productDocs[i];
                const cartItemInfo = productRefsAndQuantities[i];

                if (!productDoc.exists()) {
                    throw new Error(`Sản phẩm "${cartItemInfo.name}" không tìm thấy trong cơ sở dữ liệu.`);
                }

                const productData = productDoc.data() as Product;
                const currentStock = productData.stock ?? 0;
                
                if (currentStock < cartItemInfo.quantity) {
                    stockIssues.push(`${cartItemInfo.name} (chỉ còn ${currentStock} sản phẩm)`);
                }
            }

            if (stockIssues.length > 0) {
                throw new Error(`Không đủ hàng cho: ${stockIssues.join(', ')}.`);
            }

            // If all stock checks pass, perform the updates
            for (let i = 0; i < productDocs.length; i++) {
                const cartItemInfo = productRefsAndQuantities[i];
                const productData = productDocs[i].data() as Product;
                const newStock = (productData.stock ?? 0) - cartItemInfo.quantity;
                transaction.update(cartItemInfo.ref, { stock: newStock });
            }
        });
    } catch (error: any) {
        console.error("Transaction failed: ", error);
        toast({
            variant: "destructive",
            title: "Lỗi đặt hàng",
            description: error.message || "Không thể cập nhật số lượng tồn kho. Vui lòng thử lại.",
        });
        setIsSubmitting(false);
        return;
    }

    const API_URL = '/api/submit-order';

    const orderId = `VBR-${Date.now().toString().slice(-6)}`;
    const orderTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const productsString = cartItems
        .map(item => `${item.name}${item.size ? ` (${item.size})` : ''} (x${item.quantity})`)
        .join('; ');

    const payload = {
        orderId,
        orderTime,
        customerName: values.name,
        phone: values.phone,
        address: values.address,
        notes: values.notes || '',
        products: productsString,
        totalPrice: new Intl.NumberFormat('vi-VN').format(totalPrice) + 'đ'
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        
        const responseData = await response.json();

        if (response.ok && responseData.result === 'success') {
            toast({
                title: "Đơn hàng đã được gửi!",
                description: "Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ để xác nhận sớm."
            });
            clearCart();
            router.push('/');
        } else {
             throw new Error(responseData.error || 'API route báo lỗi không xác định.');
        }

    } catch (error) {
        console.error('Error submitting order:', error);
        toast({
            variant: "destructive",
            title: "Ôi, đã có lỗi xảy ra!",
            description: `Không thể gửi đơn hàng của bạn. Vui lòng thử lại sau hoặc liên hệ hotline. Chi tiết lỗi: ${(error as Error).message}`
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (cartItems.length === 0) {
    return (
        <div className="container mx-auto text-center py-20">
            <h1 className="font-headline text-2xl">Giỏ hàng của bạn đang trống.</h1>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h1 className="font-headline text-3xl mb-8">Thanh Toán</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Thông Tin Giao Hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và Tên</FormLabel>
                        <FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số Điện Thoại</FormLabel>
                        <FormControl><Input placeholder="0987654321" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ (chỉ giao tại Bắc Ninh)</FormLabel>
                        <FormControl><Input placeholder="123 Phố Example, Phường ABC, TP Bắc Ninh" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú</FormLabel>
                        <FormControl><Textarea placeholder="Vd: Giao hàng cho lễ tân, bánh không cần nến,..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi đơn hàng...
                    </>
                ) : 'Hoàn tất đơn hàng'}
            </Button>
            </form>
          </Form>
        </div>
        <div className="lg:col-span-2">
            <Card className="sticky top-24">
                <CardHeader>
                    <CardTitle className="font-headline">Tóm Tắt Đơn Hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 divide-y">
                     {cartItems.map(item => (
                            <div key={`${item.id}-${item.size}`} className="flex items-center pt-4">
                                <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                    {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
                                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">{item.quantity}</span>
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    {item.size && <p className="text-sm text-muted-foreground">{item.size}</p>}
                                </div>
                                <p className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</p>
                            </div>
                         )
                     )}
                     <div className="space-y-2 pt-4">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Tạm tính</span>
                            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
                        </div>
                         <div className="flex justify-between text-muted-foreground">
                            <span>Phí vận chuyển</span>
                            <span>Miễn phí</span>
                        </div>
                         <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Tổng cộng</span>
                            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
