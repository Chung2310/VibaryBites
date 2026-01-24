
'use client';
import {
  File,
  MoreHorizontal,
  PlusCircle,
  Loader2,
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
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteImage } from '@/firebase/storage';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'cakes') : null, [firestore]);
    const { data: products, isLoading } = useCollection<Product>(productsCollection);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    
    const openDeleteConfirm = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteConfirmOpen(true);
    }

    const closeDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false);
        setSelectedProduct(undefined);
    }
    
    const handleDelete = async () => {
        if (!selectedProduct || !firestore) return;

        setIsDeleting(true);
        const docRef = doc(firestore, 'cakes', selectedProduct.id);
        
        try {
            if (selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0) {
                const deletePromises = selectedProduct.imageUrls.map(url => deleteImage(url));
                await Promise.all(deletePromises);
            }
            await deleteDoc(docRef);
            toast({
                title: "Xóa thành công",
                description: `Sản phẩm "${selectedProduct.name}" và các ảnh liên quan đã được xóa.`,
                variant: 'destructive',
            });
        } catch (error) {
            console.error("Error deleting product:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: (error as Error).message || "Could not delete product.",
            });
        } finally {
            setIsDeleting(false);
            closeDeleteConfirm();
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
                      <TableHead>Danh mục</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Giá
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Tồn kho
                      </TableHead>
                      <TableHead>
                        <span className="sr-only">Hành động</span>
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
                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                            <TableCell className="text-right">
                                <Skeleton className="h-8 w-8" />
                            </TableCell>
                        </TableRow>
                   ))}
                   {products && products.map(product => {
                     const imageUrls = product.imageUrls || [];
                     const isOutOfStock = product.stock !== undefined && product.stock <= 0;
                     return (
                        <TableRow key={product.id}>
                            <TableCell className="hidden sm:table-cell">
                                {imageUrls.length > 0 ? (
                                    <Image
                                        alt={product.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="64"
                                        src={imageUrls[0]}
                                        width="64"
                                    />
                                ) : <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>}
                            </TableCell>
                            <TableCell className="font-medium">
                                {product.name}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{product.categorySlug}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                            </TableCell>
                             <TableCell className={cn("hidden md:table-cell", isOutOfStock && "text-destructive font-bold")}>
                                {product.stock ?? 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                    >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => router.push(`/admin/products/edit/${product.id}`)}>Chỉnh sửa</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push(`/admin/attributes?productId=${product.id}`)}>Sửa thuộc tính</DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => router.push(`/admin/recipes?productId=${product.id}`)}>Sửa công thức</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => openDeleteConfirm(product)} className="text-destructive">
                                        Xóa
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
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
        
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={isDeleting ? () => {} : setIsDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn sản phẩm
                    <span className="font-semibold"> "{selectedProduct?.name}" </span>
                    và tất cả các hình ảnh liên quan.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={closeDeleteConfirm} disabled={isDeleting}>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                    {isDeleting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xóa...</>) : 'Xóa'}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        </>
    )
}
