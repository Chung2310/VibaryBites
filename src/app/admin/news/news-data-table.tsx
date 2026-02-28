
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
import type { NewsArticle } from '@/lib/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { generateSlug } from '@/lib/utils';

interface NewsDataTableProps {
  articles: NewsArticle[];
  onEdit: (article: NewsArticle) => void;
  onDelete: (article: NewsArticle) => void;
}

export function NewsDataTable({ articles, onEdit, onDelete }: NewsDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">Ảnh</TableHead>
          <TableHead>Tiêu đề</TableHead>
          <TableHead>Danh mục</TableHead>
          <TableHead className="hidden md:table-cell">Ngày đăng</TableHead>
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
                  src={article.imageUrl || 'https://placehold.co/64x64'}
                  width="64"
                />
              </TableCell>
              <TableCell className="font-medium max-w-[250px] truncate">{article.title}</TableCell>
              <TableCell>
                <Badge variant="outline">{article.category}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {format(new Date(article.publicationDate), 'dd/MM/yyyy', { locale: vi })}
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
                    <DropdownMenuItem onSelect={() => onEdit(article)}>Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => window.open(`/news/${article.slug || generateSlug(article.title)}`, '_blank')}>Xem trước</DropdownMenuItem>
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
            <TableCell colSpan={5} className="h-24 text-center">
              Không tìm thấy bài viết nào.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
