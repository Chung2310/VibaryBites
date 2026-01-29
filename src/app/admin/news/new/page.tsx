'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { NewsForm, type NewsFormValues } from '../news-form';
import type { NewsArticle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { generateSlug } from '@/lib/utils';
import { uploadImage } from '@/firebase/storage';

export default function NewNewsArticlePage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (values: NewsFormValues, imageFile: File | null) => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể kết nối tới dịch vụ cơ sở dữ liệu." });
            return;
        }
        
        setIsSubmitting(true);
        const toastId = toast({ title: "Đang xử lý...", description: "Vui lòng đợi trong giây lát." }).id;
        
        const articleId = `news-${Date.now()}`;
        const docRef = doc(firestore, 'news_articles', articleId);

        try {
            let imageUrl = `https://placehold.co/1200x800/F4DDDD/333333?text=No+Image`;
            if (imageFile) {
                toast({ id: toastId, title: "Đang tải ảnh bìa lên...", description: `Tải lên ${imageFile.name}...` });
                imageUrl = await uploadImage(imageFile, `news/${articleId}`);
                toast({ id: toastId, title: "Tải ảnh lên thành công!" });
            }

            toast({ id: toastId, title: "Đang lưu bài viết...", description: "Lưu dữ liệu vào cơ sở dữ liệu." });

            const newArticleData: NewsArticle = {
                id: articleId,
                slug: generateSlug(values.title),
                title: values.title,
                author: values.author,
                category: values.category,
                excerpt: values.excerpt,
                content: values.content,
                imageUrl: imageUrl,
                publicationDate: new Date().toISOString(),
            };

            await setDoc(docRef, newArticleData);
            
            toast({
                id: toastId,
                title: 'Thêm thành công!',
                description: `Bài viết "${values.title}" đã được tạo.`,
            });
            
            router.push('/admin/news');

        } catch (error: any) {
            console.error("Lỗi khi tạo bài viết:", error);
            if (!(error.code && error.code.startsWith('storage/'))) {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'create',
                    requestResourceData: values
                });
                errorEmitter.emit('permission-error', permissionError);
            }
            toast({
                id: toastId,
                variant: 'destructive',
                title: 'Lỗi lưu bài viết!',
                description: error.message || 'Đã có lỗi không xác định xảy ra.',
                duration: 9000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    Tạo Bài Viết Mới
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Nội dung bài viết</CardTitle>
                    <CardDescription>Điền các thông tin cần thiết để tạo một bài viết mới trên trang tin tức.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NewsForm 
                        isEditMode={false}
                        onSubmit={handleFormSubmit}
                        onCancel={() => router.push('/admin/news')}
                        isSubmitting={isSubmitting}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
