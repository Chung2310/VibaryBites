'use client';
import {
  File,
  ListFilter,
  PlusCircle,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import React, { useState, useMemo } from 'react';
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
import { initialArticles, ArticleStatus, ArticleCategory } from './data';
import type { NewsArticle } from './data';
import { NewsDataTable } from './news-data-table';
import { NewsForm } from './news-form';

export default function NewsPage() {
    const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deletingArticle, setDeletingArticle] = useState<NewsArticle | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ArticleStatus[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<ArticleCategory[]>([]);


    const { toast } = useToast();

    // --- CRUD Handlers ---

    const handleAddNew = () => {
        setEditingArticle(null);
        setIsFormOpen(true);
    };

    const handleEdit = (article: NewsArticle) => {
        setEditingArticle(article);
        setIsFormOpen(true);
    };

    const handleSave = (savedArticle: NewsArticle) => {
        if (editingArticle) {
            // Update existing article
            setArticles(articles.map(a => a.id === savedArticle.id ? savedArticle : a));
            toast({ title: "Thành công", description: "Bài viết đã được cập nhật." });
        } else {
            // Add new article
            setArticles([savedArticle, ...articles]);
            toast({ title: "Thành công", description: "Bài viết mới đã được tạo." });
        }
        setIsFormOpen(false);
        setEditingArticle(null);
    };

    const openDeleteConfirm = (article: NewsArticle) => {
        setDeletingArticle(article);
        setIsDeleteConfirmOpen(true);
    };

    const handleDelete = () => {
        if (!deletingArticle) return;

        // Simulate API call
        setTimeout(() => {
            setArticles(articles.filter(a => a.id !== deletingArticle.id));
            toast({
                variant: 'destructive',
                title: "Đã xóa",
                description: `Bài viết "${deletingArticle.title}" đã được xóa.`,
            });
            setDeletingArticle(null);
        }, 500);
    };

    // --- Filtering Logic ---

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const titleMatch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
            const statusMatch = statusFilter.length === 0 || statusFilter.includes(article.status);
            const categoryMatch = categoryFilter.length === 0 || categoryFilter.some(cat => article.categories.includes(cat));
            return titleMatch && statusMatch && categoryMatch;
        });
    }, [articles, searchQuery, statusFilter, categoryFilter]);


    const toggleFilter = <T extends string>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) => {
        setter(prev => 
            prev.includes(value) 
                ? prev.filter(item => item !== value) 
                : [...prev, value]
        );
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
              <Button size="sm" className="h-8 gap-1" onClick={handleAddNew}>
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
                 <div className="flex items-center gap-4 pt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Tìm kiếm theo tiêu đề..."
                            className="w-full rounded-lg bg-background pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 gap-1">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Lọc
                            </span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {(Object.keys(ArticleStatus) as Array<keyof typeof ArticleStatus>).map(key => (
                             <DropdownMenuCheckboxItem 
                                key={key}
                                checked={statusFilter.includes(ArticleStatus[key])}
                                onSelect={(e) => e.preventDefault()} // prevent menu from closing
                                onClick={() => toggleFilter(setStatusFilter, ArticleStatus[key])}
                            >
                                {ArticleStatus[key]}
                            </DropdownMenuCheckboxItem>
                        ))}
                         <DropdownMenuSeparator />
                        <DropdownMenuLabel>Loại bài viết</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                        {(Object.keys(ArticleCategory) as Array<keyof typeof ArticleCategory>).map(key => (
                             <DropdownMenuCheckboxItem 
                                key={key}
                                checked={categoryFilter.includes(ArticleCategory[key])}
                                onSelect={(e) => e.preventDefault()}
                                onClick={() => toggleFilter(setCategoryFilter, ArticleCategory[key])}
                            >
                                {ArticleCategory[key]}
                            </DropdownMenuCheckboxItem>
                        ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </CardHeader>
              <CardContent>
                <NewsDataTable 
                    articles={filteredArticles}
                    onEdit={handleEdit}
                    onDelete={openDeleteConfirm}
                />
              </CardContent>
            </Card>
        
        <NewsForm
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            article={editingArticle}
            onSave={handleSave}
        />

        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn bài viết
                    <span className="font-semibold"> {deletingArticle?.title} </span>.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingArticle(null)}>Hủy</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={(e) => {
                        e.preventDefault();
                        handleDelete();
                        setIsDeleteConfirmOpen(false);
                    }} 
                    className="bg-destructive hover:bg-destructive/90"
                >
                    Xóa
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        </>
    )
}
