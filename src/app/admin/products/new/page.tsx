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

    const handleFormSubmit = async (values: ProductFormValues, newImageFiles: File[], keptImageUrls: string[]) => {
        setIsSubmitting(true);

        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Lỗi nghiêm trọng',
                description: 'Không thể kết nối tới cơ sở dữ liệu.',
            });
            setIsSubmitting(false);
            return;
        }

        if (newImageFiles.length === 0) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Vui lòng cung cấp ít nhất một ảnh cho sản phẩm.",
            });
            setIsSubmitting(false);
            return;
        }

        const id = `prod-${Date.now()}`;
        const docRef = doc(firestore, 'cakes', id);
        let productDataForError: any = { ...values };

        try {
            const uploadPromises = newImageFiles.map(file => uploadImage(file));
            const uploadedImageUrls = await Promise.all(uploadPromises);

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
                // Default values for fields not in the basic product form
                collection: 'special-occasions', 
                detailedDescription: { flavor: "", ingredients: "", serving: "", storage: "", dimensions: "", accessories: [] },
                flavorProfile: [],
                structure: [],
                recipe: "",
            };
            
            productDataForError = newProduct;

            await setDoc(docRef, newProduct);
            
            toast({
                title: 'Thêm thành công!',
                description: `Sản phẩm "${newProduct.name}" đã được tạo.`,
            });
            
            router.push(`/admin/products`);

        } catch (error: any) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: productDataForError
            });
            errorEmitter.emit('permission-error', permissionError);
            
            toast({
                variant: 'destructive',
                title: 'Không thể tạo sản phẩm',
                description: 'Đã xảy ra lỗi khi lưu sản phẩm. Vui lòng kiểm tra quyền truy cập của bạn và thử lại.',
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
                    <CardTitle>Thông tin cơ bản</CardTitle>
                    <CardDescription>Điền các thông tin cần thiết để tạo sản phẩm. Bạn sẽ có thể thêm công thức và các chi tiết khác ở các trang quản lý khác.</CardDescription>
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
