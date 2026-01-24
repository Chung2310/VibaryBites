
'use client';
import {
  File,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import type { Ingredient } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { IngredientForm } from './ingredient-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

export default function InventoryPage() {
  const firestore = useFirestore();
  const ingredientsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'ingredients') : null, [firestore]);
  const { data: ingredients, isLoading } = useCollection<Ingredient>(ingredientsCollection);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedIngredient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (ingredient: Ingredient) => {
    setIngredientToDelete(ingredient);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!ingredientToDelete || !firestore) return;
    setIsDeleting(true);
    const docRef = doc(firestore, 'ingredients', ingredientToDelete.id);
    
    try {
        await deleteDoc(docRef);
        toast({ title: "Thành công", description: `Đã xóa nguyên liệu "${ingredientToDelete.name}".`});
        setIsDeleteConfirmOpen(false);
        setIngredientToDelete(null);
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
          Quản lý Kho
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm">
            <File className="h-4 w-4 mr-2" />
            Xuất file
          </Button>
          <Button size="sm" onClick={handleAdd}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Thêm nguyên liệu
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tồn kho nguyên liệu</CardTitle>
          <CardDescription>Theo dõi và quản lý số lượng nguyên liệu trong kho của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nguyên liệu</TableHead>
                <TableHead className='w-[200px]'>Trạng thái</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Ngưỡng báo hết</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 4}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className='text-right'><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))}
              {ingredients?.map(item => {
                const stockPercentage = item.parLevel > 0 ? (item.stock / item.parLevel) * 100 : 100;
                const isLowStock = item.stock < item.parLevel;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Progress value={stockPercentage} className="h-2 w-[100px]" aria-label={`${stockPercentage}% in stock`} />
                        {isLowStock ?
                          <Badge variant="destructive">Sắp hết</Badge> :
                          <Badge variant="outline" className="bg-green-100 text-green-800">Đầy đủ</Badge>
                        }
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{item.stock} {item.unit}</TableCell>
                    <TableCell className="font-mono">{item.parLevel} {item.unit}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="mr-2">Sửa</Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(item)}>Xóa</Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Hiển thị <strong>{ingredients?.length || 0}</strong> trên <strong>{ingredients?.length || 0}</strong> nguyên liệu
          </div>
        </CardFooter>
      </Card>
      
      <IngredientForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        ingredient={selectedIngredient}
      />

       <AlertDialog open={isDeleteConfirmOpen} onOpenChange={isDeleting ? () => {} : setIsDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này không thể được hoàn tác. Nguyên liệu 
                    <span className="font-semibold"> "{ingredientToDelete?.name}" </span> 
                    sẽ bị xóa vĩnh viễn.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIngredientToDelete(null)} disabled={isDeleting}>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                        {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xóa...</> : 'Xóa'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  )
}
