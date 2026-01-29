
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
import { useState, useEffect } from 'react';
import type { ProductCategory } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { CategoryForm } from './category-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { generateSlug } from '@/lib/utils';


export default function CategoriesPage() {
  const firestore = useFirestore();
  const categoriesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const { data: categories, isLoading } = useCollection<ProductCategory>(categoriesCollection);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Seed initial categories if the collection is empty
    if (firestore && !isLoading && categories && categories.length === 0) {
      const seedCategories = async () => {
        toast({ title: "Thiết lập ban đầu", description: "Đang tạo các danh mục sản phẩm mặc định..." });

        const defaultCategories = [
          { title: "Bánh sinh nhật", subtitle: "Cho ngày đặc biệt", description: "Những chiếc bánh được trang trí lộng lẫy, hoàn hảo cho các bữa tiệc sinh nhật." },
          { title: "Bánh lẻ", subtitle: "Thưởng thức mỗi ngày", description: "Các loại bánh nhỏ, entremet, và bánh ngọt để bạn tự thưởng cho bản thân." },
          { title: "Bánh nướng", subtitle: "Giòn tan, thơm lừng", description: "Các loại bánh nướng cổ điển như bánh sừng bò, bánh tart, và nhiều hơn nữa." },
          { title: "Bánh Tea-Break", subtitle: "Cho tiệc trà & sự kiện", description: "Set bánh nhỏ gọn, đa dạng cho các buổi tiệc trà công ty hoặc sự kiện đặc biệt." },
        ];

        try {
          const promises = defaultCategories.map(cat => {
            const slug = generateSlug(cat.title);
            const id = `cat-${slug}`;
            const docRef = doc(firestore, 'categories', id);
            const dataToSave: ProductCategory = { id, slug, ...cat };
            return setDoc(docRef, dataToSave);
          });

          await Promise.all(promises);

          toast({ title: "Hoàn tất!", description: "Các danh mục mặc định đã được tạo thành công." });
        } catch (error) {
          console.error("Error seeding categories: ", error);
          const permissionError = new FirestorePermissionError({
            path: 'categories',
            operation: 'create',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      };

      seedCategories();
    }
  }, [firestore, isLoading, categories, toast]);

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

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Quản lý Danh mục
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm">
            <File className="h-4 w-4 mr-2" />
            Xuất file
          </Button>
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
