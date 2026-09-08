'use client';
import Link, { useLinkStatus } from 'next/link';
import { prefetchAdminData } from '@/lib/admin-prefetch';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Package, ShoppingCart, Users, ChevronLeft, ChevronRight, LogOut, Ticket, Warehouse, Newspaper, Book, List, Loader2, Menu, ExternalLink, RefreshCw, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { AuthProvider, useAuth, useUser } from '@/lib/auth/provider';
import { useToast } from '@/hooks/use-toast';

const navGroups = [
  { label: 'Vận hành', links: [
    { href: '/admin', label: 'Tổng quan', icon: Home },
    { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
    { href: '/admin/inventory', label: 'Kho nguyên liệu', icon: Warehouse },
    { href: '/admin/customers', label: 'Khách hàng', icon: Users },
  ] },
  { label: 'Sản phẩm & nội dung', links: [
    { href: '/admin/products', label: 'Sản phẩm', icon: Package },
    { href: '/admin/categories', label: 'Danh mục', icon: List },
    { href: '/admin/attributes', label: 'Thuộc tính', icon: Book },
    { href: '/admin/birthday-sizes', label: 'Cỡ bánh sinh nhật', icon: Ticket },
    { href: '/admin/recipes', label: 'Công thức', icon: ChefHat },
    { href: '/admin/news', label: 'Tin tức & Blog', icon: Newspaper },
  ] },
];
const isActive = (pathname: string, href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));
function NavigationPending() {
  const { pending } = useLinkStatus();
  return pending ? <Loader2 role="status" aria-label="Đang chuyển trang" className="ml-auto h-4 w-4 shrink-0 animate-spin" /> : null;
}
function Navigation({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const warmRoute = (href: string) => {
    router.prefetch(href);
    prefetchAdminData(href);
  };
  return <nav aria-label="Điều hướng quản trị" className="space-y-6 px-3 py-5">
    {navGroups.map(group => <div key={group.label}>
      {!collapsed && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>}
      <div className="space-y-1">{group.links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} prefetch={true} onMouseEnter={() => warmRoute(href)} onFocus={() => warmRoute(href)} onTouchStart={() => warmRoute(href)} onClick={onNavigate} title={collapsed ? label : undefined} aria-label={collapsed ? label : undefined} aria-current={isActive(pathname, href) ? 'page' : undefined}
        className={cn('flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', isActive(pathname, href) ? 'bg-primary/50 font-semibold text-primary-foreground' : 'text-muted-foreground', collapsed && 'justify-center px-0')}
      ><Icon className="h-[18px] w-[18px] shrink-0" />{!collapsed && label}<NavigationPending /></Link>)}</div>
    </div>)}
  </nav>;
}
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!isUserLoading) {
      if (!user && pathname !== '/admin/login') router.replace('/admin/login');
      if (user && pathname === '/admin/login') router.replace('/admin');
    }
  }, [user, isUserLoading, pathname, router]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  async function handleAccountAction(action: 'logout' | 'refresh') {
    setBusy(true);
    try {
      if (action === 'logout') {
        await auth.signOut();
        toast({ title: 'Đã đăng xuất' });
      } else {
        await auth.refresh();
        window.location.reload();
      }
    } catch {
      toast({ variant: 'destructive', title: action === 'logout' ? 'Không thể đăng xuất' : 'Không thể làm mới phiên', description: 'Vui lòng thử lại.' });
    } finally { setBusy(false); }
  }
  if (pathname === '/admin/login') return <>{children}</>;
  if (isUserLoading || !user) return <div role="status" className="flex min-h-screen items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /><span>Đang tải trang quản trị…</span></div>;
  const currentPage = navGroups.flatMap(group => group.links).find(link => isActive(pathname, link.href));
  return <div className="flex min-h-screen w-full bg-slate-50/70">
    <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:p-3">Đến nội dung chính</a>
    <aside className={cn('sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-background md:flex', collapsed ? 'w-[72px]' : 'w-60')}>
      <Link href="/admin" aria-label="VIBARY Admin" className={cn('flex h-20 shrink-0 items-center gap-3 border-b px-5', collapsed && 'justify-center px-0')}>
        <Image src="/logo.png" alt="" width={32} height={32} />
        {!collapsed && <div><p className="font-semibold tracking-wider">VIBARY</p><p className="text-xs text-muted-foreground">Không gian quản trị</p></div>}
      </Link>
      <div className="flex-1 overflow-y-auto"><Navigation collapsed={collapsed} /></div>
      <div className="border-t p-3"><Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'} aria-expanded={!collapsed}>
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" />Thu gọn menu</>}
      </Button></div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:px-8">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild><Button variant="outline" size="icon" className="shrink-0 md:hidden" aria-label="Mở menu điều hướng"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col overflow-y-auto">
            <div className="px-6 pt-6 font-semibold">VIBARY Admin</div>
            <SheetDescription className="sr-only">Chọn trang quản trị cần truy cập.</SheetDescription>
            <Navigation onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">Quản trị cửa hàng</p><p className="truncate text-sm font-semibold">{currentPage?.label || 'Quản trị'}</p></div>
        <Button asChild variant="ghost" size="sm" className="hidden gap-2 sm:inline-flex"><Link href="/" target="_blank" rel="noopener noreferrer">Xem cửa hàng<ExternalLink className="h-4 w-4" /></Link></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline" className="gap-2 rounded-full" disabled={busy} aria-label="Menu tài khoản">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image src="/logo.png" width={24} height={24} alt="" />}
            <span className="hidden max-w-40 truncate sm:inline">{user.displayName || user.username}</span>
          </Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.displayName || user.username}</DropdownMenuLabel><DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/" target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Xem cửa hàng</Link></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void handleAccountAction('refresh')}><RefreshCw className="mr-2 h-4 w-4" />Làm mới phiên</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void handleAccountAction('logout')}><LogOut className="mr-2 h-4 w-4" />Đăng xuất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main id="admin-content" tabIndex={-1} className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-6 p-4 outline-none sm:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><AdminLayoutContent>{children}</AdminLayoutContent></AuthProvider>;
}
