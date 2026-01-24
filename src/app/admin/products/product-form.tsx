
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
import React, { useState, useEffect } from "react";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const defaultStorageInstructions = `Luôn giữ bánh trong hộp kín & bảo quản trong ngăn mát tủ lạnh
Không nên để bánh ở nhiệt độ phòng quá 30 phút (Bánh sẽ bị chảy)
Sử dụng trong vòng 03 ngày`;

const productSchema = z.object({
    // Basic Info
    name: z.string().min(3, { message: "Tên sản phẩm phải có ít nhất 3 ký tự." }),
    subtitle: z.string().optional(),
    price: z.coerce.number().min(0, { message: "Giá không được là số âm." }),
    stock: z.coerce.number().int().min(0, { message: "Số lượng tồn kho phải là số nguyên không âm." }),
    categorySlug: z.string({ required_error: "Vui lòng chọn danh mục." }),
    description: z.string().min(10, { message: "Mô tả ngắn phải có ít nhất 10 ký tự." }),

    // Detailed Description
    detailedDescription_flavor: z.string().min(1, "Vui lòng nhập mô tả hương vị."),
    detailedDescription_ingredients: z.string().min(1, "Vui lòng nhập thành phần."),
    detailedDescription_serving: z.string().min(1, "Vui lòng nhập khẩu phần."),
    detailedDescription_storage: z.string().min(1, "Vui lòng nhập hướng dẫn bảo quản."),
    detailedDescription_dimensions: z.string().min(1, "Vui lòng nhập kích thước."),
    detailedDescription_accessories: z.string().optional(),

    // Profiles & Structure
    flavorProfile: z.string().optional(),
    structure: z.string().optional(),
});


