
'use client';
import {
  File,
  MoreHorizontal,
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
import Image from 'next/image';
import { useState } from 'react';
import type { NewsArticle } from '@/lib/types';
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

export default function NewsPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const articlesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'news_articles') : null, [firestore]);
    const { data: articles, isLoading } = useCollection<NewsArticle>(articlesCollection);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<NewsArticle | undefined>(undefined);
    const { toast } = useToast();
    
    const openDeleteConfirm = (article: NewsArticle) => {
        setSelectedArticle(article);
        setIsDeleteConfirmOpen(true);
    }

    const closeDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false);
        setSelectedArticle(undefined);
    }
    
    const handleDelete = () => {
        if (!selectedArticle || !firestore) return;

        const docRef = doc(firestore, 'news_articles', selectedArticle.id);
        
        const deletePromises: Promise<any>[] = [];

        if (selectedArticle.imageUrl) {
            deletePromises.push(deleteImage(selectedArticle.imageUrl));
        }

        deletePromises.push(deleteDoc(docRef));

        Promise.allSettled(deletePromises)
            .then(results => {
                const errors = results.filter(r => r.status === 'rejected');
                if (errors.length > 0) {
                    console.error("Some deletions failed:", errors);
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: `Could not delete all parts of the article. Check console for details.`,
                    });
                } else {
                    toast({
                        title: "Xóa thành công",
                        description: `Bài viết "${selectedArticle.title}" đã được xóa.`,
                        variant: 'destructive',
                    });
                }
            })
            .finally(() => {
                closeDeleteConfirm();
            });
    }

    return (
        <>
          <div className="flex items-center mb-4">
             <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Quản lý tin tức
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Xuất File
                </span>
              </Button>
              <Button size="sm" className="h-8 gap-1" asChild>
                <Link href="/admin/news/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Thêm bài viết
                    </span>
                </Link>
              </Button>
            </div>
          </div>
            <Card>
              <CardHeader>
                <CardTitle>Danh sách bài viết</CardTitle>
                <CardDescription>
                    Quản lý các bài viết tin tức và câu chuyện của tiệm.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">Ảnh</span>
                      </TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Tác giả</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Ngày đăng
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
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell>
                                <Skeleton className="h-8 w-8" />
                            </TableCell>
                        </TableRow>
                   ))}
                   {articles && articles.map(article => (
                        <TableRow key={article.id}>
                            <TableCell className="hidden sm:table-cell">
                                {article.imageUrl && (
                                    <Image
                                        alt={article.title}
                                        className="aspect-square rounded-md object-cover"
                                        height="64"
                                        src={article.imageUrl}
                                        width="64"
                                    />
                                )}
                            </TableCell>
                            <TableCell className="font-medium">
                                {article.title}
                            </TableCell>
                             <TableCell>
                                {article.author}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {new Date(article.publicationDate).toLocaleDateString('vi-VN')}
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
                                    <DropdownMenuItem onClick={() => router.push(`/admin/news/edit/${article.id}`)}>Chỉnh sửa</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(`/news/${article.slug}`)} target="_blank">Xem trước</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className='text-destructive' onClick={() => openDeleteConfirm(article)}>Xóa</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                   ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Hiển thị <strong>{articles?.length || 0}</strong> trên <strong>{articles?.length || 0}</strong> bài viết
                </div>
              </CardFooter>
            </Card>
        
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn bài viết
                    <span className="font-semibold"> {selectedArticle?.title} </span>
                    và ảnh bìa liên quan.
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
