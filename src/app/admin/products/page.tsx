
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
import { useAppStore } from '@/hooks/use-app-store';

export default function ProductsPage() {
    const { products, addProduct, updateProduct, deleteProduct } = useAppStore();
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
    
    const handleDelete = () => {
        if (!selectedProduct) return;
        
        deleteProduct(selectedProduct.id);

        toast({
            title: "Xóa thành công",
            description: `Sản phẩm "${selectedProduct.name}" đã được xóa.`,
            variant: 'destructive',
        });
        closeDeleteConfirm();
    }
    
    const handleFormSubmit = (data: ProductFormValues) => {
        if (selectedProduct) {
            // Update existing product
            const updated: Product = {
                ...selectedProduct,
                ...data,
                price: Number(data.price),
                stock: Number(data.stock),
                slug: data.name.toLowerCase().replace(/ /g, '-'),
                imageUrl: data.imageUrl
            };
            updateProduct(updated);
            toast({
                title: "Cập nhật thành công!",
                description: `Sản phẩm "${data.name}" đã được cập nhật.`,
            });
        } else {
            // Add new product
            const newProduct: Product = {
                id: `prod-${Date.now()}`,
                slug: data.name.toLowerCase().replace(/ /g, '-'),
                name: data.name,
                subtitle: data.categorySlug,
                description: data.description,
                detailedDescription: {
                    flavor: 'Cập nhật sau',
                    ingredients: 'Cập nhật sau',
                    serving: 'Cập nhật sau',
                    storage: 'Cập nhật sau',
                    dimensions: 'Cập nhật sau',
                    accessories: ['01 Chiếc nến sinh nhật', '01 Dao cắt bánh']
                },
                price: Number(data.price),
                stock: Number(data.stock),
                imageUrl: data.imageUrl,
                collection: 'special-occasions',
                categorySlug: data.categorySlug,
            };
            addProduct(newProduct);
            toast({
                title: "Thêm thành công!",
                description: `Sản phẩm "${data.name}" đã được thêm vào hệ thống.`,
            });
        }
        closeForm();
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
                   {products.map(product => {
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
                  Hiển thị <strong>{products.length}</strong> trên <strong>{products.length}</strong> sản phẩm
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
