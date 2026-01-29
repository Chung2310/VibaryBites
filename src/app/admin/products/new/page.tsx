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

export default function NewProductPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (values: ProductFormValues) => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể kết nối tới dịch vụ cơ sở dữ liệu." });
            return;
        }

        setIsSubmitting(true);
        const finalImageUrl = values.imageUrl || 'https://placehold.co/800x800/F4DDDD/333333?text=No+Image';
        
        try {
            const productId = `prod-${Date.now()}`;
            const docRef = doc(firestore, 'cakes', productId);

            const newProductData: Product = {
                id: productId,
                slug: generateSlug(values.name),
                name: values.name,
                subtitle: values.subtitle,
                price: Number(values.price),
                stock: Number(values.stock),
                categorySlug: values.categorySlug,
                description: values.description,
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

            await setDoc(docRef, newProductData);

            toast({ title: 'Thêm thành công!', description: `Sản phẩm "${values.name}" đã được tạo.` });
            router.push('/admin/products');

        } catch (error: any) {
            console.error("Lỗi khi tạo sản phẩm:", error);
            const permissionError = new FirestorePermissionError({
                path: 'cakes',
                operation: 'create',
                requestResourceData: values
            });
            errorEmitter.emit('permission-error', permissionError);
            
            toast({
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
