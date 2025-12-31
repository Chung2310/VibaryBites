
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/firebase/storage';
import { ProductForm, type ProductFormValues } from '../product-form';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewProductPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (values: ProductFormValues, imageFiles: File[], existingImageUrls: string[]) => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Lỗi Firestore',
                description: 'Không thể kết nối tới cơ sở dữ liệu.',
            });
            return;
        }

        if (imageFiles.length === 0) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Vui lòng tải lên ít nhất một ảnh.",
            });
            return;
        }
        
        setIsSubmitting(true);

        try {
            const uploadPromises = imageFiles.map(file => uploadImage(file));
            const uploadedUrls = await Promise.all(uploadPromises);

            const id = `prod-${Date.now()}`;
            const docRef = doc(firestore, 'cakes', id);

            const newProduct: Product = {
                id,
                slug: values.name.toLowerCase().replace(/\s+/g, '-'),
                name: values.name,
                subtitle: values.subtitle,
                description: values.description,
                price: Number(values.price),
                stock: Number(values.stock),
                categorySlug: values.categorySlug,
                imageUrls: uploadedUrls,
                detailedDescription: {
                    flavor: values.detailedDescription_flavor,
                    ingredients: values.detailedDescription_ingredients,
                    serving: values.detailedDescription_serving,
                    storage: values.detailedDescription_storage,
                    dimensions: values.detailedDescription_dimensions,
                    accessories: values.detailedDescription_accessories.split('\n').filter(Boolean),
                },
                flavorProfile: values.flavorProfile.split('\n').filter(Boolean),
                structure: values.structure.split('\n').filter(Boolean),
                collection: 'special-occasions', // Default collection, consider making this a form field
            };

            await setDoc(docRef, newProduct);
            
            toast({
                title: 'Thêm thành công!',
                description: `Sản phẩm "${values.name}" đã được thêm vào hệ thống.`,
            });
            
            router.push('/admin/products');

        } catch (error) {
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
                    <CardTitle>Thông tin sản phẩm</CardTitle>
                    <CardDescription>Điền các chi tiết cho sản phẩm mới của bạn.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductForm 
                        onSubmit={handleFormSubmit}
                        onCancel={() => router.push('/admin/products')}
                        isSubmitting={isSubmitting}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

