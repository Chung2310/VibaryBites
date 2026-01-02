
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
import type { NewsArticle } from "@/lib/types";
import Image from "next/image";
import React, { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

const newsSchema = z.object({
    title: z.string().min(3, { message: "Tiêu đề phải có ít nhất 3 ký tự." }),
    author: z.string().min(2, { message: "Tên tác giả phải có ít nhất 2 ký tự." }),
    category: z.string().min(2, { message: "Danh mục phải có ít nhất 2 ký tự." }),
    excerpt: z.string().min(10, { message: "Tóm tắt phải có ít nhất 10 ký tự." }),
    content: z.string().min(20, { message: "Nội dung phải có ít nhất 20 ký tự." }),
});

export type NewsFormValues = z.infer<typeof newsSchema>;

interface NewsFormProps {
  article?: NewsArticle;
  onSubmit: (values: NewsFormValues, imageFile: File | null, existingImageUrl?: string) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
}

export function NewsForm({ article, onSubmit, onCancel, isSubmitting, isEditMode }: NewsFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(article?.imageUrl || null);
  
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: article ? { ...article } : {
        title: "",
        author: "Vibary",
        category: "Tin tức",
        excerpt: "",
        content: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleFormSubmit = async (values: NewsFormValues) => {
    const existingImageUrl = article?.imageUrl;
    await onSubmit(values, imageFile, existingImageUrl);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề bài viết</FormLabel>
              <FormControl>
                <Input placeholder="Hành trình ngọt ngào..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tác giả</FormLabel>
                    <FormControl>
                        <Input placeholder="Vibary" {...field} />
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
                    <FormControl>
                        <Input placeholder="Câu chuyện thương hiệu" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <FormItem>
            <FormLabel>Ảnh bìa</FormLabel>
            <FormControl>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
            </FormControl>
            {imagePreview && (
                <div className="mt-4 relative w-full aspect-video">
                    <Image src={imagePreview} alt="Xem trước ảnh bìa" fill className="rounded-md object-cover" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={removeImage}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            )}
            {!imagePreview && (
                <FormDescription>
                    Vui lòng cung cấp ảnh bìa cho bài viết.
                </FormDescription>
            )}
            <FormMessage />
        </FormItem>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tóm tắt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Một đoạn tóm tắt ngắn..."
                  className="resize-y"
                  {...field}
                />
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
              <FormLabel>Nội dung</FormLabel>
              <FormDescription>Bạn có thể sử dụng các thẻ HTML cơ bản để định dạng, ví dụ: {'<h2>Tiêu đề</h2>, <p>Đoạn văn</p>, <ul><li>Danh sách</li></ul>'}</FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Nội dung chi tiết của bài viết..."
                  className="resize-y min-h-[250px]"
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
                ) : (isEditMode ? 'Lưu thay đổi' : 'Tạo bài viết')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
