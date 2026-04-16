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
import type { BirthdayCakeSize } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { SizeForm } from './size-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import * as XLSX from 'xlsx';

export default function BirthdaySizesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizesCollection = useMemoFirebase(() => firestore ? query(collection(firestore, 'birthday_cake_sizes'), orderBy('order')) : null, [firestore]);
  const { data: sizes, isLoading } = useCollection<BirthdayCakeSize>(sizesCollection);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<BirthdayCakeSize | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [sizeToDelete, setSizeToDelete] = useState<BirthdayCakeSize | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = () => {
    setSelectedSize(null);
    setIsFormOpen(true);
  };

  const handleEdit = (size: BirthdayCakeSize) => {
    setSelectedSize(size);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (size: BirthdayCakeSize) => {
    setSizeToDelete(size);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!sizeToDelete || !firestore) return;
    setIsDeleting(true);
    const docRef = doc(firestore, 'birthday_cake_sizes', sizeToDelete.id);
    
    try {
        await deleteDoc(docRef);
        toast({ title: "Thành công", description: `Đã xóa cỡ bánh "${sizeToDelete.name}".`});
        setIsDeleteConfirmOpen(false);
        setSizeToDelete(null);
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
    if (!sizes || sizes.length === 0) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không có dữ liệu để xuất." });
      return;
    }

    const exportData = sizes.map(item => ({
      'ID': item.id,
      'Tên cỡ bánh': item.name,
      'Giá (VNĐ)': item.price,
      'Thứ tự hiển thị': item.order,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cỡ bánh sinh nhật");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vibary-birthday-sizes-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Xuất file thành công", description: `Đã xuất ${sizes.length} cỡ bánh ra file Excel.` });
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
          const name = row['Tên cỡ bánh'];
          if (!name) continue;

          const id = row['ID'] || `size-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          const sizeData: BirthdayCakeSize = {
            id,
            name: String(name),
            price: Number(row['Giá (VNĐ)']) || 0,
            order: Number(row['Thứ tự hiển thị']) || 0,
          };

          const docRef = doc(firestore, 'birthday_cake_sizes', id);
          await setDoc(docRef, sizeData, { merge: true });
          count++;
        }

        toast({ title: "Nhập file thành công", description: `Đã cập nhật/thêm ${count} cỡ bánh từ file Excel.` });
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
          Quản lý Cỡ Bánh Sinh Nhật
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
            Thêm cỡ bánh
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Các cỡ bánh chuẩn</CardTitle>
          <CardDescription>Quản lý các tùy chọn kích thước và giá chuẩn cho danh mục bánh sinh nhật.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[80px]'>Thứ tự</TableHead>
                <TableHead>Tên cỡ bánh</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className='text-right'><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))}
              {sizes?.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-center">{item.order}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{new Intl.NumberFormat('vi-VN').format(item.price)}đ</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="mr-2">Sửa</Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(item)}>Xóa</Button>
                    </TableCell>
                  </TableRow>
                )
              )}
               {!isLoading && sizes?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        Chưa có cỡ bánh nào. Hãy thêm một cỡ bánh mới.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Hiển thị <strong>{sizes?.length || 0}</strong> trên <strong>{sizes?.length || 0}</strong> cỡ bánh
          </div>
        </CardFooter>
      </Card>
      
      <SizeForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        size={selectedSize}
      />

       <AlertDialog open={isDeleteConfirmOpen} onOpenChange={isDeleting ? () => {} : setIsDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này không thể được hoàn tác. Cỡ bánh
                    <span className="font-semibold"> "{sizeToDelete?.name}" </span> 
                    sẽ bị xóa vĩnh viễn.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSizeToDelete(null)} disabled={isDeleting}>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                        {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xóa...</> : 'Xóa'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  )
}
