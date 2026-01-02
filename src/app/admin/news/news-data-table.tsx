'use client';

import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { NewsArticle, ArticleStatus } from './data';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NewsDataTableProps {
  articles: NewsArticle[];
  onEdit: (article: NewsArticle) => void;
  onDelete: (article: NewsArticle) => void;
}

const statusVariantMap: Record<ArticleStatus, "default" | "secondary" | "destructive"> = {
    [ArticleStatus.Published]: "default",
    [ArticleStatus.Draft]: "secondary",
    [ArticleStatus.Hidden]: "destructive",
};


export function NewsDataTable({ articles, onEdit, onDelete }: NewsDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">Ảnh</TableHead>
          <TableHead>Tiêu đề</TableHead>
          <TableHead>Loại bài viết</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="hidden md:table-cell">Ngày đăng</TableHead>
          <TableHead className="hidden md:table-cell text-right">Lượt xem</TableHead>
          <TableHead>
            <span className="sr-only">Hành động</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.length > 0 ? (
          articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell className="hidden sm:table-cell">
                <Image
                  alt={article.title}
                  className="aspect-square rounded-md object-cover"
                  height="64"
                  src={article.featuredImage}
                  width="64"
                />
              </TableCell>
              <TableCell className="font-medium max-w-[250px] truncate">{article.title}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {article.categories.slice(0, 2).map(cat => (
                        <Badge key={cat} variant="outline">{cat}</Badge>
                    ))}
                    {article.categories.length > 2 && <Badge variant="outline">...</Badge>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariantMap[article.status]}>{article.status}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {format(new Date(article.publicationDate), 'dd/MM/yyyy', { locale: vi })}
              </TableCell>
              <TableCell className="hidden md:table-cell text-right">{article.views.toLocaleString('vi-VN')}</TableCell>
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
                    <DropdownMenuItem onSelect={() => onEdit(article)}>Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => window.open(`/news/${article.slug}`, '_blank')}>Xem trước</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => onDelete(article)} className="text-destructive">
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              Không tìm thấy bài viết nào.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
