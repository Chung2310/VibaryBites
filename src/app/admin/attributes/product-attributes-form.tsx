
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/types";
import React from "react";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const attributesSchema = z.object({
    detailedDescription_flavor: z.string().min(1, "Vui lòng nhập mô tả hương vị."),
    detailedDescription_ingredients: z.string().min(1, "Vui lòng nhập thành phần."),
    detailedDescription_serving: z.string().min(1, "Vui lòng nhập khẩu phần."),
    detailedDescription_storage: z.string().min(1, "Vui lòng nhập hướng dẫn bảo quản."),
    detailedDescription_dimensions: z.string().min(1, "Vui lòng nhập kích thước."),
    detailedDescription_accessories: z.string().min(1, "Vui lòng nhập phụ kiện."),
    flavorProfile: z.string().min(1, "Vui lòng nhập cảm giác vị bánh."),
    structure: z.string().min(1, "Vui lòng nhập cấu trúc bánh."),
});

export type ProductAttributesFormValues = z.infer<typeof attributesSchema>;

interface ProductAttributesFormProps {
  product: Product;
  onSubmit: (values: ProductAttributesFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const defaultStorageInstructions = `Luôn giữ bánh trong hộp kín & bảo quản trong ngăn mát tủ lạnh
Không nên để bánh ở nhiệt độ phòng quá 30 phút (Bánh sẽ bị chảy)
Sử dụng trong vòng 03 ngày`;

export function ProductAttributesForm({ product, onSubmit, onCancel, isSubmitting }: ProductAttributesFormProps) {
  const form = useForm<ProductAttributesFormValues>({
    resolver: zodResolver(attributesSchema),
    defaultValues: {
        detailedDescription_flavor: product.detailedDescription?.flavor || "",
        detailedDescription_ingredients: product.detailedDescription?.ingredients || "",
        detailedDescription_serving: product.detailedDescription?.serving || "",
        detailedDescription_storage: product.detailedDescription?.storage || defaultStorageInstructions,
        detailedDescription_dimensions: product.detailedDescription?.dimensions || "",
        detailedDescription_accessories: product.detailedDescription?.accessories?.join('\n') || "",
        flavorProfile: product.flavorProfile?.join('\n') || "",
        structure: product.structure?.join('\n') || "",
    },
  });

  const handleFormSubmit = async (values: ProductAttributesFormValues) => {
    await onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <h3 className="text-lg font-medium">Thuộc tính & Chi tiết sản phẩm</h3>

        <FormField control={form.control} name="detailedDescription_flavor" render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả hương vị (flavor)</FormLabel>
              <FormControl><Textarea placeholder="Mousse hoa hồng tinh tế..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>
        <FormField control={form.control} name="detailedDescription_ingredients" render={({ field }) => (
            <FormItem>
              <FormLabel>Thành phần (ingredients)</FormLabel>
              <FormControl><Textarea placeholder="Mousse hoa hồng, thạch vải..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>
        <FormField control={form.control} name="detailedDescription_serving" render={({ field }) => (
            <FormItem>
              <FormLabel>Khẩu phần (serving)</FormLabel>
              <FormControl><Input placeholder="Dành cho 6-8 người ăn" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>
        <FormField control={form.control} name="detailedDescription_storage" render={({ field }) => (
            <FormItem>
              <FormLabel>Bảo quản (storage)</FormLabel>
              <FormControl><Textarea placeholder="Luôn giữ bánh trong hộp kín..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>
        <FormField control={form.control} name="detailedDescription_dimensions" render={({ field }) => (
            <FormItem>
              <FormLabel>Kích thước (dimensions)</FormLabel>
              <FormControl><Input placeholder="Đường kính: 16cm | Chiều cao: 5cm" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>
        <FormField control={form.control} name="detailedDescription_accessories" render={({ field }) => (
            <FormItem>
              <FormLabel>Phụ kiện (accessories)</FormLabel>
              <FormDescription>Mỗi phụ kiện trên một dòng.</FormDescription>
              <FormControl><Textarea placeholder="01 Chiếc nến sinh nhật..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>

        <Separator />
        
        <FormField control={form.control} name="flavorProfile" render={({ field }) => (
            <FormItem>
              <FormLabel>Cảm giác vị bánh (Flavor Profile)</FormLabel>
              <FormDescription>Mỗi tag trên một dòng.</FormDescription>
              <FormControl><Textarea placeholder="Ngọt ngào\nThơm ngát..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>
         <FormField control={form.control} name="structure" render={({ field }) => (
            <FormItem>
              <FormLabel>Cấu trúc vị bánh (Structure)</FormLabel>
              <FormDescription>Mỗi lớp trên một dòng.</FormDescription>
              <FormControl><Textarea placeholder="Phun phủ bơ cacao\nMousse hoa hồng..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                    </>
                ) : 'Lưu thay đổi'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
