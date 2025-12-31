
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
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const productSchema = z.object({
    name: z.string().min(3, { message: "Tên sản phẩm phải có ít nhất 3 ký tự." }),
    subtitle: z.string().optional(),
    price: z.coerce.number().min(0, { message: "Giá không được là số âm." }),
    stock: z.coerce.number().int().min(0, { message: "Tồn kho phải là số nguyên dương." }),
    categorySlug: z.string({ required_error: "Vui lòng chọn danh mục." }),
    description: z.string().min(10, { message: "Mô tả ngắn phải có ít nhất 10 ký tự." }),
    // Detailed Description
    detailedDescription_flavor: z.string().min(1, "Vui lòng nhập mô tả hương vị."),
    detailedDescription_ingredients: z.string().min(1, "Vui lòng nhập thành phần."),
    detailedDescription_serving: z.string().min(1, "Vui lòng nhập khẩu phần."),
    detailedDescription_storage: z.string().min(1, "Vui lòng nhập hướng dẫn bảo quản."),
    detailedDescription_dimensions: z.string().min(1, "Vui lòng nhập kích thước."),
    detailedDescription_accessories: z.string().min(1, "Vui lòng nhập phụ kiện."),
    // Other details
    flavorProfile: z.string().min(1, "Vui lòng nhập cảm giác vị bánh."),
    structure: z.string().min(1, "Vui lòng nhập cấu trúc bánh."),
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
  onSubmit: (values: ProductFormValues, imageFile?: File) => Promise<void> | void;
  onClose: () => void;
}

export function ProductForm({ product, onSubmit, onClose }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(product?.imageUrl);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
        name: product.name,
        subtitle: product.subtitle,
        price: product.price,
        stock: product.stock,
        categorySlug: product.categorySlug,
        description: product.description,
        detailedDescription_flavor: product.detailedDescription.flavor || "",
        detailedDescription_ingredients: product.detailedDescription.ingredients || "",
        detailedDescription_serving: product.detailedDescription.serving || "",
        detailedDescription_storage: product.detailedDescription.storage || "",
        detailedDescription_dimensions: product.detailedDescription.dimensions || "",
        detailedDescription_accessories: product.detailedDescription.accessories?.join('\n') || "",
        flavorProfile: product.flavorProfile?.join('\n') || "",
        structure: product.structure?.join('\n') || "",
    } : {
        name: "",
        subtitle: "",
        price: 0,
        stock: 0,
        categorySlug: "",
        description: "",
        detailedDescription_flavor: "",
        detailedDescription_ingredients: "",
        detailedDescription_serving: "",
        detailedDescription_storage: "",
        detailedDescription_dimensions: "",
        detailedDescription_accessories: "",
        flavorProfile: "",
        structure: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    await onSubmit(values, imageFile);
    setIsSubmitting(false);
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
         <FormItem>
          <FormLabel>Ảnh sản phẩm</FormLabel>
          <FormControl>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </FormControl>
          {imagePreview && (
            <div className="mt-4">
              <Image src={imagePreview} alt="Xem trước ảnh" width={100} height={100} className="rounded-md object-cover" />
            </div>
          )}
           {!imagePreview && !product?.imageUrl && (
              <FormDescription>
                Vui lòng cung cấp ảnh cho sản phẩm mới.
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
        
        <Separator />
        <h3 className="text-lg font-medium">Thông tin chi tiết</h3>

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
            <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                    </>
                ) : (product ? 'Lưu thay đổi' : 'Thêm sản phẩm')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
