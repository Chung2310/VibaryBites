
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductAttributesForm, type ProductAttributesFormValues } from './product-attributes-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AttributesPage() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const initialProductId = searchParams.get('productId');

    const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'cakes') : null, [firestore]);
    const { data: products, isLoading } = useCollection<Product>(productsCollection);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (initialProductId && products) {
            const productFromUrl = products.find(p => p.id === initialProductId);
            if (productFromUrl) {
                setSelectedProduct(productFromUrl);
            }
        }
    }, [initialProductId, products]);

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleFormSubmit = async (values: ProductAttributesFormValues) => {
        if (!selectedProduct || !firestore) {
            toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng chọn một sản phẩm." });
            return;
        }

        setIsSubmitting(true);

        const updatedProductData: Partial<Product> = {
            detailedDescription: {
                ...selectedProduct.detailedDescription,
                flavor: values.detailedDescription_flavor,
                ingredients: values.detailedDescription_ingredients,
                serving: values.detailedDescription_serving,
                storage: values.detailedDescription_storage,
                dimensions: values.detailedDescription_dimensions,
                accessories: values.detailedDescription_accessories.split('\n').filter(Boolean),
            },
            flavorProfile: values.flavorProfile.split('\n').filter(Boolean),
            structure: values.structure.split('\n').filter(Boolean),
        };

        try {
            const docRef = doc(firestore, 'cakes', selectedProduct.id);
            await setDoc(docRef, updatedProductData, { merge: true });
            toast({
                title: 'Cập nhật thành công!',
                description: `Thuộc tính của sản phẩm "${selectedProduct.name}" đã được cập nhật.`,
            });
            // Deselect product to show the list again
            setSelectedProduct(null);
        } catch (error) {
            console.error("Error updating attributes: ", error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: (error as Error).message || 'Không thể lưu thuộc tính.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCancel = () => {
        setSelectedProduct(null);
    }

    return (
        <div className="space-y-4">
             <div className="flex items-center gap-4">
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Thuộc tính sản phẩm
                </h1>
                {selectedProduct && (
                     <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting}>
                        Quay lại danh sách
                    </Button>
                )}
             </div>

            <Card>
                <CardHeader>
                    <CardTitle>{selectedProduct ? `Chỉnh sửa: ${selectedProduct.name}` : 'Chọn sản phẩm'}</CardTitle>
                    <CardDescription>{selectedProduct ? 'Cập nhật các thuộc tính chi tiết cho sản phẩm này.' : 'Chọn một sản phẩm từ danh sách để chỉnh sửa các thuộc tính chi tiết của nó.'}</CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedProduct ? (
                        <ProductAttributesForm 
                            product={selectedProduct}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCancel}
                            isSubmitting={isSubmitting}
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tên sản phẩm</TableHead>
                                    <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                                    <TableHead className='text-right'>Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && Array.from({length: 3}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell className='text-right'><Skeleton className="h-8 w-20" /></TableCell>
                                    </TableRow>
                                ))}
                                {products?.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="hidden md:table-cell">{product.description}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" onClick={() => handleSelectProduct(product)}>Chỉnh sửa thuộc tính</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
