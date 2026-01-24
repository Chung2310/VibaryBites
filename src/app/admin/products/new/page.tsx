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
        console.log("Submit triggered. isSubmitting=true");
        setIsSubmitting(true);
        
        // 1. Initial Checks
        console.log("1. Running initial checks...");
        if (!firestore) {
            console.error("Firestore service not available.");
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Dịch vụ cơ sở dữ liệu chưa sẵn sàng.' });
            setIsSubmitting(false);
            return;
        }
        if (newImageFiles.length === 0) {
            console.error("No images provided.");
            toast({ variant: 'destructive', title: 'Thiếu ảnh', description: 'Vui lòng thêm ít nhất một ảnh cho sản phẩm.' });
            setIsSubmitting(false);
            return;
        }
        console.log("Checks passed.");

        try {
            // 2. Upload Images to Firebase Storage
            console.log(`2. Uploading ${newImageFiles.length} image(s)...`);
            const uploadPromises = newImageFiles.map((file, index) => {
                console.log(` -> Uploading file ${index + 1}: ${file.name}`);
                return uploadImage(file);
            });
            const uploadedImageUrls = await Promise.all(uploadPromises);
            console.log("All images uploaded successfully. URLs:", uploadedImageUrls);

            // 3. Prepare Product Data
            console.log("3. Preparing product data for Firestore...");
            const id = `prod-${Date.now()}`;
            const docRef = doc(firestore, 'cakes', id);
            console.log(`Generated product ID: ${id}`);

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
                collection: 'special-occasions',
                sizes: [],
                detailedDescription: { flavor: "", ingredients: "", serving: "", storage: "", dimensions: "", accessories: [] },
                flavorProfile: [],
                structure: [],
                recipe: "",
            };
            console.log("Product data prepared:", newProduct);

            // 4. Save to Firestore
            console.log("4. Saving document to Firestore collection 'cakes'...");
            await setDoc(docRef, newProduct);
            console.log("Document saved successfully!");

            // 5. Success
            toast({
                title: 'Thêm thành công!',
                description: `Sản phẩm "${newProduct.name}" đã được tạo.`,
            });
            console.log("Redirecting to /admin/products");
            router.push(`/admin/products`);

        } catch (error: any) {
            // 6. Error Handling
            console.error("!!! AN ERROR OCCURRED !!!", error);
            
            const permissionError = new FirestorePermissionError({
                path: `cakes/new-product-id-${Date.now()}`,
                operation: 'create',
                requestResourceData: values 
            });
            errorEmitter.emit('permission-error', permissionError);
            
            toast({
                variant: 'destructive',
                title: 'Không thể tạo sản phẩm',
                description: `Đã xảy ra lỗi không mong muốn. Vui lòng kiểm tra Console (F12) để biết chi tiết.`,
                duration: 9000,
            });
        } finally {
            // 7. Finalization
            console.log("Submit finished. isSubmitting=false");
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
