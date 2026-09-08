'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, Wallet, AlertTriangle, ShoppingCart, Plus, RefreshCw, PackageCheck, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useDoc, useDatabase, useDataMemo, collection, doc, query, orderBy, invalidateData } from '@/lib/data-client';
import { shopDateKey, summarizeOrders } from '@/lib/admin-dashboard';
import type { Ingredient, Order, OrderStatus, CustomerProfile } from '@/lib/types';

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const dateFormat = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const statusMapping: Record<OrderStatus, { text: string; className: string }> = {
  new: { text: 'Mới', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  processing: { text: 'Đang làm', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  shipping: { text: 'Đang giao', className: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  completed: { text: 'Hoàn thành', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  cancelled: { text: 'Đã hủy', className: 'bg-red-50 text-red-800 border-red-200' },
};
function RecentOrderRow({ order }: { order: Order }) {
  const database = useDatabase();
  const customerRef = useDataMemo(() => order.customerId && !order.customer ? doc(database, 'customers', order.customerId) : null, [database, order.customerId, order.customer]);
  const { data, isLoading, error } = useDoc<CustomerProfile>(customerRef);
  const customer = order.customer || data;
  const status = statusMapping[order.orderStatus];
  return <TableRow>
    <TableCell className="py-4">
      {isLoading ? <Skeleton className="h-4 w-28" /> : <p className="font-medium">{customer ? `${customer.firstName} ${customer.lastName}` : error ? 'Chưa tải được khách hàng' : 'Khách vãng lai'}</p>}
      <p className="mt-1 max-w-40 truncate text-xs text-muted-foreground" title={order.id}>#{order.id}</p>
    </TableCell>
    <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">{Number.isFinite(Date.parse(order.orderDate)) ? dateFormat.format(new Date(order.orderDate)) : '—'}</TableCell>
    <TableCell className="text-right">
      <p className="whitespace-nowrap font-semibold tabular-nums">{currency.format(order.totalAmount)}</p>
      <Badge variant="outline" className={`mt-1 whitespace-nowrap text-[11px] ${status?.className || ''}`}>{status?.text || order.orderStatus}</Badge>
    </TableCell>
  </TableRow>;
}
function LoadingList() {
  return <div className="space-y-4" aria-label="Đang tải dữ liệu">{[0, 1, 2].map(key => <Skeleton key={key} className="h-12 w-full" />)}</div>;
}
export default function Dashboard() {
  const database = useDatabase();
  const ingredientsRef = useDataMemo(() => collection(database, 'ingredients'), [database]);
  const ordersRef = useDataMemo(() => query(collection(database, 'orders'), orderBy('orderDate', 'desc')), [database]);
  const { data: ingredients, isLoading: loadingStock, error: stockError } = useCollection<Ingredient>(ingredientsRef);
  const { data: orders, isLoading: loadingOrders, error: ordersError } = useCollection<Order>(ordersRef);
  const [today, setToday] = useState(() => shopDateKey(new Date()));
  useEffect(() => {
    const timer = window.setInterval(() => setToday(shopDateKey(new Date())), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const summary = useMemo(() => summarizeOrders(orders || [], new Date(today + 'T12:00:00+07:00')), [orders, today]);
  const lowStock = useMemo(() => (ingredients || []).filter(item => item.stock < item.parLevel).sort((a, b) => a.stock / a.parLevel - b.stock / b.parLevel), [ingredients]);
  const metrics = [
    { label: 'Giá trị đơn hôm nay', value: currency.format(summary.orderValueToday), hint: 'Đơn tạo hôm nay, không gồm đơn hủy', icon: Wallet, href: '/admin/orders', loading: loadingOrders, error: ordersError, color: 'bg-rose-50 text-rose-700' },
    { label: 'Đơn hàng mới', value: summary.newOrders, hint: 'Đang chờ bạn xác nhận', icon: ShoppingCart, href: '/admin/orders', loading: loadingOrders, error: ordersError, color: 'bg-blue-50 text-blue-700' },
    { label: 'Đang chế biến', value: summary.processingOrders, hint: 'Đơn đang được chuẩn bị trong bếp', icon: Activity, href: '/admin/orders', loading: loadingOrders, error: ordersError, color: 'bg-violet-50 text-violet-700' },
    { label: 'Cần nhập nguyên liệu', value: lowStock.length, hint: 'Tồn kho dưới mức tối thiểu', icon: AlertTriangle, href: '/admin/inventory', loading: loadingStock, error: stockError, color: 'bg-amber-50 text-amber-700' },
  ];
  return <>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">VIBARY / Tổng quan</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Cửa hàng hôm nay</h1><p className="mt-2 text-sm text-muted-foreground">Theo dõi đơn hàng và những việc cần xử lý.</p></div>
      <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/admin/orders"><ShoppingCart className="mr-2 h-4 w-4" />Quản lý đơn</Link></Button><Button asChild><Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" />Thêm sản phẩm</Link></Button></div>
    </div>
    {(ordersError || stockError) && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>Không thể tải {ordersError && stockError ? 'đơn hàng và kho' : ordersError ? 'đơn hàng' : 'kho nguyên liệu'}. Số liệu có thể chưa đầy đủ.</p><Button variant="outline" size="sm" onClick={() => { if (ordersError) invalidateData('orders'); if (stockError) invalidateData('ingredients'); }}><RefreshCw className="mr-2 h-4 w-4" />Thử lại</Button></div>}
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {metrics.map(({ label, value, hint, icon: Icon, href, loading, error, color }) => <Link key={label} href={href} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Card className="h-full rounded-xl shadow-sm transition-shadow hover:shadow-md"><CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle><span className={`rounded-lg p-2 ${color}`}><Icon className="h-5 w-5" /></span></CardHeader><CardContent>{loading ? <Skeleton className="h-9 w-32" /> : <p className="break-words text-2xl font-semibold tracking-tight tabular-nums">{error ? '—' : value}</p>}<p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p></CardContent></Card></Link>)}
    </div>
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card className="min-w-0 rounded-xl shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0"><div><CardTitle className="text-lg">Đơn hàng gần đây</CardTitle><CardDescription className="mt-1">5 đơn mới nhất của cửa hàng</CardDescription></div><Button asChild variant="ghost" size="sm"><Link href="/admin/orders">Xem tất cả<ArrowUpRight className="ml-1 h-4 w-4" /></Link></Button></CardHeader>
        <CardContent>{loadingOrders ? <LoadingList /> : ordersError ? <p className="py-12 text-center text-sm text-muted-foreground">Chưa tải được danh sách đơn hàng.</p> : <Table><TableHeader><TableRow><TableHead>Khách hàng / Mã đơn</TableHead><TableHead className="hidden xl:table-cell">Ngày đặt</TableHead><TableHead className="text-right">Giá trị / Trạng thái</TableHead></TableRow></TableHeader><TableBody>{summary.recentOrders.map(order => <RecentOrderRow key={order.id} order={order} />)}{summary.recentOrders.length === 0 && <TableRow><TableCell colSpan={3} className="h-40 text-center text-muted-foreground"><ShoppingCart className="mx-auto mb-3 h-7 w-7" />Chưa có đơn hàng nào.</TableCell></TableRow>}</TableBody></Table>}</CardContent>
      </Card>
      <Card className="min-w-0 rounded-xl shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><AlertTriangle className="h-5 w-5 text-amber-600" />Nguyên liệu cần nhập</CardTitle><CardDescription>Ưu tiên nguyên liệu có tỷ lệ tồn thấp nhất.</CardDescription></CardHeader><CardContent>
        {loadingStock ? <LoadingList /> : stockError ? <p className="py-8 text-center text-sm text-muted-foreground">Chưa tải được tồn kho.</p> : lowStock.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground"><PackageCheck className="mx-auto mb-3 h-8 w-8 text-emerald-600" />{ingredients?.length ? 'Tồn kho đang ở mức an toàn.' : 'Chưa có nguyên liệu trong kho.'}</div> : <ul className="divide-y">{lowStock.slice(0, 5).map(item => <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><p className="break-words text-sm font-medium">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">Mức tối thiểu: {item.parLevel} {item.unit}</p></div><Badge variant="outline" className="shrink-0 border-amber-200 bg-amber-50 text-amber-800">{item.stock} {item.unit}</Badge></li>)}</ul>}
        <Button asChild variant="outline" className="mt-4 w-full"><Link href="/admin/inventory">Quản lý kho<ArrowUpRight className="ml-2 h-4 w-4" /></Link></Button>
      </CardContent></Card>
    </div>
    <Card className="rounded-xl shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5 text-rose-600" />Sản phẩm bán chạy tháng này</CardTitle><CardDescription>Theo số lượng trong đơn hoàn thành, đặt trong tháng hiện tại (giờ Việt Nam).</CardDescription></CardHeader><CardContent>
      {loadingOrders ? <LoadingList /> : ordersError ? <p className="py-6 text-sm text-muted-foreground">Chưa tải được thống kê sản phẩm.</p> : summary.topProducts.length === 0 ? <p className="py-6 text-sm text-muted-foreground">Chưa có sản phẩm từ đơn hoàn thành trong tháng này.</p> : <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{summary.topProducts.map((product, index) => <li key={product.id} className="flex items-center gap-3 rounded-xl border bg-muted/20 p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/40 text-sm font-semibold">{index + 1}</span><div className="min-w-0"><p className="break-words text-sm font-medium">{product.name}</p><p className="mt-1 text-xs text-muted-foreground">{product.sold} sản phẩm đã bán</p></div></li>)}</ol>}
    </CardContent></Card>
  </>;
}
