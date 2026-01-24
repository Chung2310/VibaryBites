
'use client';

import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface RecipeEditorProps {
    product: Product;
}

export function RecipeEditor({ product }: RecipeEditorProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Chức năng đã được di chuyển</CardTitle>
                <CardDescription>
                    Việc quản lý công thức và các thuộc tính chi tiết giờ đã được tích hợp trực tiếp vào biểu mẫu chỉnh sửa sản phẩm để tiện lợi hơn.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>
                    Để chỉnh sửa công thức hoặc các chi tiết khác cho sản phẩm <strong>"{product.name}"</strong>, vui lòng sử dụng biểu mẫu chỉnh sửa sản phẩm thống nhất.
                </p>
                <Button asChild>
                    <Link href={`/admin/products/edit/${product.id}`}>
                        Đi đến trang chỉnh sửa sản phẩm
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
