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
import type { NewsArticle } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { RichTextEditor } from './rich-text-editor';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(3, { message: "Tiêu đề phải có ít nhất 3 ký tự." }),
  author: z.string().min(2, { message: "Tên tác giả phải có ít nhất 2 ký tự." }),
  category: z.string({ required_error: "Vui lòng chọn danh mục." }).min(1, "Vui lòng chọn một danh mục."),
  excerpt: z.string().min(10, { message: "Mô tả ngắn phải có ít nhất 10 ký tự." }),
  content: z.string().min(20, "Nội dung phải có ít nhất 20 ký tự."),
  imageUrl: z.string().optional(),
});

export type NewsFormValues = z.infer<typeof formSchema>;

const articleCategories = [
    'Ra mắt Bánh mới', 'Khuyến mãi Đặc biệt', 'Công thức tại nhà', 'Sự kiện Lễ hội', 'Chuyện của Tiệm', 'Khách hàng chia sẻ', 'Mẹo Bảo quản Bánh', 'Theo Mùa'
];

interface NewsFormProps {
  article?: NewsArticle;
  onSubmit: (values: NewsFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
}

export function NewsForm({ article, onSubmit, onCancel, isSubmitting, isEditMode }: NewsFormProps) {
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: article ? {
        title: article.title,
        author: article.author,
        category: article.category,
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: article.imageUrl || "",
    } : {
        title: "",
        author: "Vibary Team",
        category: "",
        excerpt: "",
        content: "",
        imageUrl: "",
    },
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(article?.imageUrl || null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreviewUrl(dataUrl);
        form.setValue('imageUrl', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false,
  });

  const removeImage = () => {
    setPreviewUrl(null);
    form.setValue('imageUrl', '', { shouldValidate: true });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề bài viết</FormLabel>
                  <FormControl>
                    <Input placeholder="Vd: BST Bánh Trung Thu 'Trăng Vàng Ký Ức'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả ngắn (SEO)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Một đoạn tóm tắt hấp dẫn về nội dung bài viết..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung chính</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column */}
          <div className="md:col-span-1 space-y-6">
            <FormItem>
              <FormLabel>Ảnh bìa</FormLabel>
              {previewUrl ? (
                <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden">
                  <Image src={previewUrl} alt="Xem trước ảnh" fill className="object-cover" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={removeImage}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={cn(
                    'w-full aspect-[4/3] border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors',
                    isDragActive && 'border-primary bg-primary/10'
                  )}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Kéo thả hoặc nhấn để chọn ảnh</p>
                </div>
              )}
               <FormDescription>Ảnh bìa cho bài viết, nên có tỉ lệ 4:3</FormDescription>
            </FormItem>
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tác giả</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="category"
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
                        {articleCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                    </>
                ) : (isEditMode ? 'Lưu thay đổi' : 'Tạo bài viết')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
