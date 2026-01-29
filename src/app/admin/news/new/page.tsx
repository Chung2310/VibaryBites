'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError, useStorage } from '@/firebase';
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
        if (!firestore) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể kết nối tới dịch vụ cơ sở dữ liệu." });
            return;
        }
        
        setIsSubmitting(true);
        
        const articleId = `news-${Date.now()}`;
        const docRef = doc(firestore, 'news_articles', articleId);
        
        // 1. Create the article data with a placeholder image URL if an image is being uploaded
        const newArticleData: NewsArticle = {
            id: articleId,
            slug: generateSlug(values.title),
            title: values.title,
            author: values.author,
            category: values.category,
            excerpt: values.excerpt,
            content: values.content,
            imageUrl: imageFile ? `https://placehold.co/1200x800/F4DDDD/333333?text=Uploading...` : `https://placehold.co/1200x800/F4DDDD/333333?text=No+Image`,
            publicationDate: new Date().toISOString(),
        };

        try {
            // 2. Save the main article data immediately
            await setDoc(docRef, newArticleData);
            toast({ title: "Đã tạo bài viết!", description: `"${values.title}" đã được lưu.` });

            // 3. Unblock the UI and navigate away
            setIsSubmitting(false);
            router.push('/admin/news');

            // 4. Start the image upload in the background (fire-and-forget from the UI's perspective)
            if (imageFile && storage) {
                uploadImage(storage, imageFile, `news/${articleId}`)
                    .then(async (downloadURL) => {
                        // 5. Once upload is complete, update the document with the real URL
                        await setDoc(docRef, { imageUrl: downloadURL }, { merge: true });
                        toast({ title: "Tải ảnh thành công", description: `Ảnh cho bài viết "${values.title}" đã được cập nhật.` });
                    })
                    .catch((uploadError) => {
                        // 6. If background upload fails, notify the user. The article text is still saved.
                        console.error("Background image upload failed:", uploadError);
                        toast({
                            variant: "destructive",
                            title: "Lỗi tải ảnh nền",
                            description: `Không thể tải ảnh cho bài viết "${values.title}". Bạn có thể chỉnh sửa lại bài viết để thử lại.`,
                            duration: 9000,
                        });
                    });
            }
        } catch (error: any) {
            // This catch block handles errors from the initial `setDoc`
            console.error("Lỗi khi tạo bài viết:", error);
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: values
            });
            errorEmitter.emit('permission-error', permissionError);
            
            toast({
                variant: 'destructive',
                title: 'Lỗi tạo bài viết!',
                description: error.message || 'Đã có lỗi không xác định xảy ra.',
                duration: 9000,
            });
             setIsSubmitting(false); // Ensure submitting state is reset on error
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
