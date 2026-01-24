'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/firebase/storage';
import { ProductForm, type ProductFormValues } from '../product-form';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { generateSlug } from '@/lib/utils';

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
            toast({
                variant: "destructive",
                title: "Thiếu ảnh",
                description: "Vui lòng tải lên ít nhất một ảnh cho sản phẩm.",
            });
            return;
        }

        setIsSubmitting(true);
        const toastCtrl = toast({ title: "Đang xử lý...", description: "Vui lòng đợi trong giây lát." });

        let imageUrls: string[] = [];
        try {
            toastCtrl.update({ id: toastCtrl.id, title: `Đang tải lên ${newImageFiles.length} ảnh...` });
            const uploadPromises = newImageFiles.map(file => uploadImage(file));
            imageUrls = await Promise.all(uploadPromises);
            toastCtrl.update({ id: toastCtrl.id, title: "Tải ảnh lên thành công!" });
        } catch (error: any) {
            console.error("Lỗi khi tải ảnh lên:", error);
            toastCtrl.update({
                id: toastCtrl.id,
                variant: 'destructive',
                title: 'Lỗi tải ảnh lên!',
                description: `Không thể tải ảnh lên: ${error.message}`,
            });
            setIsSubmitting(false);
            return;
        }

        const productId = `prod-${Date.now()}`;
        const docRef = doc(firestore, 'cakes', productId);
        try {
            toastCtrl.update({ id: toastCtrl.id, title: "Đang lưu sản phẩm...", description: "Lưu dữ liệu vào cơ sở dữ liệu." });

            const newProduct: Product = {
                id: productId,
                slug: generateSlug(values.name),
                name: values.name,
                subtitle: values.subtitle,
                price: Number(values.price),
                stock: Number(values.stock),
                categorySlug: values.categorySlug,
                description: values.description,
                imageUrls: imageUrls,
                collection: values.categorySlug, // Defaulting collection to categorySlug
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
            
            toastCtrl.update({
                id: toastCtrl.id,
                title: 'Thêm thành công!',
                description: `Sản phẩm "${values.name}" đã được tạo.`,
            });
            
            router.push('/admin/products');

        } catch (error: any) {
            console.error("Error creating product:", error);
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
                description: `Không thể lưu sản phẩm: ${error.message}`,
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
