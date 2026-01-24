'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/firebase/storage';
import { NewsForm, type NewsFormValues } from '../news-form';
import type { NewsArticle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { generateSlug } from '@/lib/utils';


export default function NewNewsArticlePage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (values: NewsFormValues, imageFile: File | null) => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể kết nối tới cơ sở dữ liệu." });
            return;
        }
        
        if (!imageFile) {
            toast({
                variant: "destructive",
                title: "Thiếu ảnh",
                description: "Vui lòng tải lên ảnh bìa cho bài viết.",
            });
            return;
        }

        setIsSubmitting(true);
        const toastCtrl = toast({ title: "Đang xử lý...", description: "Vui lòng đợi trong giây lát." });
        
        const articleId = `news-${Date.now()}`;
        const docRef = doc(firestore, 'news_articles', articleId);

        try {
            // 1. Upload image
            toastCtrl.update({ title: "Đang tải lên ảnh bìa..." });
            const imageUrl = await uploadImage(imageFile);
            
            toastCtrl.update({ title: "Đang lưu bài viết..." });

            // 2. Prepare article data
            const newArticle: NewsArticle = {
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

            // 3. Save to Firestore
            await setDoc(docRef, newArticle);
            
            toastCtrl.update({
                variant: "default",
                title: 'Thêm thành công!',
                description: `Bài viết "${values.title}" đã được tạo.`,
            });
            
            router.push('/admin/news');

        } catch (error: any) {
             console.error("!!!!!!!!!!! RAW ERROR CAUGHT ON NEWS CREATION !!!!!!!!!!!");
            console.error(error);
            console.error("Error Code:", error.code);
            console.error("Error Message:", error.message);
            console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

            toastCtrl.update({
                variant: 'destructive',
                title: 'Không thể tạo bài viết',
                description: `Đã xảy ra lỗi: ${error.message}. Vui lòng kiểm tra Console (F12) để biết thêm chi tiết.`,
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
