'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
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
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (values: ProductFormValues, newImageFiles: File[]) => {
        setIsSubmitting(true);
        const toastId = toast({
            title: "Đang xử lý...",
            description: "Bắt đầu quá trình tạo sản phẩm mới.",
        });

        if (!firestore) {
            toastId.update({
                id: toastId.id,
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Dịch vụ cơ sở dữ liệu chưa sẵn sàng.',
            });
            setIsSubmitting(false);
            return;
        }

        if (newImageFiles.length === 0) {
            toastId.update({
                id: toastId.id,
                variant: 'destructive',
                title: 'Thiếu ảnh',
                description: 'Vui lòng thêm ít nhất một ảnh cho sản phẩm.',
            });
            setIsSubmitting(false);
            return;
        }

        try {
            toastId.update({
                id: toastId.id,
                title: "Đang tải ảnh lên...",
                description: `Đang tải lên ${newImageFiles.length} ảnh. Vui lòng chờ...`,
            });
            const uploadPromises = newImageFiles.map(file => uploadImage(file));
            const uploadedImageUrls = await Promise.all(uploadPromises);

            toastId.update({
                id: toastId.id,
                title: "Đang lưu thông tin...",
                description: "Ảnh đã được tải lên. Đang lưu chi tiết sản phẩm.",
            });

            const id = `prod-${Date.now()}`;
            const docRef = doc(firestore, 'cakes', id);

            const newProduct: Product = {
                id,
                slug: generateSlug(values.name),
                name: values.name,
                subtitle: values.subtitle || "",
                description: values.description,
                price: Number(values.price),
                stock: Number(values.stock),
                categorySlug: values.categorySlug,
                imageUrls: uploadedImageUrls,
                collection: 'special-occasions', // Default value
                sizes: [], // Default value
                detailedDescription: {
                    flavor: values.detailedDescription_flavor,
                    ingredients: values.detailedDescription_ingredients,
                    serving: values.detailedDescription_serving,
                    storage: values.detailedDescription_storage,
                    dimensions: values.detailedDescription_dimensions,
                    accessories: values.detailedDescription_accessories?.split('\n').filter(Boolean) || [],
                },
                flavorProfile: values.flavorProfile?.split('\n').filter(Boolean) || [],
                structure: values.structure?.split('\n').filter(Boolean) || [],
            };

            await setDoc(docRef, newProduct);

            toastId.update({
                id: toastId.id,
                title: 'Thêm thành công!',
                description: `Sản phẩm "${newProduct.name}" đã được tạo.`,
            });
            
            router.push(`/admin/products`);

        } catch (error: any) {
            const permissionError = new FirestorePermissionError({
                path: `cakes/prod-${Date.now()}`,
                operation: 'create',
                requestResourceData: values 
            });
            errorEmitter.emit('permission-error', permissionError);
            
            toastId.update({
                id: toastId.id,
                variant: 'destructive',
                title: 'Không thể tạo sản phẩm',
                description: `Đã xảy ra lỗi không mong muốn. Chi tiết: ${error.message}`,
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
