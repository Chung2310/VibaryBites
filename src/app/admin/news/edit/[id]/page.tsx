'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { NewsForm, type NewsFormValues } from '../../news-form';
import type { NewsArticle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { generateSlug } from '@/lib/utils';
import { uploadImage, deleteImage } from '@/firebase/storage';

export default function EditNewsArticlePage() {
    const router = useRouter();
    const articleId = (useParams().id || '') as string;
    
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const articleDocRef = useMemoFirebase(() => {
        if (!firestore || !articleId) return null;
        return doc(firestore, 'news_articles', articleId);
    }, [firestore, articleId]);

    const { data: article, isLoading } = useDoc<NewsArticle>(articleDocRef);
    
    const handleFormSubmit = async (values: NewsFormValues, imageFile: File | null, imageWasRemoved: boolean) => {
        if (!firestore || !article) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể kết nối tới dịch vụ hoặc không tìm thấy bài viết.',
            });
            return;
        }
        
        setIsSubmitting(true);
        const toastId = toast({ title: "Đang cập nhật...", description: "Vui lòng đợi trong giây lát." }).id;
        const docRef = doc(firestore, 'news_articles', article.id);
        
        try {
            let finalImageUrl = article.imageUrl;

            if (imageFile) {
                if (article.imageUrl) {
                    try {
                        await deleteImage(article.imageUrl);
                    } catch (e) {
                         console.warn("Failed to delete old image, proceeding with upload.", e)
                    }
                }
                toast({ id: toastId, title: "Đang tải ảnh mới lên...", description: "Vui lòng đợi..." });
                finalImageUrl = await uploadImage(imageFile, `news/${article.id}`);
                toast({ id: toastId, title: "Xử lý ảnh thành công!" });
            } 
            else if (imageWasRemoved && article.imageUrl) {
                try {
                    await deleteImage(article.imageUrl);
                } catch(e) {
                    console.warn("Failed to delete old image.", e)
                }
                finalImageUrl = `https://placehold.co/1200x800/F4DDDD/333333?text=No+Image`;
            }

            toast({ id: toastId, title: "Đang lưu bài viết...", description: "" });

            const updatedArticleData: Partial<NewsArticle> = {
                title: values.title,
                author: values.author,
                category: values.category,
                excerpt: values.excerpt,
                content: values.content,
                imageUrl: finalImageUrl,
                slug: generateSlug(values.title),
            };

            await setDoc(docRef, updatedArticleData, { merge: true });
            
            toast({
                id: toastId,
                title: 'Cập nhật thành công!',
                description: `Bài viết "${values.title}" đã được cập nhật.`,
            });
            
            router.push('/admin/news');

        } catch (error: any) {
            if (!(error.code && error.code.startsWith('storage/'))) {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'update',
                    requestResourceData: values
                });
                errorEmitter.emit('permission-error', permissionError);
            }
            toast({
                id: toastId,
                variant: 'destructive',
                title: 'Không thể cập nhật bài viết',
                description: error.message || 'Đã có lỗi không xác định xảy ra.',
                duration: 9000,
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
