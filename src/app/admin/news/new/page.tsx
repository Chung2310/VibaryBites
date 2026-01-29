'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useStorage } from '@/firebase';
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
    const storage = useStorage();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (values: NewsFormValues, imageFile: File | null) => {
        if (!firestore || !storage) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể kết nối tới dịch vụ." });
            return;
        }
        
        setIsSubmitting(true);
        const articleId = `news-${Date.now()}`;
        const docRef = doc(firestore, 'news_articles', articleId);
        let finalImageUrl = 'https://placehold.co/1200x800/F4DDDD/333333?text=No+Image';

        try {
            // Step 1: Upload image if it exists
            if (imageFile) {
                toast({ description: "Đang tải ảnh lên..." });
                finalImageUrl = await uploadImage(storage, `news/${articleId}`, imageFile);
            }

            // Step 2: Prepare data
            const newArticleData: NewsArticle = {
                id: articleId,
                slug: generateSlug(values.title),
                title: values.title,
                author: values.author,
                category: values.category,
                excerpt: values.excerpt,
                content: values.content,
                imageUrl: finalImageUrl,
                publicationDate: new Date().toISOString(),
            };

            // Step 3: Save to Firestore
            toast({ description: "Đang lưu bài viết..." });
            await setDoc(docRef, newArticleData);
            
            // Step 4: Success
            toast({ title: "Tạo bài viết thành công!", description: `"${values.title}" đã được tạo.` });
            router.push('/admin/news');

        } catch (error: any) {
            console.error("Lỗi khi tạo bài viết:", error);
            const errorMessage = (error.code?.includes('permission-denied')) 
                ? 'Lỗi quyền hạn. Vui lòng kiểm tra lại quy tắc bảo mật.'
                : error.message || 'Đã có lỗi không xác định xảy ra.';

            toast({
                variant: 'destructive',
                title: 'Lỗi tạo bài viết!',
                description: errorMessage,
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
