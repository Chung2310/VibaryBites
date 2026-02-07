'use client';
import {
  File,
  PlusCircle,
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
import { useState } from 'react';
import type { BirthdayCakeSize } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { SizeForm } from './size-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

export default function BirthdaySizesPage() {
  const firestore = useFirestore();
  const sizesCollection = useMemoFirebase(() => firestore ? query(collection(firestore, 'birthday_cake_sizes'), orderBy('order')) : null, [firestore]);
  const { data: sizes, isLoading } = useCollection<BirthdayCakeSize>(sizesCollection);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<BirthdayCakeSize | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [sizeToDelete, setSizeToDelete] = useState<BirthdayCakeSize | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

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

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Quản lý Cỡ Bánh Sinh Nhật
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm">
            <File className="h-4 w-4 mr-2" />
            Xuất file
          </Button>
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
