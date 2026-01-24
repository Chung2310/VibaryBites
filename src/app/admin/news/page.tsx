
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useToast } from '@/hooks/use-toast';
import type { NewsArticle } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { deleteImage } from '@/firebase/storage';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MoreHorizontal, ExternalLink, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewsPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const articlesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'news_articles') : null, [firestore]);
    const { data: articles, isLoading } = useCollection<NewsArticle>(articlesCollection);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { toast } = useToast();

    const openDeleteConfirm = (article: NewsArticle) => {
        setSelectedArticle(article);
        setIsDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedArticle || !firestore) return;

        setIsDeleting(true);
        const docRef = doc(firestore, 'news_articles', selectedArticle.id);
        
        try {
            if (selectedArticle.imageUrl) {
                await deleteImage(selectedArticle.imageUrl);
            }
            await deleteDoc(docRef);

            toast({
                title: "Đã xóa",
                description: `Bài viết "${selectedArticle.title}" đã được xóa.`,
                variant: 'destructive',
            });
        } catch (error) {
            console.error("Error deleting article: ", error);
             toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: `Không thể xóa bài viết. Vui lòng thử lại.`,
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteConfirmOpen(false);
            setSelectedArticle(null);
        }
    };

    return (
        <>
          <div className="flex items-center mb-4 gap-4">
             <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Quản lý Tin tức & Blog
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Xuất File
                </span>
              </Button>
              <Button size="sm" className="h-8 gap-1" onClick={() => router.push('/admin/news/new')}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Thêm bài viết
                </span>
              </Button>
            </div>
          </div>
            <Card>
              <CardHeader>
                <CardTitle>Danh sách bài viết</CardTitle>
                <CardDescription>
                    Quản lý các bài viết tin tức, công thức, và câu chuyện của tiệm.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">Ảnh</TableHead>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Loại bài viết</TableHead>
                        <TableHead className="hidden md:table-cell">Ngày đăng</TableHead>
                        <TableHead>
                            <span className="sr-only">Hành động</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 3}).map((_, i) => (
                           <TableRow key={i}>
                                <TableCell><Skeleton className="h-16 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                           </TableRow>
                        ))}
                        {articles && articles.map((article) => (
                        <TableRow key={article.id}>
                            <TableCell className="hidden sm:table-cell">
                            <Image
                                alt={article.title}
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={article.imageUrl || 'https://placehold.co/64x64'}
                                width="64"
                            />
                            </TableCell>
                            <TableCell className="font-medium max-w-[250px] truncate">{article.title}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{article.category}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {new Date(article.publicationDate).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => router.push(`/admin/news/edit/${article.id}`)}>Chỉnh sửa</DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                   <Link href={`/news/${article.slug}`} target="_blank">
                                        Xem trước
                                        <ExternalLink className="h-3 w-3 ml-2" />
                                   </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => openDeleteConfirm(article)} className="text-destructive">
                                    Xóa
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {articles?.length === 0 && !isLoading && (
                     <div className="text-center p-8 text-muted-foreground">Không có bài viết nào.</div>
                 )}
              </CardContent>
            </Card>

        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={isDeleting ? () => {} : setIsDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn bài viết
                    <span className="font-semibold"> "{selectedArticle?.title}" </span> và ảnh bìa liên quan.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedArticle(null)} disabled={isDeleting}>Hủy</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isDeleting}
                >
                    {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xóa...</> : 'Xóa'}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        </>
    )
}
