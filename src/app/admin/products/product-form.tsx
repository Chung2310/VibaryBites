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
import type { Product, ProductCategory } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

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
  // This signature is crucial. We pass the new files to upload, and the list of existing URLs to keep.
  onSubmit: (values: ProductFormValues, newImageFiles: File[], keptImageUrls: string[]) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isSubmitting, isEditMode }: ProductFormProps) {
  const firestore = useFirestore();
  const categoriesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<ProductCategory>(categoriesCollection);

  // State for existing image URLs from the product object
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(product?.imageUrls || []);
  // State for newly selected files
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Prevent duplicates
    const uniqueNewFiles = acceptedFiles.filter(
      (file) => !newImageFiles.some(
        (existingFile) => existingFile.name === file.name && existingFile.size === file.size
      )
    );
    setNewImageFiles(prev => [...prev, ...uniqueNewFiles]);
  }, [newImageFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
  });

  // Combine existing URLs and new file previews for display
  const imagePreviews = useMemo(() => {
    const existing = existingImageUrls.map(url => ({
      id: url,
      url: url,
      isNew: false
    }));
    const news = newImageFiles.map(file => ({
      id: `${file.name}-${file.lastModified}`,
      url: URL.createObjectURL(file),
      isNew: true
    }));
    return [...existing, ...news];
  }, [existingImageUrls, newImageFiles]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    const newUrls = imagePreviews.filter(p => p.isNew).map(p => p.url);
    return () => {
      newUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const removeImage = (imageToRemove: { id: string, isNew: boolean }) => {
    if (imageToRemove.isNew) {
      setNewImageFiles(prev => prev.filter(file => `${file.name}-${file.lastModified}` !== imageToRemove.id));
    } else {
      setExistingImageUrls(prev => prev.filter(url => url !== imageToRemove.id));
    }
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    // Call the parent onSubmit with the correctly separated files and URLs, and wait for it to complete.
    await onSubmit(values, newImageFiles, existingImageUrls);
  };

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
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>Đang tải danh mục...</SelectItem>
                    ) : (
                      categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.slug}>{cat.title}</SelectItem>
                      ))
                    )}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormItem>
            <FormLabel>Ảnh sản phẩm</FormLabel>
            <div
                {...getRootProps()}
                className={cn(
                    'w-full p-6 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors',
                    isDragActive && 'border-primary bg-primary/10'
                )}
            >
                <input {...getInputProps()} />
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Kéo thả ảnh vào đây, hoặc <span className="text-primary">bấm để chọn file</span></p>
                <p className="text-xs text-muted-foreground/80">Bạn có thể chọn nhiều ảnh cùng lúc.</p>
            </div>

            {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview) => (
                        <div key={preview.id} className="relative aspect-square">
                            <Image src={preview.url} alt={`Xem trước ảnh`} fill className="rounded-md object-cover" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={() => removeImage(preview)}
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
        
        <div className="flex justify-end gap-4 items-center pt-4">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                    </>
                ) : (isEditMode ? 'Lưu thay đổi' : 'Tạo sản phẩm')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
