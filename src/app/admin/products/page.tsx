
'use client';
import {
  File,
  MoreHorizontal,
  PlusCircle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ProductForm, type ProductFormValues } from './product-form';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
    const firestore = useFirestore();
    const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'cakes') : null, [firestore]);
    const { data: products, isLoading } = useCollection<Product>(productsCollection);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const { toast } = useToast();
    
    const openForm = (product?: Product) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setSelectedProduct(undefined);
    };
    
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
        
        const docRef = doc(firestore, 'cakes', selectedProduct.id);
        
        try {
            await deleteDoc(docRef);
            toast({
                title: "Xóa thành công",
                description: `Sản phẩm "${selectedProduct.name}" đã được xóa.`,
                variant: 'destructive',
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: (error as Error).message || "Không thể xóa sản phẩm.",
            });
        }
        
        closeDeleteConfirm();
    }
    
    const handleFormSubmit = async (values: ProductFormValues): Promise<void> => {
        if (!firestore) {
             toast({
                variant: "destructive",
                title: "Lỗi Firestore",
                description: "Không thể kết nối tới cơ sở dữ liệu.",
            });
            return;
        };

        try {
            if (selectedProduct) {
                // Update existing product
                const docRef = doc(firestore, 'cakes', selectedProduct.id);
                const updatedProductData = { 
                    ...selectedProduct,
                    ...values,
                    price: Number(values.price),
                    stock: Number(values.stock),
                };
                await setDoc(docRef, updatedProductData, { merge: true });
                
                toast({
                    title: "Cập nhật thành công!",
                    description: `Sản phẩm "${values.name}" đã được cập nhật.`,
                });
            } else {
                // Add new product
                const id = `prod-${Date.now()}`;
                const docRef = doc(firestore, 'cakes', id);
                 const newProduct: Product = {
                    ...values,
                    id: id,
                    slug: values.name.toLowerCase().replace(/\s+/g, '-'),
                    price: Number(values.price),
                    stock: Number(values.stock),
                    subtitle: values.subtitle || 'Cập nhật sau',
                    detailedDescription: {
                        flavor: 'Cập nhật sau',
                        ingredients: 'Cập nhật sau',
                        serving: 'Cập nhật sau',
                        storage: 'Cập nhật sau',
                        dimensions: 'Cập nhật sau',
                        accessories: ['01 Chiếc nến sinh nhật', '01 Dao cắt bánh']
                    },
                    collection: 'special-occasions',
                };
                await setDoc(docRef, newProduct);
                toast({
                    title: "Thêm thành công!",
                    description: `Sản phẩm "${values.name}" đã được thêm vào hệ thống.`,
                });
            }
            closeForm();
        } catch(error) {
             toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: (error as Error).message || "Không thể lưu sản phẩm.",
            });
        }
    };


    return (
        <>
        <Tabs defaultValue="all">
          <div className="flex items-center">
             <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Sản phẩm
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Xuất File
                </span>
              </Button>
              <Button size="sm" className="h-8 gap-1" onClick={() => openForm()}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Thêm sản phẩm
                </span>
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
                      <TableHead>
                        <span className="sr-only">Actions</span>
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
                                <Skeleton className="h-8 w-8" />
                            </TableCell>
                        </TableRow>
                   ))}
                   {products && products.map(product => {
                     return (
                        <TableRow key={product.id}>
                            <TableCell className="hidden sm:table-cell">
                                {product.imageUrl && (
                                    <Image
                                        alt={product.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="64"
                                        src={product.imageUrl}
                                        width="64"
                                    />
                                )}
                            </TableCell>
                            <TableCell className="font-medium">
                                {product.name}
                            </TableCell>
                            <TableCell>
                                <Badge variant={product.stock > 0 ? "outline" : "destructive"}
                                 className={product.stock > 0 ? "bg-green-100 text-green-800" : ""}
                                >
                                    {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                                </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {product.stock}
                            </TableCell>
                            <TableCell>
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
                                    <DropdownMenuItem onClick={() => openForm(product)}>Chỉnh sửa</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className='text-destructive' onClick={() => openDeleteConfirm(product)}>Xóa</DropdownMenuItem>
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

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
                    <DialogDescription>
                        {selectedProduct ? 'Cập nhật thông tin chi tiết cho sản phẩm.' : 'Điền thông tin để tạo một sản phẩm mới.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                   <ProductForm 
                        key={selectedProduct ? selectedProduct.id : 'new'}
                        product={selectedProduct} 
                        onSubmit={handleFormSubmit}
                        onClose={closeForm}
                    />
                </div>
            </DialogContent>
        </Dialog>
        
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn sản phẩm
                    <span className="font-semibold"> {selectedProduct?.name} </span>
                    khỏi hệ thống.
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
