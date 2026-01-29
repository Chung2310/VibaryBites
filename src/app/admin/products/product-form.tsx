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
import React from "react";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

const productSchema = z.object({
    // Basic Info
    name: z.string().min(3, { message: "Tên sản phẩm phải có ít nhất 3 ký tự." }),
    subtitle: z.string().optional(),
    price: z.coerce.number().min(0, { message: "Giá không được là số âm." }),
    stock: z.coerce.number().int().min(0, { message: "Số lượng tồn kho phải là số nguyên không âm." }),
    categorySlug: z.string({ required_error: "Vui lòng chọn danh mục." }).min(1, "Vui lòng chọn danh mục."),
    description: z.string().min(10, { message: "Mô tả ngắn phải có ít nhất 10 ký tự." }),
    
    // Image Handling
    imageUrl: z.string().url({ message: "Vui lòng nhập một URL hình ảnh hợp lệ." }).optional().or(z.literal('')),

    // Detailed Description
    detailedDescription_flavor: z.string().min(1, "Vui lòng nhập mô tả hương vị."),
    detailedDescription_ingredients: z.string().min(1, "Vui lòng nhập thành phần."),
    detailedDescription_storage: z.string().min(1, "Vui lòng nhập hướng dẫn bảo quản."),
    detailedDescription_dimensions: z.string().min(1, "Vui lòng nhập kích thước & khẩu phần."),
    detailedDescription_accessories: z.string().optional(),

    // Profiles & Structure
    flavorProfile: z.string().optional(),
    structure: z.string().optional(),
});


export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
}

const defaultStorageInstructions = `Luôn giữ bánh trong hộp kín & bảo quản trong ngăn mát tủ lạnh
Không nên để bánh ở nhiệt độ phòng quá 30 phút (Bánh sẽ bị chảy)
Sử dụng trong vòng 03 ngày`;

export function ProductForm({ product, onSubmit, onCancel, isSubmitting, isEditMode }: ProductFormProps) {
  const firestore = useFirestore();
  const categoriesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<ProductCategory>(categoriesCollection);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
        name: product.name,
        subtitle: product.subtitle || "",
        price: product.price,
        stock: product.stock ?? 0,
        categorySlug: product.categorySlug,
        description: product.description,
        imageUrl: product.imageUrl || "",
        detailedDescription_flavor: product.detailedDescription?.flavor || "",
        detailedDescription_ingredients: product.detailedDescription?.ingredients || "",
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
        imageUrl: "",
        detailedDescription_flavor: "",
        detailedDescription_ingredients: "",
        detailedDescription_storage: defaultStorageInstructions,
        detailedDescription_dimensions: "",
        detailedDescription_accessories: "01 Chiếc nến sinh nhật\n01 Bộ đĩa và dĩa dành cho 10 người\n01 Dao cắt bánh",
        flavorProfile: "",
        structure: "",
    },
  });
  
  const imageUrl = form.watch('imageUrl');
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingCategories ? "Đang tải..." : "Chọn một danh mục"} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {categories?.map(cat => ( <SelectItem key={cat.slug} value={cat.slug}>{cat.title}</SelectItem> ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}/>
            </div>
        </div>
        
        <Separator />

        {/* --- Image URL Input --- */}
        <div className="space-y-2">
            <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>URL Ảnh sản phẩm</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com/path/to/your/image.png" {...field} />
                        </FormControl>
                        <FormDescription>
                            Dán đường dẫn URL của ảnh. Ảnh nên có tỉ lệ 1:1 và nền trong suốt để hiển thị tốt nhất.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {imageUrl && (
                <div className="relative w-full max-w-sm aspect-square rounded-md overflow-hidden border mt-4">
                    <Image src={imageUrl} alt="Xem trước ảnh" fill className="object-cover" />
                </div>
            )}
        </div>

        <Separator />

        {/* --- Detailed Description --- */}
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Chi tiết sản phẩm</h3>
            <FormField control={form.control} name="detailedDescription_flavor" render={({ field }) => ( <FormItem><FormLabel>Mô tả hương vị (Flavor)</FormLabel><FormControl><Textarea placeholder="Mousse hoa hồng tinh tế kết hợp với thạch vải nhẹ..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="detailedDescription_ingredients" render={({ field }) => ( <FormItem><FormLabel>Thành phần chính (Ingredients)</FormLabel><FormControl><Textarea placeholder="Mousse hoa hồng, thạch vải, mứt mâm xôi, bạt bánh hạnh nhân..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="detailedDescription_dimensions" render={({ field }) => ( <FormItem><FormLabel>Kích thước & Khẩu phần (Dimensions & Serving)</FormLabel><FormControl><Input placeholder="Vd: Đường kính 16cm, cho 6-8 người ăn" {...field} /></FormControl><FormMessage /></FormItem> )}/>
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
