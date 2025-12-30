
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { uploadImage } from "@/firebase/storage";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";

const productSchema = z.object({
    name: z.string().min(3, { message: "Tên sản phẩm phải có ít nhất 3 ký tự." }),
    price: z.coerce.number().min(0, { message: "Giá không được là số âm." }),
    stock: z.coerce.number().int().min(0, { message: "Tồn kho phải là số nguyên dương." }),
    categorySlug: z.string({ required_error: "Vui lòng chọn danh mục." }),
    imageUrl: z.string().min(1, { message: "Vui lòng tải lên ảnh cho sản phẩm." }),
    description: z.string().min(10, { message: "Mô tả phải có ít nhất 10 ký tự." }),
});

export type ProductFormValues = z.infer<typeof productSchema>;

const productCategories = [
    { slug: 'banh-sinh-nhat', title: 'Bánh sinh nhật' },
    { slug: 'banh-ngot', title: 'Bánh ngọt' },
    { slug: 'banh-man', title: 'Bánh mặn' },
    { slug: 'do-uong', title: 'Đồ uống' },
    { slug: 'banh-khac', title: 'Bánh khác' },
    { slug: 'do-an-khac', title: 'Đồ ăn khác' },
];

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormValues) => void;
}

export function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
        name: product.name,
        price: product.price,
        stock: product.stock,
        categorySlug: product.categorySlug,
        imageUrl: product.imageUrl,
        description: product.description,
    } : {
        name: "",
        price: 0,
        stock: 0,
        categorySlug: "",
        imageUrl: "",
        description: "",
    },
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      setImagePreview(URL.createObjectURL(file));

      try {
          const imageUrl = await uploadImage(file);
          form.setValue("imageUrl", imageUrl);
          setImagePreview(imageUrl);
      } catch (error) {
          console.error("Upload failed", error);
          form.setError("imageUrl", { message: "Tải ảnh lên thất bại." });
          setImagePreview(null);
      } finally {
          setIsUploading(false);
      }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên sản phẩm</FormLabel>
              <FormControl>
                <Input placeholder="BE IN BLOSSOM" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Giá</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="650000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tồn kho</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="15" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="categorySlug"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn một danh mục" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {productCategories.map(cat => (
                        <SelectItem key={cat.slug} value={cat.slug}>{cat.title}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
         <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Ảnh sản phẩm</FormLabel>
                <FormControl>
                    <Input type="file" accept="image/*" onChange={handleImageChange} className="file:text-foreground"/>
                </FormControl>
                 {imagePreview && (
                    <div className="mt-4">
                        <Image src={imagePreview} alt="Xem trước ảnh" width={100} height={100} className="rounded-md object-cover" />
                    </div>
                )}
                {isUploading && <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Đang tải ảnh lên...</div>}
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả ngắn</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả ngắn về sản phẩm..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isUploading}>{isUploading ? 'Đang tải ảnh...' : (product ? 'Lưu thay đổi' : 'Thêm sản phẩm')}</Button>
      </form>
    </Form>
  );
}
