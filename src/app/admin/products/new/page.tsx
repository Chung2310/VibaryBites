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

    const handleFormSubmit = (values: ProductFormValues, imageFile: File | null, imagePreview: string | null) => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể kết nối tới dịch vụ cơ sở dữ liệu." });
            return;
        }

        setIsSubmitting(true);
        
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
            imageUrl: imageFile ? `https://placehold.co/800x600/F4DDDD/333333?text=Uploading...` : (imagePreview || `https://placehold.co/800x600/F4DDDD/333333?text=No+Image`),
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
        
        setDoc(docRef, newProductData)
            .then(() => {
                toast({
                    title: 'Thêm thành công!',
                    description: `Sản phẩm "${values.name}" đã được tạo. Đang xử lý ảnh...`,
                });
                router.push('/admin/products');

                if (imageFile && storage) {
                    uploadImage(storage, `products/${productId}`, imageFile)
                        .then(downloadURL => {
                            return setDoc(docRef, { imageUrl: downloadURL }, { merge: true });
                        })
                        .catch(uploadError => {
                            console.error("Background product image upload failed:", uploadError);
                            setDoc(docRef, { imageUrl: `https://placehold.co/800x600/FF0000/FFFFFF?text=Upload+Failed` }, { merge: true });
                        });
                }
            })
            .catch((error: any) => {
                console.error("Lỗi khi tạo sản phẩm:", error);

                if (error.name === 'FirebaseError' && error.code?.includes('permission-denied')) {
                    const permissionError = new FirestorePermissionError({
                        path: docRef.path,
                        operation: 'create',
                        requestResourceData: newProductData
                    });
                    errorEmitter.emit('permission-error', permissionError);
                }
                
                toast({
                    variant: 'destructive',
                    title: 'Lỗi tạo sản phẩm!',
                    description: error.message || 'Đã có lỗi không xác định xảy ra.',
                    duration: 9000,
                });
                 setIsSubmitting(false);
            });
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
