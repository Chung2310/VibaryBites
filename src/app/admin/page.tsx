
'use client';
import {
  Activity,
  ArrowUpRight,
  DollarSign,
  AlertTriangle,
  ShoppingCart
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import type { Ingredient, Order, OrderStatus, CustomerProfile } from '@/lib/types';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, doc, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

const statusMapping: Record<OrderStatus, { text: string; className: string }> = {
    new: { text: 'Mới', className: 'bg-blue-100 text-blue-800' },
    processing: { text: 'Đang làm', className: 'bg-yellow-100 text-yellow-800' },
    shipping: { text: 'Đang giao', className: 'bg-indigo-100 text-indigo-800' },
    completed: { text: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Đã hủy', className: 'bg-red-100 text-red-800' },
};


function RecentOrderRow({ order }: { order: Order }) {
    const firestore = useFirestore();
    const customerRef = useMemoFirebase(
        () => (firestore && order.customerId ? doc(firestore, 'customers', order.customerId) : null),
        [firestore, order.customerId]
    );
    const { data: customer, isLoading } = useDoc<CustomerProfile>(customerRef);

    return (
         <TableRow>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={customer?.photoURL} alt="Avatar" />
                        <AvatarFallback>{customer?.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                       {isLoading ? <Skeleton className="h-4 w-24" /> : <p className="text-sm font-medium leading-none">{customer ? `${customer.firstName} ${customer.lastName}` : 'Khách vãng lai'}</p> }
                        <p className="text-xs text-muted-foreground">{order.id}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="font-medium">{new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ</div>
                <Badge className={`text-xs mt-1 ${statusMapping[order.orderStatus].className}`} variant="outline">{statusMapping[order.orderStatus].text}</Badge>
            </TableCell>
        </TableRow>
    );
}

export default function Dashboard() {
  const firestore = useFirestore();
  
  // --- Data Fetching ---
  const ingredientsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'ingredients') : null, [firestore]);
  const { data: ingredients, isLoading: isLoadingIngredients } = useCollection<Ingredient>(ingredientsCollection);

  const allOrdersQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'orders') : null, [firestore]);
  const { data: allOrders, isLoading: isLoadingOrders } = useCollection<Order>(allOrdersQuery);

  // --- KPI Calculation ---
  const { revenueToday, newOrdersCount, processingOrdersCount, recentOrders } = useMemo(() => {
    if (!allOrders) {
        return { revenueToday: 0, newOrdersCount: 0, processingOrdersCount: 0, recentOrders: [] };
    }
    
    const sortedOrders = [...allOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    const todayStr = new Date().toISOString().split('T')[0];
    
    let revenueToday = 0;
    let newOrdersCount = 0;
    let processingOrdersCount = 0;

    for (const order of sortedOrders) {
        if (order.orderDate.startsWith(todayStr)) {
            revenueToday += order.totalAmount;
        }
        if (order.orderStatus === 'new') {
            newOrdersCount++;
        }
        if (order.orderStatus === 'processing') {
            processingOrdersCount++;
        }
    }
    
    const recentOrders = sortedOrders.slice(0, 5);

    return { revenueToday, newOrdersCount, processingOrdersCount, recentOrders };
  }, [allOrders]);

  const lowStockAlerts = ingredients?.filter(item => item.stock < item.parLevel) || [];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <div className='flex gap-2'>
            <Button asChild><Link href="/admin/orders">Tạo đơn hàng</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/products/new">Thêm sản phẩm</Link></Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu hôm nay
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{new Intl.NumberFormat('vi-VN').format(revenueToday)}đ</div>}
            <p className="text-xs text-muted-foreground">
              Tổng doanh thu trong ngày
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng mới</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">+{newOrdersCount}</div>}
            <p className="text-xs text-muted-foreground">
              Số đơn hàng cần xác nhận
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{processingOrdersCount}</div> }
            <p className="text-xs text-muted-foreground">
              Số đơn hàng đang trong bếp
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo kho</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoadingIngredients ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{lowStockAlerts.length}</div>}
            <p className="text-xs text-muted-foreground">
              Nguyên liệu sắp hết
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Giao dịch gần đây</CardTitle>
              <CardDescription>
                Bạn có {newOrdersCount} đơn hàng mới cần xử lý.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/admin/orders">
                Xem tất cả
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingOrders && Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                             <div className="flex items-center gap-2">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="grid gap-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Skeleton className="h-5 w-24" />
                        </TableCell>
                    </TableRow>
                ))}
                {recentOrders.map(order => <RecentOrderRow key={order.id} order={order} />)}
                {!isLoadingOrders && recentOrders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">Không có đơn hàng nào.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
            <CardDescription>
              Top sản phẩm bán chạy nhất trong tháng này (dữ liệu tĩnh).
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {[
                  { name: 'BE IN BLOSSOM', sold: 120 },
                  { name: 'BELOVED DARLING', sold: 98 },
                  { name: 'A LITTLE GRACE', sold: 75 },
                  { name: 'SUMMER CALLING', sold: 60 },
                  { name: 'A GENTLE BLEND', sold: 45 },
                ].map((product) => (
                  <div key={product.name} className="flex items-center">
                    <p className="text-sm font-medium leading-none flex-1">{product.name}</p>
                    <p className="text-sm font-medium text-muted-foreground">{product.sold} đã bán</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
