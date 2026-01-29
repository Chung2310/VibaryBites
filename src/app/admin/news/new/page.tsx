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

    const handleFormSubmit = (values: NewsFormValues, imageFile: File | null) => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể kết nối tới dịch vụ." });
            return;
        }
        
        setIsSubmitting(true);

        const articleId = `news-${Date.now()}`;
        const docRef = doc(firestore, 'news_articles', articleId);
        
        // Create the document with a placeholder URL immediately
        const newArticleData: NewsArticle = {
            id: articleId,
            slug: generateSlug(values.title),
            title: values.title,
            author: values.author,
            category: values.category,
            excerpt: values.excerpt,
            content: values.content,
            imageUrl: `https://placehold.co/1200x800/F4DDDD/333333?text=Uploading...`,
            publicationDate: new Date().toISOString(),
        };

        setDoc(docRef, newArticleData)
            .then(() => {
                // Navigate immediately after initial save
                toast({
                    title: "Đã lưu bài viết!",
                    description: `Đang tải ảnh lên trong nền...`,
                });
                router.push('/admin/news');

                // If there's an image, handle upload in the background
                if (imageFile && storage) {
                    uploadImage(storage, `news/${articleId}`, imageFile)
                        .then(downloadURL => {
                            // Update the doc with the real image URL
                            return setDoc(docRef, { imageUrl: downloadURL }, { merge: true });
                        })
                        .catch(uploadError => {
                            console.error("Background image upload failed:", uploadError);
                            // Update the doc to show a failed state
                            setDoc(docRef, { imageUrl: `https://placehold.co/1200x800/FF0000/FFFFFF?text=Upload+Failed` }, { merge: true });
                        });
                } else {
                    // If no image file, set to the default "No Image" placeholder
                    setDoc(docRef, { imageUrl: `https://placehold.co/1200x800/F4DDDD/333333?text=No+Image` }, { merge: true });
                }
            })
            .catch((error: any) => {
                // Handle errors from the initial setDoc
                console.error("Lỗi khi tạo bài viết:", error);
                
                if (error.name === 'FirebaseError' && error.code?.includes('permission-denied')) { 
                    const permissionError = new FirestorePermissionError({
                        path: docRef.path,
                        operation: 'create',
                        requestResourceData: newArticleData
                    });
                    errorEmitter.emit('permission-error', permissionError);
                }
                
                toast({
                    variant: 'destructive',
                    title: 'Lỗi tạo bài viết!',
                    description: error.message || 'Đã có lỗi không xác định xảy ra.',
                    duration: 9000,
                });
                 setIsSubmitting(false); // Re-enable form on initial save failure
            });
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
