
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { uploadImage, deleteImage } from '@/firebase/storage';
import { NewsForm, type NewsFormValues } from '../../news-form';
import type { NewsArticle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

export default function EditNewsArticlePage() {
    const router = useRouter();
    const params = useParams();
    const articleId = params.id as string;
    
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const articleDocRef = useMemoFirebase(() => {
        if (!firestore || !articleId) return null;
        return doc(firestore, 'news_articles', articleId);
    }, [firestore, articleId]);

    const { data: article, isLoading } = useDoc<NewsArticle>(articleDocRef);
    
    const handleFormSubmit = async (values: NewsFormValues, imageFile: File | null, existingImageUrl?: string) => {
        if (!firestore || !article) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể kết nối tới cơ sở dữ liệu hoặc không tìm thấy bài viết.',
            });
            return;
        }
        
        setIsSubmitting(true);
        let newImageUrl = existingImageUrl;

        try {
            // If there's a new image file, upload it and delete the old one if it exists
            if (imageFile) {
                newImageUrl = await uploadImage(imageFile);
                if (existingImageUrl && existingImageUrl !== newImageUrl) {
                    await deleteImage(existingImageUrl);
                }
            } else if (!imagePreview && existingImageUrl) { // If the image was removed
                 if (article.imageUrl) {
                    await deleteImage(article.imageUrl);
                }
                newImageUrl = '';
            }

             if (!newImageUrl) {
                 toast({
                    variant: "destructive",
                    title: "Lỗi",
                    description: "Bài viết phải có ảnh bìa.",
                });
                setIsSubmitting(false);
                return;
            }

            const docRef = doc(firestore, 'news_articles', article.id);

            const updatedArticleData: Partial<NewsArticle> = {
                title: values.title,
                author: values.author,
                category: values.category,
                excerpt: values.excerpt,
                content: values.content,
                imageUrl: newImageUrl,
                slug: generateSlug(values.title),
            };

            await setDoc(docRef, updatedArticleData, { merge: true });
            
            toast({
                title: 'Cập nhật thành công!',
                description: `Bài viết "${values.title}" đã được cập nhật.`,
            });
            
            router.push('/admin/news');

        } catch (error) {
            console.error("Error updating article: ", error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: (error as Error).message || 'Không thể lưu bài viết.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="space-y-4">
                 <h1 className="text-xl font-semibold">Đang tải bài viết...</h1>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                         <Skeleton className="h-40 w-full" />
                    </CardContent>
                 </Card>
            </div>
        )
    }

    if (!article) {
        return <div>Không tìm thấy bài viết.</div>
    }

    return (
        <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/admin/news">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Chỉnh sửa: {article.title}
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin bài viết</CardTitle>
                    <CardDescription>Cập nhật nội dung cho bài viết.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NewsForm 
                        isEditMode={true}
                        article={article}
                        onSubmit={handleFormSubmit}
                        onCancel={() => router.push('/admin/news')}
                        isSubmitting={isSubmitting}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

    