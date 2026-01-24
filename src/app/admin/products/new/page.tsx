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
        const toastId = 'product-creation-toast';

        // 1. Initial Checks
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Dịch vụ cơ sở dữ liệu chưa sẵn sàng.' });
            setIsSubmitting(false);
            return;
        }
        if (newImageFiles.length === 0) {
            toast({ variant: 'destructive', title: 'Thiếu ảnh', description: 'Vui lòng thêm ít nhất một ảnh cho sản phẩm.' });
            setIsSubmitting(false);
            return;
        }

        toast({ id: toastId, title: 'Đang xử lý...', description: 'Vui lòng chờ trong khi sản phẩm được tạo.' });

        try {
            // 2. Upload Images to Firebase Storage
            toast({ id: toastId, title: 'Đang tải ảnh lên...', description: `Đang tải lên ${newImageFiles.length} ảnh. Vui lòng không rời khỏi trang.` });
            const uploadPromises = newImageFiles.map(file => uploadImage(file));
            const uploadedImageUrls = await Promise.all(uploadPromises);

            // 3. Prepare Product Data
            toast({ id: toastId, title: 'Đang lưu thông tin...', description: 'Ảnh đã tải lên thành công, đang lưu chi tiết sản phẩm.' });
            
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
                // Initialize optional/complex fields to avoid 'undefined' issues with Firestore
                collection: 'special-occasions', // default
                sizes: [],
                detailedDescription: { flavor: "", ingredients: "", serving: "", storage: "", dimensions: "", accessories: [] },
                flavorProfile: [],
                structure: [],
                recipe: "",
            };

            // 4. Save to Firestore
            await setDoc(docRef, newProduct);

            // 5. Success
            toast({
                title: 'Thêm thành công!',
                description: `Sản phẩm "${newProduct.name}" đã được tạo.`,
            });
            
            router.push(`/admin/products`);

        } catch (error: any) {
            // 6. Error Handling
            console.error("Lỗi khi tạo sản phẩm:", error);

            const permissionError = new FirestorePermissionError({
                path: 'cakes/new-product-id', // Placeholder path for error context
                operation: 'create',
                requestResourceData: values 
            });
            errorEmitter.emit('permission-error', permissionError);
            
            toast({
                variant: 'destructive',
                title: 'Không thể tạo sản phẩm',
                description: `Đã xảy ra lỗi không mong muốn. Vui lòng kiểm tra lại quyền truy cập hoặc thử lại sau.`,
                duration: 9000,
            });
        } finally {
            // 7. Finalization
            toast.dismiss(toastId);
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
