
'use client';
import {
  File,
  MoreHorizontal,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
} from '@/components/ui/tabs';
import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteImage } from '@/firebase/storage';
import { Switch } from '@/components/ui/switch';

export default function ProductsPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'cakes') : null, [firestore]);
    const { data: products, isLoading } = useCollection<Product>(productsCollection);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const { toast } = useToast();
    
    const openDeleteConfirm = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteConfirmOpen(true);
    }

    const closeDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false);
        setSelectedProduct(undefined);
    }
    
    const handleDelete = () => {
        if (!selectedProduct || !firestore) return;

        const docRef = doc(firestore, 'cakes', selectedProduct.id);
        
        const deletePromises: Promise<any>[] = [];

        // Add image deletion promises
        if (selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0) {
            selectedProduct.imageUrls.forEach(url => deletePromises.push(deleteImage(url)));
        }

        // Add Firestore document deletion promise
        deletePromises.push(deleteDoc(docRef));

        Promise.allSettled(deletePromises)
            .then(results => {
                const errors = results.filter(r => r.status === 'rejected');
                if (errors.length > 0) {
                    console.error("Some deletions failed:", errors);
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: `Could not delete all parts of the product. Check console for details.`,
                    });
                } else {
                    toast({
                        title: "Xóa thành công",
                        description: `Sản phẩm "${selectedProduct.name}" và các ảnh liên quan đã được xóa.`,
                        variant: 'destructive',
                    });
                }
            })
            .finally(() => {
                // This ensures the dialog closes only after all async operations are done.
                closeDeleteConfirm();
            });
    }

    const handleToggleStock = async (product: Product) => {
        if (!firestore) return;

        const docRef = doc(firestore, 'cakes', product.id);
        // If stock is > 0, set to 0. If stock is 0, set to 10 (a default in-stock value).
        const newStock = product.stock > 0 ? 0 : 10; 
        
        try {
            await setDoc(docRef, { stock: newStock }, { merge: true });
            toast({
                title: "Cập nhật thành công",
                description: `Sản phẩm "${product.name}" đã được cập nhật thành ${newStock > 0 ? '"Còn hàng"' : '"Hết hàng"'}.`,
            });
        } catch (error) {
            console.error("Error toggling stock:", error);
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể cập nhật trạng thái sản phẩm.'
            });
        }
    }


    return (
        <>
        <Tabs defaultValue="all">
          <div className="flex items-center">
             <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Quản lý sản phẩm
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Xuất File
                </span>
              </Button>
              <Button size="sm" className="h-8 gap-1" asChild>
                <Link href="/admin/products/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Thêm sản phẩm
                    </span>
                </Link>
              </Button>
            </div>
          </div>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách sản phẩm</CardTitle>
                <CardDescription>
                    Quản lý danh sách sản phẩm của tiệm.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">Ảnh</span>
                      </TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Giá
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Tồn kho
                      </TableHead>
                      <TableHead className="text-right">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                   {isLoading && Array.from({length: 5}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell className="hidden sm:table-cell">
                                <Skeleton className="h-16 w-16 rounded-md" />
                            </TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                            <TableCell>
                                <Skeleton className="h-8 w-24" />
                            </TableCell>
                        </TableRow>
                   ))}
                   {products && products.map(product => {
                     const imageUrls = product.imageUrls || [];
                     const isAvailable = product.stock > 0;
                     return (
                        <TableRow key={product.id}>
                            <TableCell className="hidden sm:table-cell">
                                {imageUrls.length > 0 && (
                                    <Image
                                        alt={product.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="64"
                                        src={imageUrls[0]}
                                        width="64"
                                    />
                                )}
                            </TableCell>
                            <TableCell className="font-medium">
                                {product.name}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                     <Switch
                                        checked={isAvailable}
                                        onCheckedChange={() => handleToggleStock(product)}
                                        aria-label="Toggle product availability"
                                    />
                                    <Badge variant={isAvailable ? "outline" : "destructive"}
                                    className={isAvailable ? "bg-green-100 text-green-800" : ""}
                                    >
                                        {isAvailable ? "Còn hàng" : "Hết hàng"}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {product.stock}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/admin/products/edit/${product.id}`)}>
                                        Chỉnh sửa
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(product)}>
                                        Xóa
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                     )
                   })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Hiển thị <strong>{products?.length || 0}</strong> trên <strong>{products?.length || 0}</strong> sản phẩm
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn sản phẩm
                    <span className="font-semibold"> {selectedProduct?.name} </span>
                    và các hình ảnh liên quan.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={closeDeleteConfirm}>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        </>
    )
}
