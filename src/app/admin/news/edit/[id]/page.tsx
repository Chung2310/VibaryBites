'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError, useStorage } from '@/firebase';
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
    const params = useParams();
    const articleId = (params.id || '') as string;
    
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const articleDocRef = useMemoFirebase(() => {
        if (!firestore || !articleId) return null;
        return doc(firestore, 'news_articles', articleId);
    }, [firestore, articleId]);

    const { data: article, isLoading } = useDoc<NewsArticle>(articleDocRef);
    
    const handleFormSubmit = async (values: NewsFormValues, imageFile: File | null, imageWasRemoved: boolean) => {
        if (!firestore || !article || !articleDocRef || !storage) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể kết nối tới dịch vụ hoặc không tìm thấy bài viết.',
            });
            return;
        }
        
        setIsSubmitting(true);
        const toastId = toast({ title: "Đang cập nhật...", description: "Vui lòng đợi trong giây lát." }).id;
        
        try {
            // 1. Update text content first
            const updatedArticleData: Partial<NewsArticle> = {
                title: values.title,
                author: values.author,
                category: values.category,
                excerpt: values.excerpt,
                content: values.content,
                slug: generateSlug(values.title),
            };

            await setDoc(articleDocRef, updatedArticleData, { merge: true });
            toast({ id: toastId, title: "Đã lưu nội dung", description: "Đang xử lý ảnh..." });

            // 2. Handle image logic
            if (imageFile) {
                // New image uploaded
                if (article.imageUrl) {
                    deleteImage(storage, article.imageUrl).catch(e => console.warn("Failed to delete old image, proceeding with upload.", e));
                }
                const newImageUrl = await uploadImage(storage, imageFile, `news/${article.id}`);
                await setDoc(articleDocRef, { imageUrl: newImageUrl }, { merge: true });
                toast({ id: toastId, title: "Cập nhật thành công!", description: `Bài viết đã được cập nhật với ảnh mới.` });
            } else if (imageWasRemoved && article.imageUrl) {
                // Image was removed
                await deleteImage(storage, article.imageUrl);
                await setDoc(articleDocRef, { imageUrl: `https://placehold.co/1200x800/F4DDDD/333333?text=No+Image` }, { merge: true });
                toast({ id: toastId, title: "Cập nhật thành công!", description: `Ảnh đã được xóa.` });
            } else {
                // No image changes
                toast({ id: toastId, title: "Cập nhật thành công!", description: `Bài viết "${values.title}" đã được cập nhật.` });
            }

            router.push('/admin/news');

        } catch (error: any) {
            console.error("Lỗi khi cập nhật bài viết:", error);
            const permissionError = new FirestorePermissionError({
                path: articleDocRef.path,
                operation: 'update',
                requestResourceData: values
            });
            errorEmitter.emit('permission-error', permissionError);

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
