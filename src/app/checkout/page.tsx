

"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const checkoutSchema = z.object({
  buyerName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }),
  buyerPhone: z.string().min(10, { message: "Vui lòng nhập số điện thoại hợp lệ." }),
  isGift: z.boolean().default(false),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  giftMessage: z.string().optional(),
  address: z.string().min(5, { message: "Vui lòng nhập địa chỉ hợp lệ tại Bắc Ninh." }),
  deliveryDate: z.string().min(1, { message: "Vui lòng chọn ngày giao hàng." }),
  deliveryTime: z.string().min(1, { message: "Vui lòng chọn thời gian giao hàng." }),
  paymentMethod: z.enum(["momo", "zalopay", "bank", "cod"], { required_error: "Vui lòng chọn phương thức thanh toán." }),
}).refine(data => {
    if (data.isGift) {
        return !!data.recipientName && data.recipientName.length >= 2;
    }
    return true;
}, {
    message: "Tên người nhận phải có ít nhất 2 ký tự.",
    path: ["recipientName"],
}).refine(data => {
    if (data.isGift) {
        return !!data.recipientPhone && data.recipientPhone.length >= 10;
    }
    return true;
}, {
    message: "Vui lòng nhập số điện thoại người nhận hợp lệ.",
    path: ["recipientPhone"],
});

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useAppStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      buyerName: "",
      buyerPhone: "",
      address: "",
      deliveryDate: "",
      deliveryTime: "",
      isGift: false,
      recipientName: "",
      recipientPhone: "",
      giftMessage: "",
    },
  });

  const isGift = form.watch("isGift");

  function onSubmit(values: z.infer<typeof checkoutSchema>) {
    console.log(values);
    // Here you would typically process the payment and create the order
    alert("Đặt hàng thành công! (Đây là bản demo)");
    clearCart();
    router.push("/");
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
                  <CardTitle className="font-headline">Thông Tin Khách Hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="buyerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và Tên</FormLabel>
                        <FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="buyerPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số Điện Thoại</FormLabel>
                        <FormControl><Input placeholder="0987654321" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isGift"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                           🎁 Tôi đặt hàng để tặng cho người khác
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {isGift && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Thông Tin Người Nhận</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <FormField control={form.control} name="recipientName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Họ và Tên Người Nhận</FormLabel>
                                <FormControl><Input placeholder="Trần Thị B" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                         <FormField control={form.control} name="recipientPhone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số Điện Thoại Người Nhận</FormLabel>
                                <FormControl><Input placeholder="0123456789" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                         <FormField control={form.control} name="giftMessage" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lời nhắn gửi tặng</FormLabel>
                                <FormControl><Textarea placeholder="Chúc bạn sinh nhật vui vẻ!" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                    </CardContent>
                 </Card>
              )}


              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Chi Tiết Giao Hàng (chỉ ở Bắc Ninh)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ</FormLabel>
                        <FormControl><Input placeholder="123 Phố Example, TP Bắc Ninh" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="deliveryDate" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ngày giao hàng</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField control={form.control} name="deliveryTime" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Thời gian giao hàng</FormLabel>
                            <FormControl><Input type="time" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                </CardContent>
              </Card>
              
               <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Phương Thức Thanh Toán</CardTitle>
                </CardHeader>
                <CardContent>
                   <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                    <div className="flex items-center space-x-2 rounded-md border p-4"><RadioGroupItem value="momo" id="momo" /><Label htmlFor="momo">Momo</Label></div>
                                    <div className="flex items-center space-x-2 rounded-md border p-4"><RadioGroupItem value="zalopay" id="zalopay" /><Label htmlFor="zalopay">ZaloPay</Label></div>
                                    <div className="flex items-center space-x-2 rounded-md border p-4"><RadioGroupItem value="bank" id="bank" /><Label htmlFor="bank">Chuyển khoản</Label></div>
                                    <div className="flex items-center space-x-2 rounded-md border p-4"><RadioGroupItem value="cod" id="cod" /><Label htmlFor="cod">Thanh toán khi nhận hàng (COD)</Label></div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage className="pt-2"/>
                        </FormItem>
                        )}
                    />
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full">Đặt Hàng</Button>
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
