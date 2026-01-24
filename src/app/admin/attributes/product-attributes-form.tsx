
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  detailedDescription_flavor: z.string().min(1, "Vui lòng nhập mô tả hương vị."),
  detailedDescription_ingredients: z.string().min(1, "Vui lòng nhập thành phần."),
  detailedDescription_serving: z.string().min(1, "Vui lòng nhập khẩu phần."),
  detailedDescription_storage: z.string().min(1, "Vui lòng nhập hướng dẫn bảo quản."),
  detailedDescription_dimensions: z.string().min(1, "Vui lòng nhập kích thước."),
  detailedDescription_accessories: z.string().optional(),
  flavorProfile: z.string().optional(),
  structure: z.string().optional(),
});

export type ProductAttributesFormValues = z.infer<typeof formSchema>;

interface ProductAttributesFormProps {
  product: Product;
  onSubmit: (values: ProductAttributesFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ProductAttributesForm({ product, onSubmit, onCancel, isSubmitting }: ProductAttributesFormProps) {
  
  const form = useForm<ProductAttributesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      detailedDescription_flavor: product.detailedDescription?.flavor || "",
      detailedDescription_ingredients: product.detailedDescription?.ingredients || "",
      detailedDescription_serving: product.detailedDescription?.serving || "",
      detailedDescription_storage: product.detailedDescription?.storage || "",
      detailedDescription_dimensions: product.detailedDescription?.dimensions || "",
      detailedDescription_accessories: product.detailedDescription?.accessories?.join('\n') || "",
      flavorProfile: product.flavorProfile?.join('\n') || "",
      structure: product.structure?.join('\n') || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Chi tiết sản phẩm</h3>
            <FormField control={form.control} name="detailedDescription_flavor" render={({ field }) => ( <FormItem><FormLabel>Mô tả hương vị</FormLabel><FormControl><Textarea placeholder="Mousse hoa hồng tinh tế kết hợp với thạch vải nhẹ..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="detailedDescription_ingredients" render={({ field }) => ( <FormItem><FormLabel>Thành phần chính</FormLabel><FormControl><Textarea placeholder="Mousse hoa hồng, thạch vải, mứt mâm xôi, bạt bánh hạnh nhân..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="detailedDescription_dimensions" render={({ field }) => ( <FormItem><FormLabel>Kích thước</FormLabel><FormControl><Input placeholder="Đường kính: 16cm | Chiều cao: 5cm" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="detailedDescription_serving" render={({ field }) => ( <FormItem><FormLabel>Khẩu phần</FormLabel><FormControl><Input placeholder="Dành cho 6-8 người ăn" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="detailedDescription_storage" render={({ field }) => ( <FormItem><FormLabel>Hướng dẫn bảo quản</FormLabel><FormControl><Textarea rows={4} placeholder="Luôn giữ bánh trong hộp kín..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
          </div>
          <div className="space-y-6">
             <h3 className="text-lg font-medium">Mô tả thêm</h3>
             <FormField control={form.control} name="detailedDescription_accessories" render={({ field }) => ( <FormItem><FormLabel>Phụ kiện đi kèm</FormLabel><FormDescription>Mỗi phụ kiện trên một dòng.</FormDescription><FormControl><Textarea placeholder="01 Chiếc nến sinh nhật..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
             <FormField control={form.control} name="flavorProfile" render={({ field }) => (
                <FormItem>
                <FormLabel>Cảm giác vị bánh (Tags)</FormLabel>
                <FormDescription>Mỗi tag vị trên một dòng. VD: Ngọt ngào, Chua thanh...</FormDescription>
                <FormControl><Textarea placeholder="Ngọt ngào\nThơm ngát..." {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="structure" render={({ field }) => (
                <FormItem>
                <FormLabel>Cấu trúc các lớp bánh</FormLabel>
                <FormDescription>Mô tả mỗi lớp trên một dòng, từ trên xuống dưới.</FormDescription>
                <FormControl><Textarea placeholder="Phun phủ bơ cacao\nMousse hoa hồng..." {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}/>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
                ) : 'Lưu thay đổi'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
