'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
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
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const productDocRef = useMemoFirebase(() => {
        if (!firestore || !productId) return null;
        return doc(firestore, 'cakes', productId);
    }, [firestore, productId]);

    const { data: product, isLoading } = useDoc<Product>(productDocRef);
    
    const handleFormSubmit = async (values: ProductFormValues) => {
        if (!firestore || !product || !productDocRef) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể kết nối hoặc tìm thấy sản phẩm.' });
            return;
        }
        
        setIsSubmitting(true);
        let finalImageUrl = product.imageUrl;
        
        try {
            // Step 1: Handle image upload/delete if changed
            if (values.imageFile) {
                // Delete old image if it exists and is not a placeholder
                if (product.imageUrl) {
                   await deleteImage(product.imageUrl);
                }
                // Upload the new image
                finalImageUrl = await uploadImage(values.imageFile);
            } else if (!values.imageUrl && product.imageUrl) {
                // Image was removed without a new one being added
                await deleteImage(product.imageUrl);
                finalImageUrl = 'https://placehold.co/800x800/F4DDDD/333333?text=No+Image';
            }


            // Step 2: Prepare data for Firestore
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
            await setDoc(productDocRef, updatedProductData, { merge: true });

            toast({ title: 'Cập nhật thành công!', description: `Sản phẩm "${values.name}" đã được cập nhật.` });
            router.push(`/admin/products`);

        } catch (error: any) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            const isPermissionError = error.code === 'storage/unauthorized' || error.code === 'permission-denied';

            if (isPermissionError) {
                 errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: productDocRef.path,
                    operation: 'update',
                    requestResourceData: values
                }));
            }
            
            toast({
                variant: 'destructive',
                title: 'Không thể cập nhật sản phẩm',
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
