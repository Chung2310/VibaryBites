
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
import { kpiData, revenueData, productProportions, topSellingProducts, recentOrders } from '@/lib/admin-data';
import type { Ingredient, OrderStatus } from '@/lib/types';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

const statusMapping: Record<OrderStatus, { text: string; className: string }> = {
    new: { text: 'Mới', className: 'bg-blue-100 text-blue-800' },
    processing: { text: 'Đang làm', className: 'bg-yellow-100 text-yellow-800' },
    shipping: { text: 'Đang giao', className: 'bg-indigo-100 text-indigo-800' },
    completed: { text: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Đã hủy', className: 'bg-red-100 text-red-800' },
};


export default function Dashboard() {
  const firestore = useFirestore();
  const ingredientsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'ingredients') : null, [firestore]);
  const { data: ingredients, isLoading } = useCollection<Ingredient>(ingredientsCollection);

  const lowStockAlerts = ingredients?.filter(item => item.stock < item.parLevel) || [];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <div className='flex gap-2'>
            <Button>Tạo đơn hàng</Button>
            <Button variant="outline">Thêm sản phẩm</Button>
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
              +20.1% so với hôm qua
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng mới</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{kpiData.newOrders}</div>
            <p className="text-xs text-muted-foreground">
              +180.1% so với hôm qua
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.processingOrders}</div>
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
            <div className="text-2xl font-bold">{isLoading ? '...' : lowStockAlerts.length}</div>
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
              <CardTitle>Doanh thu</CardTitle>
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
              Bạn có {recentOrders.filter(o => o.status === 'new').length} đơn hàng mới cần xác nhận.
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
                {recentOrders.slice(0,5).map(order => (
                    <TableRow key={order.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarImage src={order.customerAvatar} alt="Avatar" />
                                    <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">{order.customerName}</p>
                                    <p className="text-xs text-muted-foreground">{order.id}</p>
                                </div>
                            </div>
                        </TableCell>
                         <TableCell className="text-right">
                             <div className="font-medium">{new Intl.NumberFormat('vi-VN').format(order.total)}đ</div>
                             <Badge className={`text-xs mt-1 ${statusMapping[order.status].className}`} variant="outline">{statusMapping[order.status].text}</Badge>
                        </TableCell>
                    </TableRow>
                ))}
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
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
             <CardHeader>
                <CardTitle>Tỷ trọng sản phẩm</CardTitle>
             </CardHeader>
             <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={productProportions} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {productProportions.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [`${value} đơn`, name]} />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
             </CardContent>
        </Card>
        <Card>
             <CardHeader>
                <CardTitle>Sản phẩm bán chạy</CardTitle>
             </CardHeader>
             <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topSellingProducts} layout="vertical" margin={{ left: 20, right: 30}}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} interval={0} />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                             formatter={(value: number) => [`${value} đã bán`, 'Số lượng']}
                        />
                        <Bar dataKey="sold" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Cảnh báo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <h3 className="font-semibold mb-2">Nguyên liệu sắp hết</h3>
              <div className="grid gap-2 text-sm">
                {isLoading ? <p className="text-muted-foreground">Đang tải...</p> : lowStockAlerts.length > 0 ? lowStockAlerts.map(item => (
                   <div key={item.id} className="flex justify-between items-center">
                     <span>{item.name}</span>
                     <span className="font-mono text-destructive">{item.stock}{item.unit}</span>
                   </div>
                )) : <p className="text-muted-foreground">Không có cảnh báo nào.</p>}
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Đơn hàng cần xác nhận</h3>
               <div className="grid gap-2 text-sm">
                 <div className="flex justify-between items-center">
                     <span>Đơn custom sinh nhật</span>
                     <Link href="#" className="text-primary hover:underline">#VBR-C002</Link>
                   </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

    

