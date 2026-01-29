'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useStorage, errorEmitter, FirestorePermissionError } from '@/firebase';
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
    
    const handleFormSubmit = async (values: NewsFormValues) => {
        if (!firestore || !article || !articleDocRef || !storage) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể kết nối hoặc tìm thấy bài viết.' });
            return;
        }
        
        setIsSubmitting(true);
        let finalImageUrl = article.imageUrl;
        
        try {
            if (values.imageFile) {
                if (article.imageUrl) {
                   await deleteImage(storage, article.imageUrl);
                }
                finalImageUrl = await uploadImage(storage, values.imageFile, 'news_images');
            } else if (!values.imageUrl && article.imageUrl) {
                await deleteImage(storage, article.imageUrl);
                finalImageUrl = 'https://placehold.co/1200x800/F4DDDD/333333?text=No+Image';
            }

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

            toast({ title: "Cập nhật thành công!", description: `"${values.title}" đã được cập nhật.` });
            router.push('/admin/news');

        } catch (error: any) {
            console.error("Lỗi khi cập nhật bài viết:", error);
            const isPermissionError = error.code === 'storage/unauthorized' || error.code === 'permission-denied';

            if (isPermissionError) {
                 errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: articleDocRef.path,
                    operation: 'update',
                    requestResourceData: values,
                }));
            }

            toast({
                variant: 'destructive',
                title: 'Cập nhật thất bại',
                description: isPermissionError ? 'Bạn không có quyền tải ảnh lên.' : (error.message || 'Đã có lỗi không xác định xảy ra.'),
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
