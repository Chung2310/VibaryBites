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

    // This is a debugging step to isolate the Firestore write operation.
    const handleFormSubmit = async (values: ProductFormValues, newImageFiles: File[], keptImageUrls: string[]) => {
        setIsSubmitting(true);
        console.log("--- Bắt đầu quy trình thêm sản phẩm (CHẾ ĐỘ GỠ LỖI) ---");

        if (!firestore) {
            console.error("Lỗi: Firestore instance không tồn tại.");
            toast({ variant: 'destructive', title: 'Lỗi nghiêm trọng', description: 'Không thể kết nối tới cơ sở dữ liệu.' });
            setIsSubmitting(false);
            return;
        }

        const id = `prod-debug-${Date.now()}`;
        const docRef = doc(firestore, 'cakes', id);
        console.log(`Đã tạo ID sản phẩm gỡ lỗi: ${id} tại collection 'cakes'`);

        // Create a hardcoded product object, ignoring form values for now.
        const hardcodedProduct: Product = {
            id,
            slug: `test-product-${id}`,
            name: "Sản phẩm Test",
            description: "Đây là một mô tả test.",
            price: 100000,
            stock: 10,
            categorySlug: "banh-le",
            imageUrls: ["https://placehold.co/600x400/EEE/31343C.png?text=Test"],
            collection: 'special-occasions',
            detailedDescription: { flavor: "", ingredients: "", serving: "", storage: "", dimensions: "", accessories: [] },
        };
        
        let newProduct: Product; // Variable to hold the actual product data for error reporting
        
        try {
            // We will use the hardcoded product for the write operation
            newProduct = hardcodedProduct;

            console.log("Đang lưu dữ liệu sản phẩm HARDCODED vào Firestore:", newProduct);
            await setDoc(docRef, newProduct);
            console.log("Lưu sản phẩm vào Firestore thành công.");
            
            toast({
                title: 'Thêm thành công (Chế độ gỡ lỗi)!',
                description: `Sản phẩm "${newProduct.name}" đã được tạo.`,
            });
            
            console.log("Đang chuyển hướng đến trang sản phẩm...");
            router.push(`/admin/products`);

        } catch (error: any) {
            console.error("---!!! ĐÃ XẢY RA LỖI KHI THÊM SẢN PHẨM !!! ---");
            console.error("Chi tiết lỗi:", error);
            
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: newProduct! // Use the product data that was attempted
            });
            errorEmitter.emit('permission-error', permissionError);
            
            toast({
                variant: 'destructive',
                title: 'Không thể tạo sản phẩm',
                description: error.message || 'Đã có lỗi không xác định xảy ra. Vui lòng kiểm tra console để biết thêm chi tiết.',
            });
        } finally {
            console.log("--- Kết thúc quy trình thêm sản phẩm ---");
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
