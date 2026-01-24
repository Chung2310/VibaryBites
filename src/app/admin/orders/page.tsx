'use client';
import {
  File,
  ListFilter,
  MoreHorizontal,
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import type { Order, OrderStatus, CustomerProfile } from '@/lib/types';
import { useState } from 'react';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const statusMapping: Record<OrderStatus, { text: string; className: string }> = {
  new: { text: 'Mới', className: 'bg-blue-100 text-blue-800' },
  processing: { text: 'Đang làm', className: 'bg-yellow-100 text-yellow-800' },
  shipping: { text: 'Đang giao', className: 'bg-indigo-100 text-indigo-800' },
  completed: { text: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
  cancelled: { text: 'Đã hủy', className: 'bg-red-100 text-red-800' },
};

const TABS: { value: OrderStatus | 'all'; label: string; }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'new', label: 'Mới' },
    { value: 'processing', label: 'Đang xử lý'},
    { value: 'shipping', label: 'Đang giao' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
]

function OrderRow({ order }: { order: Order }) {
    const firestore = useFirestore();
    
    const customerRef = useMemoFirebase(
        () => (firestore && order.customerId ? doc(firestore, 'customers', order.customerId) : null),
        [firestore, order.customerId]
    );
    const { data: customer, isLoading } = useDoc<CustomerProfile>(customerRef);

    return (
        <TableRow>
            <TableCell className="hidden sm:table-cell font-medium">{order.id}</TableCell>
            <TableCell>
                {isLoading ? <Skeleton className="h-4 w-32" /> : (customer ? `${customer.firstName} ${customer.lastName}`: order.customerId)}
            </TableCell>
            <TableCell>
                <Badge variant="outline" className={statusMapping[order.orderStatus].className}>
                    {statusMapping[order.orderStatus].text}
                </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                {new Date(order.orderDate).toLocaleDateString('vi-VN')}
            </TableCell>
            <TableCell className="text-right">{new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ</TableCell>
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
                    <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                    <DropdownMenuItem>In hóa đơn</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                        Hủy đơn
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}


export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const group = collectionGroup(firestore, 'orders');
        if (activeTab === 'all') {
            return query(group);
        }
        return query(group, where('orderStatus', '==', activeTab));
    }, [firestore, activeTab]);

    const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

    return (
        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as OrderStatus | 'all')}>
          <div className="flex items-center">
            <TabsList>
              {TABS.map(tab => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Lọc
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Lọc theo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    7 ngày qua
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>30 ngày qua</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Năm nay</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Xuất File
                </span>
              </Button>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Tạo đơn hàng
                </span>
              </Button>
            </div>
          </div>
            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng</CardTitle>
                <CardDescription>
                  Quản lý và xem lịch sử các đơn hàng của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden w-[100px] sm:table-cell">
                        Mã Đơn
                      </TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Ngày đặt
                      </TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && Array.from({length: 5}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className='text-right'><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                    ))}
                    {orders?.map(order => (
                       <OrderRow key={order.id} order={order} />
                    ))}
                     {!isLoading && orders?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                Không có đơn hàng nào trong mục này.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Hiển thị <strong>{orders?.length ?? 0}</strong> đơn hàng
                </div>
              </CardFooter>
            </Card>
        </Tabs>
    )
}
