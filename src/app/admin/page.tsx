'use client';
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  Cake,
  AlertTriangle,
  ClipboardList,
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
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { kpiData, revenueData, productProportions, topSellingProducts } from '@/lib/admin-data';
import type { Ingredient, Order, OrderStatus, CustomerProfile } from '@/lib/types';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, doc, limit, orderBy, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

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
    const { data: customer } = useDoc<CustomerProfile>(customerRef);

    return (
         <TableRow>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={customer?.photoURL} alt="Avatar" />
                        <AvatarFallback>{customer?.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{customer ? `${customer.firstName} ${customer.lastName}` : '...'}</p>
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
  
  // Low stock ingredients
  const ingredientsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'ingredients') : null, [firestore]);
  const { data: ingredients, isLoading: isLoadingIngredients } = useCollection<Ingredient>(ingredientsCollection);
  const lowStockAlerts = ingredients?.filter(item => item.stock < item.parLevel) || [];

  // Processing Orders Count
  const processingOrdersQuery = useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'orders'), where('orderStatus', '==', 'processing')) : null, [firestore]);
  const { data: processingOrders, isLoading: isLoadingProcessing } = useCollection<Order>(processingOrdersQuery);
  
  // New Orders Count
  const newOrdersQuery = useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'orders'), where('orderStatus', '==', 'new')) : null, [firestore]);
  const { data: newOrders, isLoading: isLoadingNew } = useCollection<Order>(newOrdersQuery);

  // Recent Orders List
  const recentOrdersQuery = useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'orders'), orderBy('orderDate', 'desc'), limit(5)) : null, [firestore]);
  const { data: recentOrders, isLoading: isLoadingRecent } = useCollection<Order>(recentOrdersQuery);


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
            <div className="text-2xl font-bold">{new Intl.NumberFormat('vi-VN').format(kpiData.revenueToday)}đ</div>
            <p className="text-xs text-muted-foreground">
              (Dữ liệu tĩnh)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng mới</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingNew ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">+{newOrders?.length || 0}</div>}
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
            {isLoadingProcessing ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{processingOrders?.length || 0}</div> }
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
              <CardTitle>Doanh thu (dữ liệu tĩnh)</CardTitle>
              <CardDescription>
                Doanh thu trong 7 ngày gần nhất.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} stroke="#888888" fontSize={12} />
                    <YAxis tickFormatter={(val) => `${val / 1000000}tr`} stroke="#888888" fontSize={12} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                        labelStyle={{ fontWeight: 'bold' }}
                        formatter={(value: number) => [new Intl.NumberFormat('vi-VN').format(value) + 'đ', 'Doanh thu']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} dot={{r: 4}} />
                </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng mới nhất</CardTitle>
            <CardDescription>
              Bạn có {newOrders?.length || 0} đơn hàng mới cần xác nhận.
            </CardDescription>
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
                {isLoadingRecent && Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                ))}
                {recentOrders?.map(order => <RecentOrderRow key={order.id} order={order} />)}
                {!isLoadingRecent && recentOrders?.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">Không có đơn hàng nào.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
           <CardContent>
             <Button size="sm" className="w-full" asChild>
                <Link href="/admin/orders">Xem tất cả</Link>
             </Button>
           </CardContent>
        </Card>
      </div>
    </>
  );
}
