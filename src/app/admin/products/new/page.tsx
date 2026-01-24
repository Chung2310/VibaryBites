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

    // Corrected function signature to match the one expected by ProductForm
    const handleFormSubmit = async (values: ProductFormValues, newImageFiles: File[], keptImageUrls: string[]) => {
        console.log("Step 1: handleFormSubmit triggered.");
        setIsSubmitting(true);
        
        if (!firestore) {
            console.error("Step 2: Firestore not available. Aborting.");
            toast({ variant: 'destructive', title: 'Lỗi kết nối', description: 'Không thể kết nối tới cơ sở dữ liệu.' });
            setIsSubmitting(false);
            return;
        }
        console.log("Step 2: Firestore is available.");

        if (newImageFiles.length === 0) {
            console.error("Step 3: No image files provided. Aborting.");
            toast({ variant: "destructive", title: "Thiếu ảnh sản phẩm", description: "Vui lòng tải lên ít nhất một ảnh cho sản phẩm." });
            setIsSubmitting(false);
            return;
        }
        console.log(`Step 3: ${newImageFiles.length} image files are present.`);
        
        const id = `prod-${Date.now()}`;
        const docRef = doc(firestore, 'cakes', id);
        console.log(`Step 4: Generated new product ID: ${id}`);

        try {
            console.log("Step 5: Starting image uploads...");
            const uploadPromises = newImageFiles.map(file => uploadImage(file));
            const uploadedUrls = await Promise.all(uploadPromises);
            console.log("Step 6: Image uploads successful. URLs:", uploadedUrls);

            const newProduct: Product = {
                id,
                slug: generateSlug(values.name),
                name: values.name,
                subtitle: values.subtitle,
                description: values.description,
                price: Number(values.price),
                stock: Number(values.stock),
                categorySlug: values.categorySlug,
                imageUrls: uploadedUrls,
                detailedDescription: {
                    flavor: "", ingredients: "", serving: "",
                    storage: "", dimensions: "", accessories: [],
                },
                flavorProfile: [],
                structure: [],
                recipe: "",
                collection: 'special-occasions',
            };
            console.log("Step 7: New product data object created:", newProduct);

            console.log("Step 8: Attempting to save document to Firestore...");
            await setDoc(docRef, newProduct);
            console.log("Step 9: Document successfully saved.");
            
            toast({
                title: 'Thêm thành công!',
                description: `Sản phẩm "${newProduct.name}" đã được tạo.`,
            });
            
            console.log("Step 10: Redirecting to attributes page...");
            router.push(`/admin/attributes?productId=${newProduct.id}`);

        } catch (error: any) {
            console.error('ERROR during product creation process:', error);
            
            if (error.name === 'FirebaseError' && (error.code === 'permission-denied' || error.code === 'storage/unauthorized')) {
                 const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'create',
                    requestResourceData: values
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Không thể tạo sản phẩm',
                    description: error.message || 'Đã có lỗi xảy ra. Vui lòng kiểm tra console để biết thêm chi tiết.',
                });
            }
        } finally {
            console.log("Step 11 (Finally): Setting isSubmitting to false.");
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
