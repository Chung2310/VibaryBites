'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError, useStorage } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { ProductForm, type ProductFormValues } from '../product-form';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { generateSlug } from '@/lib/utils';
import { uploadImage } from '@/firebase/storage';

export default function NewProductPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (values: ProductFormValues, imageFile: File | null, imagePreview: string | null) => {
        if (!firestore || !storage) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể kết nối tới dịch vụ cơ sở dữ liệu." });
            return;
        }

        setIsSubmitting(true);
        const { id: toastId } = toast({ title: "Đang tạo sản phẩm...", description: "Vui lòng đợi." });
        
        try {
            const productId = `prod-${Date.now()}`;
            let imageUrl = `https://placehold.co/800x600/F4DDDD/333333?text=No+Image`;

            if (imageFile) {
                toast({ id: toastId, title: "Đang tải ảnh lên...", description: "Bước 1/2: Xử lý ảnh sản phẩm." });
                imageUrl = await uploadImage(storage, `products/${productId}`, imageFile);
            } else if (imagePreview) {
                imageUrl = imagePreview;
            }

            toast({ id: toastId, title: "Đang lưu sản phẩm...", description: "Bước 2/2: Lưu dữ liệu." });

            const newProductData: Product = {
                id: productId,
                slug: generateSlug(values.name),
                name: values.name,
                subtitle: values.subtitle,
                price: Number(values.price),
                stock: Number(values.stock),
                categorySlug: values.categorySlug,
                description: values.description,
                imageUrl: imageUrl,
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

            const docRef = doc(firestore, 'cakes', productId);
            await setDoc(docRef, newProductData);
            
            toast({
                id: toastId,
                title: 'Thêm thành công!',
                description: `Sản phẩm "${values.name}" đã được tạo.`,
            });
            router.push('/admin/products');

        } catch (error: any) {
            console.error("Lỗi khi tạo sản phẩm:", error);

            if (error.name !== 'Error' && firestore) {
                 const permissionError = new FirestorePermissionError({
                    path: `cakes/prod-${Date.now()}`,
                    operation: 'create',
                    requestResourceData: values
                });
                errorEmitter.emit('permission-error', permissionError);
            }
            
            toast({
                id: toastId,
                variant: 'destructive',
                title: 'Lỗi tạo sản phẩm!',
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
                    <Link href="/admin/products">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Thêm Sản phẩm Mới
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin sản phẩm</CardTitle>
                    <CardDescription>Điền tất cả các thông tin cần thiết để tạo một sản phẩm mới.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductForm 
                        isEditMode={false}
                        onSubmit={handleFormSubmit}
                        onCancel={() => router.push('/admin/products')}
                        isSubmitting={isSubmitting}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
