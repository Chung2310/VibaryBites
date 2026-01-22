

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
import React, { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { productCategories } from "@/lib/data";

const productSchema = z.object({
    name: z.string().min(3, { message: "Tên sản phẩm phải có ít nhất 3 ký tự." }),
    subtitle: z.string().optional(),
    price: z.coerce.number().min(0, { message: "Giá không được là số âm." }),
    stock: z.coerce.number().int().min(0, { message: "Số lượng tồn kho phải là số nguyên không âm." }),
    categorySlug: z.string({ required_error: "Vui lòng chọn danh mục." }),
    description: z.string().min(10, { message: "Mô tả ngắn phải có ít nhất 10 ký tự." }),
});


export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (values: ProductFormValues, imageFiles: File[], existingImageUrls: string[]) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isSubmitting, isEditMode }: ProductFormProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.imageUrls || []);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
        name: product.name,
        subtitle: product.subtitle || "",
        price: product.price,
        stock: product.stock ?? 0,
        categorySlug: product.categorySlug,
        description: product.description,
    } : {
        name: "",
        subtitle: "",
        price: 0,
        stock: 0,
        categorySlug: "",
        description: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImageFiles(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    const newFiles = [...imageFiles];
    
    const removedPreview = newPreviews[index];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    
    // If the removed preview was from a newly selected file, remove the file too
    const fileIndex = imageFiles.findIndex(file => URL.createObjectURL(file) === removedPreview);
    if(fileIndex > -1){
        newFiles.splice(fileIndex, 1);
        setImageFiles(newFiles);
    }
  };


  const handleFormSubmit = async (values: ProductFormValues) => {
    const existingImageUrls = imagePreviews.filter(p => p.startsWith('http'));
    await onSubmit(values, imageFiles, existingImageUrls);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
         <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên phụ (VÍ DỤ: VẢI & HOA HỒNG)</FormLabel>
              <FormControl>
                <Input placeholder="VẢI & HOA HỒNG" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <FormLabel>Số lượng tồn kho</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="10" {...field} />
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
        <FormItem>
            <FormLabel>Ảnh sản phẩm</FormLabel>
            <FormControl>
                <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
            </FormControl>
            {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                            <Image src={preview} alt={`Xem trước ảnh ${'${index + 1}'}`} fill className="rounded-md object-cover" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={() => removeImage(index)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            {imagePreviews.length === 0 && (
                <FormDescription>
                    Vui lòng cung cấp ít nhất một ảnh cho sản phẩm.
                </FormDescription>
            )}
            <FormMessage />
        </FormItem>

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
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                    </>
                ) : (isEditMode ? 'Lưu thay đổi' : 'Tạo sản phẩm & Tiếp tục')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
