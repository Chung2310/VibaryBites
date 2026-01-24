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
        if (!firestore) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể kết nối tới cơ sở dữ liệu." });
            return;
        }

        if (newImageFiles.length === 0) {
            toast({ variant: "destructive", title: "Thiếu ảnh", description: "Vui lòng tải lên ít nhất một ảnh cho sản phẩm." });
            return;
        }

        setIsSubmitting(true);
        const toastCtrl = toast({ title: "Đang xử lý...", description: "Vui lòng đợi trong giây lát." });
        
        // Step 1: Upload images
        let imageUrls: string[] = [];
        try {
            toastCtrl.update({ id: toastCtrl.id, title: `Đang tải lên ${newImageFiles.length} ảnh...`, description: "Bước 1/2: Tải ảnh lên máy chủ." });
            const uploadPromises = newImageFiles.map(file => uploadImage(file));
            imageUrls = await Promise.all(uploadPromises);
        } catch (error: any) {
            console.error("Error during image upload:", error);
            toastCtrl.update({
                id: toastCtrl.id,
                variant: 'destructive',
                title: 'Lỗi tải ảnh lên!',
                description: `Không thể tải ảnh lên: ${error.message}`,
                duration: 9000,
            });
            setIsSubmitting(false);
            return; // Stop the process
        }

        // Step 2: Save product data to Firestore
        const productId = `prod-${Date.now()}`;
        const docRef = doc(firestore, 'cakes', productId);
        try {
            toastCtrl.update({ id: toastCtrl.id, title: "Đang lưu thông tin sản phẩm...", description: "Bước 2/2: Lưu dữ liệu vào cơ sở dữ liệu." });
            
            const newProduct: Product = {
                id: productId,
                slug: generateSlug(values.name),
                name: values.name,
                subtitle: values.subtitle,
                description: values.description,
                price: Number(values.price),
                stock: Number(values.stock),
                categorySlug: values.categorySlug,
                imageUrls: imageUrls,
                collection: 'special-occasions', // Default value
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
                sizes: [],
            };

            await setDoc(docRef, newProduct);
            
            toastCtrl.update({
                id: toastCtrl.id,
                variant: "default",
                title: 'Thêm thành công!',
                description: `Sản phẩm "${values.name}" đã được tạo.`,
            });
            
            router.push('/admin/products');

        } catch (error: any) {
            console.error("Error saving product to Firestore:", error);
            
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: values
            });
            errorEmitter.emit('permission-error', permissionError);

            toastCtrl.update({
                id: toastCtrl.id,
                variant: 'destructive',
                title: 'Lỗi lưu sản phẩm!',
                description: `Không thể lưu thông tin sản phẩm: ${error.message}`,
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
