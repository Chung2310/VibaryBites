'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
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

    // The handler now accepts newImageFiles. The third argument (keptImageUrls) is ignored for new products.
    const handleFormSubmit = async (values: ProductFormValues, newImageFiles: File[]) => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Lỗi Firestore',
                description: 'Không thể kết nối tới cơ sở dữ liệu.',
            });
            return;
        }

        if (newImageFiles.length === 0) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Vui lòng tải lên ít nhất một ảnh.",
            });
            return;
        }
        
        setIsSubmitting(true);

        try {
            // Upload all new files
            const uploadPromises = newImageFiles.map(file => uploadImage(file));
            const uploadedUrls = await Promise.all(uploadPromises);

            const id = `prod-${Date.now()}`;
            const docRef = doc(firestore, 'cakes', id);

            const newProduct: Product = {
                id,
                slug: generateSlug(values.name),
                name: values.name,
                subtitle: values.subtitle,
                description: values.description,
                price: Number(values.price),
                stock: Number(values.stock),
                categorySlug: values.categorySlug,
                imageUrls: uploadedUrls, // Use the new URLs
                // Initialize detailed fields as empty
                detailedDescription: {
                    flavor: "",
                    ingredients: "",
                    serving: "",
                    storage: "",
                    dimensions: "",
                    accessories: [],
                },
                flavorProfile: [],
                structure: [],
                collection: 'special-occasions', // Default collection
                recipe: [],
            };

            await setDoc(docRef, newProduct);
            
            toast({
                title: 'Thêm thành công!',
                description: `Sản phẩm "${values.name}" đã được thêm. Bạn có thể chỉnh sửa chi tiết ngay bây giờ.`,
            });
            
            router.push(`/admin/recipes?productId=${id}`);

        } catch (error) {
            console.error("Error creating product: ", error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: (error as Error).message || 'Không thể lưu sản phẩm.',
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
