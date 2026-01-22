

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { uploadImage, deleteImage } from '@/firebase/storage';
import { ProductForm, type ProductFormValues } from '../../product-form';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const productDocRef = useMemoFirebase(() => {
        if (!firestore || !productId) return null;
        return doc(firestore, 'cakes', productId);
    }, [firestore, productId]);

    const { data: product, isLoading } = useDoc<Product>(productDocRef);
    
    const handleFormSubmit = async (values: ProductFormValues, imageFiles: File[], existingImageUrls: string[]) => {
        if (!firestore || !product) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể kết nối tới cơ sở dữ liệu hoặc không tìm thấy sản phẩm.',
            });
            return;
        }
        
        setIsSubmitting(true);

        try {
            // Identify URLs to delete
            const urlsToDelete = (product.imageUrls || []).filter(url => !existingImageUrls.includes(url));

            // Upload new images
            const uploadPromises = imageFiles.map(file => uploadImage(file));
            const newUploadedUrls = await Promise.all(uploadPromises);

            // Once uploads are successful, delete the old images
            if (urlsToDelete.length > 0) {
                const deletePromises = urlsToDelete.map(url => deleteImage(url).catch(err => console.warn(`Failed to delete image ${url}`, err)));
                await Promise.all(deletePromises);
            }

            const finalImageUrls = [...existingImageUrls, ...newUploadedUrls];
            
            if (finalImageUrls.length === 0) {
                 toast({
                    variant: "destructive",
                    title: "Lỗi",
                    description: "Sản phẩm phải có ít nhất một ảnh.",
                });
                setIsSubmitting(false);
                return;
            }

            const docRef = doc(firestore, 'cakes', product.id);

            const updatedProductData: Partial<Product> = {
                name: values.name,
                subtitle: values.subtitle,
                description: values.description,
                price: Number(values.price),
                stock: Number(values.stock),
                categorySlug: values.categorySlug,
                imageUrls: finalImageUrls,
                slug: values.name.toLowerCase().replace(/\s+/g, '-'),
            };

            await setDoc(docRef, updatedProductData, { merge: true });
            
            toast({
                title: 'Cập nhật thành công!',
                description: `Sản phẩm "${values.name}" đã được cập nhật.`,
            });
            
            router.push('/admin/products');

        } catch (error) {
            console.error("Error updating product: ", error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: (error as Error).message || 'Không thể lưu sản phẩm.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="space-y-4">
                 <h1 className="text-xl font-semibold">Đang tải sản phẩm...</h1>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                 </Card>
            </div>
        )
    }

    if (!product) {
        return <div>Không tìm thấy sản phẩm.</div>
    }

    return (
        <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/admin/products">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Chỉnh sửa chi tiết: {product.name}
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin cơ bản sản phẩm</CardTitle>
                    <CardDescription>Cập nhật các thông tin cơ bản cho sản phẩm. Các thuộc tính chi tiết được quản lý ở trang "Thuộc tính sản phẩm".</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductForm 
                        isEditMode={true} // Specify this is edit mode
                        product={product}
                        onSubmit={handleFormSubmit}
                        onCancel={() => router.push('/admin/products')}
                        isSubmitting={isSubmitting}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
