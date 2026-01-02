'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NewsArticle, ArticleStatus, ArticleCategory } from './data';
import { useEffect } from "react";
import { Loader2, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from './rich-text-editor';
import { ImageUploader } from './image-uploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const formSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự."),
  slug: z.string().min(5, "Slug phải có ít nhất 5 ký tự.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ (chỉ chứa chữ thường, số và dấu gạch ngang)."),
  shortDescription: z.string().min(20, "Mô tả ngắn phải có ít nhất 20 ký tự.").max(160, "Mô tả ngắn không được vượt quá 160 ký tự."),
  content: z.string().min(50, "Nội dung phải có ít nhất 50 ký tự."),
  status: z.nativeEnum(ArticleStatus),
  categories: z.array(z.nativeEnum(ArticleCategory)).min(1, "Vui lòng chọn ít nhất một loại bài viết."),
  isFeatured: z.boolean(),
  tags: z.array(z.string()),
  featuredImage: z.string().url("Vui lòng tải lên ảnh bìa."),
  additionalImages: z.array(z.string().url()),
});

type NewsFormValues = z.infer<typeof formSchema>;

interface NewsFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  article: NewsArticle | null;
  onSave: (article: NewsArticle) => void;
}

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export function NewsForm({ isOpen, onOpenChange, article, onSave }: NewsFormProps) {
  const { toast } = useToast();
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      shortDescription: '',
      content: '',
      status: ArticleStatus.Draft,
      categories: [],
      isFeatured: false,
      tags: [],
      featuredImage: '',
      additionalImages: [],
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  
  // Watch title to auto-generate slug
  const titleValue = form.watch('title');
  useEffect(() => {
    if (titleValue && !form.formState.isDirty.slug) {
      form.setValue('slug', generateSlug(titleValue), { shouldValidate: true });
    }
  }, [titleValue, form]);

  // Reset form when article changes
  useEffect(() => {
    if (isOpen) {
      if (article) {
        form.reset({
          ...article,
          tags: article.tags || [],
          additionalImages: article.additionalImages || [],
        });
      } else {
        form.reset({
          title: '',
          slug: '',
          shortDescription: '',
          content: '',
          status: ArticleStatus.Draft,
          categories: [],
          isFeatured: false,
          tags: [],
          featuredImage: '',
          additionalImages: [],
        });
      }
    }
  }, [article, isOpen, form]);

  const onSubmit = (data: NewsFormValues) => {
    // Simulate API call and latency
    return new Promise(resolve => {
        setTimeout(() => {
            const finalArticle: NewsArticle = {
                ...data,
                id: article?.id || `news-${Date.now()}`,
                publicationDate: (article?.publicationDate && data.status === article.status) ? article.publicationDate : new Date().toISOString(),
                views: article?.views || 0,
            };
            onSave(finalArticle);
            resolve(true);
        }, 1000);
    })
  };

  const copySlug = () => {
    navigator.clipboard.writeText(form.getValues('slug'));
    toast({ title: "Đã sao chép slug!" });
  }

  return (
     <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-full md:h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{article ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</DialogTitle>
          <DialogDescription>
            Điền đầy đủ thông tin để tạo hoặc cập nhật bài viết của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <Form {...form}>
            <form id="news-article-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tiêu đề bài viết</FormLabel>
                        <FormControl><Input placeholder="VD: Ra mắt bộ sưu tập bánh Trung Thu 2024" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Đường dẫn (slug)</FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl><Input placeholder="vd: ra-mat-bo-suu-tap-banh-trung-thu-2024" {...field} /></FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={copySlug}><Copy className="h-4 w-4"/></Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ảnh bìa (1200x800px)</FormLabel>
                        <FormControl>
                            <ImageUploader 
                                value={field.value} 
                                onChange={field.onChange} 
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField control={form.control} name="shortDescription" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mô tả ngắn (SEO)</FormLabel>
                        <FormControl><Textarea rows={3} maxLength={160} placeholder="Một đoạn giới thiệu ngắn gọn, hấp dẫn về bài viết, tối ưu cho công cụ tìm kiếm (Google, Facebook...)." {...field} /></FormControl>
                        <FormDescription>{form.getValues('shortDescription').length}/160 ký tự</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                
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
                
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Trạng thái</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value={ArticleStatus.Published} /></FormControl><FormLabel className="font-normal">Published</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value={ArticleStatus.Draft} /></FormControl><FormLabel className="font-normal">Draft</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value={ArticleStatus.Hidden} /></FormControl><FormLabel className="font-normal">Hidden</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )}/>
                     <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <FormLabel>Bài viết nổi bật</FormLabel>
                                    <FormDescription>Hiển thị trên trang chủ hoặc các vị trí ưu tiên.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                 <Controller
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Loại bài viết</FormLabel>
                             <Select onValueChange={(value) => field.onChange([...field.value, value as ArticleCategory])} defaultValue="">
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại bài viết..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {(Object.keys(ArticleCategory) as Array<keyof typeof ArticleCategory>).map(key => (
                                     <SelectItem key={key} value={ArticleCategory[key]} disabled={field.value.includes(ArticleCategory[key])}>
                                        {ArticleCategory[key]}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {field.value.map((category) => (
                                    <Button key={category} type="button" size="sm" variant="secondary" onClick={() => field.onChange(field.value.filter(c => c !== category))}>
                                        {category} &times;
                                    </Button>
                                ))}
                            </div>
                             <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
          </Form>
        </div>

        <DialogFooter className="p-6 pt-0 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Hủy</Button>
          <Button type="submit" form="news-article-form" disabled={isSubmitting}>
             {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                </>
             ) : 'Lưu bài viết'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
