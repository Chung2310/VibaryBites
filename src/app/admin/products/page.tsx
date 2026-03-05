
'use client';
import {
  File,
  MoreHorizontal,
  PlusCircle,
  Loader2,
  ListFilter,
  Upload,
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
  DropdownMenuCheckboxItem,
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
import { useState, useMemo, useRef } from 'react';
import type { Product, ProductCategory } from '@/lib/types';
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
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, generateSlug } from '@/lib/utils';
import * as XLSX from 'xlsx';

export default function ProductsPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'cakes') : null, [firestore]);
    const { data: products, isLoading } = useCollection<Product>(productsCollection);

    const categoriesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
    const { data: categories, isLoading: isLoadingCategories } = useCollection<ProductCategory>(categoriesCollection);
    const [activeCategorySlug, setActiveCategorySlug] = useState('all');

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        if (activeCategorySlug === 'all') return products;
        return products.filter(p => p.categorySlug === activeCategorySlug);
    }, [products, activeCategorySlug]);
    
    const openDeleteConfirm = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteConfirmOpen(true);
    }
    
    const handleDelete = async () => {
        if (!selectedProduct || !firestore) return;

        setIsDeleting(true);
        const docRef = doc(firestore, 'cakes', selectedProduct.id);
        
        try {
            await deleteDoc(docRef);

            toast({
                title: "Xóa thành công",
                description: `Sản phẩm "${selectedProduct.name}" đã được xóa.`,
                variant: 'destructive',
            });
        } catch (error) {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setIsDeleting(false);
            setIsDeleteConfirmOpen(false);
            setSelectedProduct(undefined);
        }
    }

    const handleExport = () => {
        if (!filteredProducts || filteredProducts.length === 0) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không có sản phẩm nào để xuất." });
            return;
        }
        
        // Excel has a hard limit of 32767 characters per cell.
        const MAX_CELL_LEN = 32760; 
        const t = (val: any) => {
            const str = String(val ?? '');
            return str.length > MAX_CELL_LEN ? str.substring(0, MAX_CELL_LEN) : str;
        };

        // Map products to flat rows for Excel with human-readable headers
        const exportData = filteredProducts.map(p => {
            const category = categories?.find(c => c.slug === p.categorySlug);
            return {
                'ID': t(p.id),
                'Tên sản phẩm': t(p.name),
                'Tên phụ': t(p.subtitle || ''),
                'Slug': t(p.slug),
                'Mô tả ngắn': t(p.description),
                'Giá cơ bản': p.price,
                'Tồn kho': p.stock || 0,
                'Danh mục': t(category ? category.title : p.categorySlug),
                'URL Ảnh': t(p.imageUrl),
                'Mô tả hương vị': t(p.detailedDescription?.flavor || ''),
                'Thành phần': t(p.detailedDescription?.ingredients || ''),
                'Hướng dẫn bảo quản': t(p.detailedDescription?.storage || ''),
                'Kích thước & Khẩu phần': t(p.detailedDescription?.dimensions || ''),
                'Phụ kiện (Mỗi dòng 1 cái)': t(p.detailedDescription?.accessories?.join('\n') || ''),
                'Cảm giác vị (Mỗi dòng 1 tag)': t(p.flavorProfile?.join('\n') || ''),
                'Cấu trúc lớp (Từ trên xuống)': t(p.structure?.join('\n') || ''),
                'Các size bánh (Tên | Giá)': t(p.sizes?.map(s => `${s.name} | ${s.price}`).join('\n') || ''),
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Set column widths
        const wscols = [
            {wch: 15}, {wch: 30}, {wch: 20}, {wch: 25}, {wch: 40}, 
            {wch: 10}, {wch: 10}, {wch: 20}, {wch: 50}, {wch: 50},
            {wch: 50}, {wch: 50}, {wch: 30}, {wch: 30}, {wch: 30}, {wch: 30}, {wch: 30}
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Danh sách Sản phẩm");
        
        // Generate buffer and trigger download
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vibary-products-${activeCategorySlug}-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast({ title: "Xuất file thành công", description: `Đã xuất ${filteredProducts.length} sản phẩm ra file Excel.` });
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !firestore) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    toast({ variant: "destructive", title: "Lỗi", description: "File Excel không có dữ liệu." });
                    return;
                }

                let count = 0;
                for (const row of jsonData as any[]) {
                    const name = row['Tên sản phẩm'];
                    if (!name) continue;
                    
                    const id = row['ID'] || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    
                    // Parse nested structures
                    const sizesStr = String(row['Các size bánh (Tên | Giá)'] || '');
                    const sizes = sizesStr.split('\n').filter(l => l.includes('|')).map(line => {
                        const [n, p] = line.split('|');
                        return { name: n.trim(), price: Number(p.trim()) };
                    });

                    // Resolve category slug from title or slug provided in Excel
                    let categoryVal = String(row['Danh mục'] || row['Danh mục (Slug)'] || 'banh-sinh-nhat');
                    const matchedCategory = categories?.find(c => 
                        c.title.toLowerCase() === categoryVal.toLowerCase() || 
                        c.slug.toLowerCase() === categoryVal.toLowerCase()
                    );
                    const categorySlug = matchedCategory ? matchedCategory.slug : 'banh-sinh-nhat';

                    const productData: Product = {
                        id,
                        name: String(name),
                        subtitle: String(row['Tên phụ'] || ''),
                        slug: String(row['Slug'] || generateSlug(name)),
                        description: String(row['Mô tả ngắn'] || ''),
                        price: Number(row['Giá cơ bản']) || 0,
                        stock: Number(row['Tồn kho']) || 0,
                        categorySlug: categorySlug,
                        imageUrl: String(row['URL Ảnh'] || ''),
                        detailedDescription: {
                            flavor: String(row['Mô tả hương vị'] || ''),
                            ingredients: String(row['Thành phần'] || ''),
                            storage: String(row['Hướng dẫn bảo quản'] || ''),
                            dimensions: String(row['Kích thước & Khẩu phần'] || ''),
                            accessories: String(row['Phụ kiện (Mỗi dòng 1 cái)'] || '').split('\n').map(s => s.trim()).filter(Boolean),
                        },
                        flavorProfile: String(row['Cảm giác vị (Mỗi dòng 1 tag)'] || '').split('\n').map(s => s.trim()).filter(Boolean),
                        structure: String(row['Cấu trúc lớp (Từ trên xuống)'] || '').split('\n').map(s => s.trim()).filter(Boolean),
                        sizes: sizes.length > 0 ? sizes : undefined
                    };
                    
                    const docRef = doc(firestore, 'cakes', id);
                    await setDoc(docRef, productData, { merge: true });
                    count++;
                }

                toast({ title: "Nhập file thành công", description: `Đã cập nhật/thêm ${count} sản phẩm từ file Excel.` });
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (error: any) {
                console.error("Lỗi nhập file Excel:", error);
                toast({ variant: "destructive", title: "Lỗi nhập file", description: "Định dạng file Excel không đúng hoặc dữ liệu bị lỗi. Vui lòng kiểm tra lại." });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <>
        <Tabs defaultValue="all">
          <div className="flex items-center">
             <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Quản lý sản phẩm
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Lọc theo danh mục
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Lọc theo danh mục</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                      checked={activeCategorySlug === 'all'}
                      onSelect={() => setActiveCategorySlug('all')}
                  >
                      Tất cả
                  </DropdownMenuCheckboxItem>
                  {isLoadingCategories ? (
                    <DropdownMenuItem disabled>Đang tải...</DropdownMenuItem>
                  ) : (
                    categories?.map(category => (
                        <DropdownMenuCheckboxItem
                            key={category.id}
                            checked={activeCategorySlug === category.slug}
                            onSelect={() => setActiveCategorySlug(category.slug)}
                        >
                            {category.title}
                        </DropdownMenuCheckboxItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Xuất File Excel
                </span>
              </Button>

              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Nhập File Excel
                </span>
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
              />

              <Button size="sm" className="h-8 gap-1" onClick={() => router.push('/admin/products/new')}>
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
                    Quản lý danh sách sản phẩm của tiệm bằng file Excel hoặc giao diện trực tiếp.
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
                   {filteredProducts && filteredProducts.map(product => {
                     const imageUrl = product.imageUrl;
                     const isOutOfStock = product.stock !== undefined && product.stock <= 0;
                     return (
                        <TableRow key={product.id}>
                            <TableCell className="hidden sm:table-cell">
                                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
                                    <Image
                                        alt={product.name}
                                        className="aspect-square object-contain"
                                        height="64"
                                        src={imageUrl || 'https://placehold.co/64x64'}
                                        width="64"
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">
                                {product.name}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{categories?.find(c => c.slug === product.categorySlug)?.title || product.categorySlug}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {product.price > 0 ? `${new Intl.NumberFormat('vi-VN').format(product.price)}đ` : 'Giá chờ'}
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
                                    <DropdownMenuItem onSelect={() => router.push(`/admin/products/edit/${product.id}`)}>Chỉnh sửa chi tiết</DropdownMenuItem>
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
                   {!isLoading && filteredProducts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                {activeCategorySlug === 'all'
                                ? 'Chưa có sản phẩm nào.'
                                : 'Không có sản phẩm nào trong danh mục này.'}
                            </TableCell>
                        </TableRow>
                   )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Hiển thị <strong>{filteredProducts?.length || 0}</strong> trên tổng số <strong>{products?.length || 0}</strong> sản phẩm
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
                    <span className="font-semibold"> "{selectedProduct?.name}" </span>.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeleting}>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                    {isDeleting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xóa...</>) : 'Xóa'}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        </>
    )
}
