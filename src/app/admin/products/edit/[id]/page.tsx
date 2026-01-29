'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useStorage } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { ProductForm, type ProductFormValues } from '../../product-form';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { generateSlug } from '@/lib/utils';
import { uploadImage, deleteImage } from '@/firebase/storage';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = (params.id || '') as string;
    
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const productDocRef = useMemoFirebase(() => {
        if (!firestore || !productId) return null;
        return doc(firestore, 'cakes', productId);
    }, [firestore, productId]);

    const { data: product, isLoading } = useDoc<Product>(productDocRef);
    
    const handleFormSubmit = async (values: ProductFormValues, imageFile: File | null, imageWasRemoved: boolean) => {
        if (!firestore || !storage || !product || !productDocRef) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể kết nối hoặc tìm thấy sản phẩm.' });
            return;
        }
        
        setIsSubmitting(true);
        let finalImageUrl = product.imageUrl; // Start with existing URL

        try {
            // Step 1: Handle image changes
            if (imageFile) {
                toast({ description: "Đang tải ảnh mới lên..." });
                if (product.imageUrl && product.imageUrl.includes('firebasestorage')) {
                    await deleteImage(storage, product.imageUrl);
                }
                finalImageUrl = await uploadImage(storage, `products/${product.id}`, imageFile);
            } else if (imageWasRemoved) {
                if (product.imageUrl && product.imageUrl.includes('firebasestorage')) {
                    toast({ description: "Đang xóa ảnh cũ..." });
                    await deleteImage(storage, product.imageUrl);
                }
                finalImageUrl = 'https://placehold.co/800x600/F4DDDD/333333?text=No+Image';
            }
            
            // Step 2: Prepare data
            const updatedProductData: Partial<Product> = {
                name: values.name,
                subtitle: values.subtitle,
                description: values.description,
                price: Number(values.price),
                stock: Number(values.stock),
                categorySlug: values.categorySlug,
                slug: generateSlug(values.name),
                imageUrl: finalImageUrl,
                detailedDescription: {
                    flavor: values.detailedDescription_flavor,
                    ingredients: values.detailedDescription_ingredients,
                    storage: values.detailedDescription_storage,
                    dimensions: values.detailedDescription_dimensions,
                    accessories: values.detailedDescription_accessories?.split('\n').filter(Boolean) || [],
                },
                flavorProfile: values.flavorProfile?.split('\n').filter(Boolean) || [],
                structure: values.structure?.split('\n').filter(Boolean) || [],
            };

            // Step 3: Save to Firestore
            toast({ description: "Đang lưu thay đổi..." });
            await setDoc(productDocRef, updatedProductData, { merge: true });

            // Step 4: Success
            toast({ title: 'Cập nhật thành công!', description: `Sản phẩm "${values.name}" đã được cập nhật.` });
            router.push(`/admin/products`);

        } catch (error: any) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            const errorMessage = (error.code?.includes('permission-denied'))
                ? 'Lỗi quyền hạn. Vui lòng kiểm tra lại quy tắc bảo mật.'
                : error.message || 'Đã có lỗi không xác định xảy ra.';
            
            toast({
                variant: 'destructive',
                title: 'Không thể cập nhật sản phẩm',
                description: errorMessage,
                duration: 9000,
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
                    Chỉnh sửa: {product.name}
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin sản phẩm</CardTitle>
                    <CardDescription>Cập nhật tất cả các thông tin cho sản phẩm này.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductForm 
                        isEditMode={true}
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
