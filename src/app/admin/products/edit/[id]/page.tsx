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
    
    const handleFormSubmit = async (values: ProductFormValues, imageFile: File | null, imagePreview: string | null, imageWasRemoved?: boolean) => {
        if (!firestore || !product || !productDocRef) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể kết nối tới dịch vụ hoặc không tìm thấy sản phẩm.',
            });
            return;
        }
        
        setIsSubmitting(true);
        const toastId = toast({ title: "Đang cập nhật...", description: "Vui lòng đợi trong giây lát." }).id;
        
        try {
            let finalImageUrl = product.imageUrl;

            if (imageFile) {
                if (product.imageUrl) {
                    deleteImage(product.imageUrl).catch(e => console.warn("Failed to delete old image, proceeding with upload.", e));
                }
                toast({ id: toastId, title: "Đang tải ảnh mới lên...", description: "Vui lòng đợi..." });
                finalImageUrl = await uploadImage(imageFile, `products/${product.id}`);
                toast({ id: toastId, title: "Xử lý ảnh thành công!" });
            } else if (imageWasRemoved && product.imageUrl) {
                 deleteImage(product.imageUrl).catch(e => console.warn("Failed to delete old image.", e));
                finalImageUrl = `https://placehold.co/800x600/F4DDDD/333333?text=No+Image`;
            } else if (imagePreview) {
                finalImageUrl = imagePreview;
            } else {
                finalImageUrl = `https://placehold.co/800x600/F4DDDD/333333?text=No+Image`;
            }
            
            toast({ id: toastId, title: "Đang lưu thông tin sản phẩm...", description: "" });
            const updatedProductData: Partial<Product> = {
                name: values.name,
                subtitle: values.subtitle,
                description: values.description,
                price: Number(values.price),
                stock: Number(values.stock),
                categorySlug: values.categorySlug,
                imageUrl: finalImageUrl,
                slug: generateSlug(values.name),
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

            await setDoc(productDocRef, updatedProductData, { merge: true });

            toast({
                id: toastId,
                title: 'Cập nhật thành công!',
                description: `Sản phẩm "${values.name}" đã được cập nhật.`,
            });
            router.push(`/admin/products`);
        } catch (error: any) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            const isStorageError = error.message.includes("Upload timed out") || error.message.includes("Failed to upload image");
            
            if (!isStorageError) {
                 const permissionError = new FirestorePermissionError({
                    path: productDocRef.path,
                    operation: 'update',
                    requestResourceData: values
                });
                errorEmitter.emit('permission-error', permissionError);
            }
            
            toast({
                id: toastId,
                variant: 'destructive',
                title: isStorageError ? 'Lỗi tải ảnh lên!' : 'Không thể cập nhật sản phẩm',
                description: error.message || 'Đã có lỗi không xác định xảy ra.',
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
