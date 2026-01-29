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
        if (!firestore || !article || !articleDocRef) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể kết nối tới dịch vụ hoặc không tìm thấy bài viết.',
            });
            return;
        }
        
        setIsSubmitting(true);
        
        const updatedArticleData: Partial<NewsArticle> = {
            title: values.title,
            author: values.author,
            category: values.category,
            excerpt: values.excerpt,
            content: values.content,
            slug: generateSlug(values.title),
        };

        try {
            // 1. Save text changes immediately
            await setDoc(articleDocRef, updatedArticleData, { merge: true });
            toast({ title: "Đã lưu nội dung!", description: `Các thay đổi cho "${values.title}" đã được lưu.` });

            // 2. Unblock the UI and navigate away
            setIsSubmitting(false);
            router.push('/admin/news');

            // 3. Handle image logic in the background
            if (imageFile && storage) {
                // A new image was uploaded. First, delete the old one if it exists.
                if (article.imageUrl) {
                    deleteImage(storage, article.imageUrl).catch(e => console.warn("Failed to delete old image, but proceeding with new upload.", e));
                }
                
                // Then, upload the new image and update the document.
                uploadImage(storage, imageFile, `news/${article.id}`)
                    .then(async (downloadURL) => {
                        await setDoc(articleDocRef, { imageUrl: downloadURL }, { merge: true });
                        toast({ title: "Tải ảnh thành công", description: `Ảnh cho bài viết đã được cập nhật.` });
                    })
                    .catch((uploadError) => {
                        console.error("Background image upload failed:", uploadError);
                        toast({
                            variant: "destructive",
                            title: "Lỗi tải ảnh nền",
                            description: `Không thể tải ảnh mới. Bạn có thể chỉnh sửa lại bài viết để thử lại.`,
                            duration: 9000,
                        });
                    });
            } else if (imageWasRemoved && article.imageUrl && storage) {
                // Image was removed, delete it from storage and update the doc in the background.
                deleteImage(storage, article.imageUrl)
                    .then(async () => {
                        await setDoc(articleDocRef, { imageUrl: `https://placehold.co/1200x800/F4DDDD/333333?text=No+Image` }, { merge: true });
                        toast({ title: "Đã xóa ảnh", description: `Ảnh của bài viết đã được xóa.` });
                    })
                    .catch((deleteError) => {
                        console.error("Background image deletion failed:", deleteError);
                        toast({
                            variant: "destructive",
                            title: "Lỗi xóa ảnh nền",
                            description: `Không thể xóa ảnh cũ. Vui lòng thử lại.`,
                            duration: 9000,
                        });
                    });
            }
        } catch (error: any) {
            // This catch handles errors from the initial `setDoc` for text data.
            console.error("Lỗi khi cập nhật bài viết:", error);
            const permissionError = new FirestorePermissionError({
                path: articleDocRef.path,
                operation: 'update',
                requestResourceData: values
            });
            errorEmitter.emit('permission-error', permissionError);

            toast({
                variant: 'destructive',
                title: 'Không thể cập nhật bài viết',
                description: error.message || 'Đã có lỗi không xác định xảy ra.',
                duration: 9000,
            });
            setIsSubmitting(false); // Ensure submitting state is reset on error
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
