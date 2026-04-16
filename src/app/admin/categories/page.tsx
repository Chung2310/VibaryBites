'use client';
import {
  File,
  PlusCircle,
  Upload,
  Loader2,
} from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useRef } from 'react';
import type { ProductCategory } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { CategoryForm } from './category-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import * as XLSX from 'xlsx';
import { generateSlug } from '@/lib/utils';

export default function CategoriesPage() {
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoriesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const { data: categories, isLoading } = useCollection<ProductCategory>(categoriesCollection);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (category: ProductCategory) => {
    setCategoryToDelete(category);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete || !firestore) return;
    setIsDeleting(true);
    const docRef = doc(firestore, 'categories', categoryToDelete.id);
    
    try {
        await deleteDoc(docRef);
        toast({ title: "Thành công", description: `Đã xóa danh mục "${categoryToDelete.title}".`});
        setIsDeleteConfirmOpen(false);
        setCategoryToDelete(null);
    } catch (error) {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsDeleting(false);
    }
  };

  const handleExport = () => {
    if (!categories || categories.length === 0) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không có danh mục nào để xuất." });
      return;
    }

    const exportData = categories.map(cat => ({
      'ID': cat.id,
      'Tên danh mục': cat.title,
      'Tiêu đề phụ': cat.subtitle || '',
      'Slug': cat.slug,
      'Mô tả': cat.description || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh mục sản phẩm");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vibary-categories-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Xuất file thành công", description: `Đã xuất ${categories.length} danh mục ra file Excel.` });
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
          const title = row['Tên danh mục'];
          if (!title) continue;

          const id = row['ID'] || `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          const categoryData: ProductCategory = {
            id,
            title: String(title),
            subtitle: String(row['Tiêu đề phụ'] || ''),
            slug: String(row['Slug'] || generateSlug(String(title))),
            description: String(row['Mô tả'] || ''),
          };

          const docRef = doc(firestore, 'categories', id);
          await setDoc(docRef, categoryData, { merge: true });
          count++;
        }

        toast({ title: "Nhập file thành công", description: `Đã cập nhật/thêm ${count} danh mục từ file Excel.` });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error: any) {
        console.error("Lỗi nhập file Excel:", error);
        toast({ variant: "destructive", title: "Lỗi nhập file", description: "Định dạng file Excel không đúng hoặc dữ liệu bị lỗi." });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Quản lý Danh mục
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <File className="h-4 w-4 mr-2" />
            Xuất file Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Nhập file Excel
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <Button size="sm" onClick={handleAdd}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Thêm danh mục
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Danh mục sản phẩm</CardTitle>
          <CardDescription>Tạo và quản lý các danh mục để phân loại sản phẩm của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="hidden md:table-cell">Tiêu đề phụ</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 4}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className='text-right'><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))}
              {categories?.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="font-mono text-xs">{item.slug}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{item.subtitle}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="mr-2">Sửa</Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(item)}>Xóa</Button>
                    </TableCell>
                  </TableRow>
                )
              )}
               {!isLoading && categories?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        Không có danh mục nào.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Hiển thị <strong>{categories?.length || 0}</strong> trên <strong>{categories?.length || 0}</strong> danh mục
          </div>
        </CardFooter>
      </Card>
      
      <CategoryForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        category={selectedCategory}
      />

       <AlertDialog open={isDeleteConfirmOpen} onOpenChange={isDeleting ? () => {} : setIsDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này không thể được hoàn tác. Danh mục
                    <span className="font-semibold"> "{categoryToDelete?.title}" </span> 
                    sẽ bị xóa vĩnh viễn. Các sản phẩm thuộc danh mục này sẽ không bị ảnh hưởng.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCategoryToDelete(null)} disabled={isDeleting}>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                        {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xóa...</> : 'Xóa'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  )
}
