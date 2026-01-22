
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Product, Ingredient } from '@/lib/types';
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
import Image from 'next/image';
import { RecipeEditor } from './recipe-editor';

export default function RecipesPage() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const initialProductId = searchParams.get('productId');

    // Fetch Products (Cakes)
    const productsCollection = useMemoFirebase(() => firestore ? query(collection(firestore, 'cakes'), orderBy('name')) : null, [firestore]);
    const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsCollection);

    // Fetch Ingredients
    const ingredientsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'ingredients') : null, [firestore]);
    const { data: ingredients, isLoading: isLoadingIngredients } = useCollection<Ingredient>(ingredientsCollection);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Effect to select a product from URL param on initial load
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

    return (
        <div className="space-y-4">
             <div className="flex items-center gap-4">
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Quản lý Công thức
                </h1>
                {selectedProduct && (
                     <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                        Quay lại danh sách
                    </Button>
                )}
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chọn sản phẩm</CardTitle>
                            <CardDescription>Chọn một sản phẩm để xem hoặc chỉnh sửa công thức.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sản phẩm</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingProducts && Array.from({length: 3}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                        </TableRow>
                                    ))}
                                    {products?.map(product => (
                                        <TableRow 
                                            key={product.id} 
                                            onClick={() => handleSelectProduct(product)}
                                            className={`cursor-pointer ${selectedProduct?.id === product.id ? 'bg-muted' : ''}`}
                                        >
                                            <TableCell className="flex items-center gap-3">
                                                <Image src={product.imageUrls[0]} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                                                <span className="font-medium">{product.name}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    {selectedProduct ? (
                         <RecipeEditor 
                            key={selectedProduct.id} // Add key to force re-render on product change
                            product={selectedProduct} 
                            allIngredients={ingredients || []}
                            isLoadingIngredients={isLoadingIngredients}
                         />
                    ) : (
                        <Card className="flex items-center justify-center h-full min-h-[400px]">
                            <div className="text-center text-muted-foreground">
                                <p>Vui lòng chọn một sản phẩm từ danh sách</p>
                                <p>để bắt đầu quản lý công thức của nó.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

