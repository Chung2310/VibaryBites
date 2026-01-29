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
        if (!firestore || !storage || !article || !articleDocRef) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể kết nối tới dịch vụ hoặc không tìm thấy bài viết.',
            });
            return;
        }
        
        setIsSubmitting(true);
        const { id: toastId } = toast({ title: "Đang cập nhật...", description: "Vui lòng đợi." });

        try {
            let finalImageUrl = article.imageUrl; // Start with the existing URL

            // Step 1: Handle image operations
            if (imageFile) {
                toast({ id: toastId, title: "Đang tải ảnh mới lên...", description: "Bước 1/2: Xử lý ảnh bìa." });
                // Delete old image if it exists and is a Firebase Storage URL
                if (article.imageUrl && article.imageUrl.includes('firebasestorage')) {
                    await deleteImage(storage, article.imageUrl);
                }
                finalImageUrl = await uploadImage(storage, `news/${article.id}`, imageFile);
            } 
            else if (imageWasRemoved && article.imageUrl && article.imageUrl.includes('firebasestorage')) {
                toast({ id: toastId, title: "Đang xóa ảnh cũ...", description: "Bước 1/2: Xử lý ảnh bìa." });
                await deleteImage(storage, article.imageUrl);
                finalImageUrl = `https://placehold.co/1200x800/F4DDDD/333333?text=No+Image`;
            }

            // Step 2: Prepare and save the final document data
            toast({ id: toastId, title: "Đang cập nhật bài viết...", description: "Bước 2/2: Lưu nội dung." });
            
            const updatedArticleData: Partial<NewsArticle> = {
                title: values.title,
                author: values.author,
                category: values.category,
                excerpt: values.excerpt,
                content: values.content,
                slug: generateSlug(values.title),
                imageUrl: finalImageUrl,
            };

            await setDoc(articleDocRef, updatedArticleData, { merge: true });

            // Step 3: Final success notification and navigation
            toast({
                id: toastId,
                title: "Thành công!",
                description: `Bài viết "${values.title}" đã được cập nhật.`,
            });
            router.push('/admin/news');

        } catch (error: any) {
            console.error("Lỗi khi cập nhật bài viết:", error);
            
            // This is a Firestore permission error
            if (error.name === 'FirebaseError' && error.code?.includes('permission-denied')) { 
                 const permissionError = new FirestorePermissionError({
                    path: articleDocRef.path,
                    operation: 'update',
                    requestResourceData: values
                });
                errorEmitter.emit('permission-error', permissionError);
            }

            toast({
                id: toastId,
                variant: 'destructive',
                title: 'Cập nhật thất bại',
                description: error.message || 'Đã có lỗi không xác định xảy ra.',
                duration: 9000,
            });
        } finally {
            // This is guaranteed to run, preventing the UI from getting stuck.
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
