'use client';
import {
  File,
  PlusCircle,
  Upload,
  MoreHorizontal,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { useState, useRef } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useToast } from '@/hooks/use-toast';
import type { NewsArticle } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { generateSlug } from '@/lib/utils';
import * as XLSX from 'xlsx';

export default function NewsPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const articlesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'news_articles') : null, [firestore]);
    const { data: articles, isLoading } = useCollection<NewsArticle>(articlesCollection);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteConfirm = (article: NewsArticle) => {
        setSelectedArticle(article);
        setIsDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedArticle || !firestore) return;

        setIsDeleting(true);
        const docRef = doc(firestore, 'news_articles', selectedArticle.id);
        
        try {
            await deleteDoc(docRef);

            toast({
                title: "Đã xóa",
                description: `Bài viết "${selectedArticle.title}" đã được xóa.`,
            });
        } catch (error) {
             const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
             toast({
                title: "Lỗi",
                description: `Không thể xóa bài viết. Vui lòng thử lại.`,
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteConfirmOpen(false);
            setSelectedArticle(null);
        }
    };

    const handleExport = () => {
        if (!articles || articles.length === 0) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không có bài viết nào để xuất." });
            return;
        }

        const MAX_CELL_LEN = 32760;
        const t = (val: any) => {
            const str = String(val ?? '');
            return str.length > MAX_CELL_LEN ? str.substring(0, MAX_CELL_LEN) : str;
        };

        const exportData = articles.map(article => ({
            'ID': t(article.id),
            'Tiêu đề': t(article.title),
            'Slug': t(article.slug || generateSlug(article.title)),
            'Danh mục': t(article.category),
            'Tác giả': t(article.author),
            'Tóm tắt': t(article.excerpt),
            'Nội dung (HTML)': t(article.content),
            'Ngày đăng': t(article.publicationDate),
            'URL Ảnh': t(article.imageUrl),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Danh sách Bài viết");

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vibary-news-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast({ title: "Xuất file thành công", description: `Đã xuất ${articles.length} bài viết ra file Excel.` });
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
                    const title = row['Tiêu đề'];
                    if (!title) continue;
                    
                    const id = row['ID'] || `news-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    
                    const articleData: NewsArticle = {
                        id,
                        title: String(title),
                        slug: String(row['Slug'] || generateSlug(title)),
                        category: String(row['Danh mục'] || 'Chuyện của Tiệm'),
                        author: String(row['Tác giả'] || 'Vibary Team'),
                        excerpt: String(row['Tóm tắt'] || ''),
                        content: String(row['Nội dung (HTML)'] || ''),
                        publicationDate: String(row['Ngày đăng'] || new Date().toISOString()),
                        imageUrl: String(row['URL Ảnh'] || 'https://placehold.co/1200x800/F4DDDD/333333?text=No+Image'),
                    };
                    
                    const docRef = doc(firestore, 'news_articles', id);
                    await setDoc(docRef, articleData, { merge: true });
                    count++;
                }

                toast({ title: "Nhập file thành công", description: `Đã cập nhật/thêm ${count} bài viết từ file Excel.` });
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
          <div className="flex items-center mb-4 gap-4">
             <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Quản lý Tin tức & Blog
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
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
                accept=".xlsx, .xls" 
                className="hidden" 
              />
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
                        {articles && articles.map((article) => {
                          const sanitizedSlug = article.slug || generateSlug(article.title);
                          return (
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
                                      <Link href={`/news/${sanitizedSlug}`} target="_blank">
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
                          )
                        })}
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
                    <span className="font-semibold"> "{selectedArticle?.title}" </span>.
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