export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (values: ProductFormValues, imageFile: File | null, imageWasRemoved?: boolean) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isSubmitting, isEditMode }: ProductFormProps) {
  const firestore = useFirestore();
  const categoriesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<ProductCategory>(categoriesCollection);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
        name: product.name,
        subtitle: product.subtitle || "",
        price: product.price,
        stock: product.stock ?? 0,
        categorySlug: product.categorySlug,
        description: product.description,
        detailedDescription_flavor: product.detailedDescription?.flavor || "",
        detailedDescription_ingredients: product.detailedDescription?.ingredients || "",
        detailedDescription_serving: product.detailedDescription?.serving || "",
        detailedDescription_storage: product.detailedDescription?.storage || defaultStorageInstructions,
        detailedDescription_dimensions: product.detailedDescription?.dimensions || "",
        detailedDescription_accessories: product.detailedDescription?.accessories?.join('\n') || "",
        flavorProfile: product.flavorProfile?.join('\n') || "",
        structure: product.structure?.join('\n') || "",
    } : {
        name: "",
        subtitle: "",
        price: 0,
        stock: 10,
        categorySlug: "",
        description: "",
        detailedDescription_flavor: "",
        detailedDescription_ingredients: "",
        detailedDescription_serving: "",
        detailedDescription_storage: defaultStorageInstructions,
        detailedDescription_dimensions: "",
        detailedDescription_accessories: "01 Chiếc nến sinh nhật\n01 Bộ đĩa và dĩa dành cho 10 người\n01 Dao cắt bánh",
        flavorProfile: "",
        structure: "",
    },
  });
  
  useEffect(() => {
    if (product?.imageUrl) {
      setImagePreview(product.imageUrl);
    }
  }, [product]);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false,
  });

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };


  const handleFormSubmit = (values: ProductFormValues) => {
    const imageWasRemoved = isEditMode && !!product?.imageUrl && !imagePreview;
    onSubmit(values, imageFile, imageWasRemoved);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        
        {/* --- Main Product Info --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">Thông tin cơ bản</h3>
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Tên sản phẩm</FormLabel><FormControl><Input placeholder="BE IN BLOSSOM" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="subtitle" render={({ field }) => ( <FormItem><FormLabel>Tên phụ (VÍ DỤ: VẢI & HOA HỒNG)</FormLabel><FormControl><Input placeholder="VẢI & HOA HỒNG" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Mô tả ngắn</FormLabel><FormControl><Textarea placeholder="Mô tả ngắn về sản phẩm..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </div>
            <div className="space-y-6">
                 <h3 className="text-lg font-medium border-b pb-2">Phân loại & Giá</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => ( <FormItem><FormLabel>Giá</FormLabel><FormControl><Input type="number" placeholder="650000" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem><FormLabel>Tồn kho</FormLabel><FormControl><Input type="number" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                 </div>
                <FormField control={form.control} name="categorySlug" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories || !categories || categories.length === 0}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn một danh mục" /></SelectTrigger></FormControl>
                        <SelectContent>
                        {isLoadingCategories ? ( <div className="p-4 text-sm text-muted-foreground">Đang tải danh mục...</div> ) : (
                            categories && categories.length > 0 ? (
                            categories.map(cat => ( <SelectItem key={cat.id} value={cat.slug}>{cat.title}</SelectItem> ))
                            ) : (
                            <div className="p-4 text-sm text-muted-foreground">Không tìm thấy danh mục. Vui lòng <Link href="/admin/categories" className="underline text-primary hover:text-primary/80">thêm danh mục mới</Link> trước.</div>
                            )
                        )}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}/>
            </div>
        </div>
        
        <Separator />

        {/* --- Image Uploader --- */}
        <div className="space-y-2">
            <FormLabel>Ảnh sản phẩm</FormLabel>
             {imagePreview ? (
                <div className="relative w-full max-w-sm aspect-[4/3] rounded-md overflow-hidden">
                  <Image src={imagePreview} alt="Xem trước ảnh" fill className="object-cover" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={removeImage}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={cn(
                    'w-full max-w-sm aspect-[4/3] border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors',
                    isDragActive && 'border-primary bg-primary/10'
                  )}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Kéo thả hoặc nhấn để chọn ảnh</p>
                </div>
              )}
            <FormDescription>Vui lòng cung cấp một ảnh cho sản phẩm. Tỉ lệ 4:3 được khuyến nghị.</FormDescription>
        </div>

        <Separator />

        {/* --- Detailed Description --- */}
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Chi tiết sản phẩm</h3>
            <FormField control={form.control} name="detailedDescription_flavor" render={({ field }) => ( <FormItem><FormLabel>Mô tả hương vị (Flavor)</FormLabel><FormControl><Textarea placeholder="Mousse hoa hồng tinh tế kết hợp với thạch vải nhẹ..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="detailedDescription_ingredients" render={({ field }) => ( <FormItem><FormLabel>Thành phần chính (Ingredients)</FormLabel><FormControl><Textarea placeholder="Mousse hoa hồng, thạch vải, mứt mâm xôi, bạt bánh hạnh nhân..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="detailedDescription_dimensions" render={({ field }) => ( <FormItem><FormLabel>Kích thước (Dimensions)</FormLabel><FormControl><Input placeholder="Đường kính: 16cm | Chiều cao: 5cm" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <FormField control={form.control} name="detailedDescription_serving" render={({ field }) => ( <FormItem><FormLabel>Khẩu phần (Serving)</FormLabel><FormControl><Input placeholder="Dành cho 6-8 người ăn" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            </div>
            <FormField control={form.control} name="detailedDescription_storage" render={({ field }) => ( <FormItem><FormLabel>Hướng dẫn sử dụng & Bảo quản (Storage)</FormLabel><FormControl><Textarea rows={4} placeholder="Luôn giữ bánh trong hộp kín..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="detailedDescription_accessories" render={({ field }) => ( <FormItem><FormLabel>Phụ kiện đi kèm (Accessories)</FormLabel><FormDescription>Mỗi phụ kiện trên một dòng.</FormDescription><FormControl><Textarea placeholder="01 Chiếc nến sinh nhật..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
        </div>
        
        <Separator />
        
        {/* --- Flavor & Structure --- */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField control={form.control} name="flavorProfile" render={({ field }) => (
                <FormItem>
                <FormLabel>Cảm giác vị bánh (Flavor Profile)</FormLabel>
                <FormDescription>Mỗi tag vị trên một dòng. VD: Ngọt ngào, Chua thanh, Đậm vị trà...</FormDescription>
                <FormControl><Textarea placeholder="Ngọt ngào\nThơm ngát..." {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="structure" render={({ field }) => (
                <FormItem>
                <FormLabel>Cấu trúc các lớp bánh (Structure)</FormLabel>
                <FormDescription>Mô tả mỗi lớp trên một dòng, từ trên xuống dưới.</FormDescription>
                <FormControl><Textarea placeholder="Phun phủ bơ cacao\nMousse hoa hồng..." {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}/>
        </div>
        
        <div className="flex justify-end gap-4 items-center pt-4 border-t mt-8">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</> ) : (isEditMode ? 'Lưu thay đổi' : 'Tạo sản phẩm')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
