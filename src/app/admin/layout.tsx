'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Ticket,
  Warehouse,
  MoreHorizontal,
  Newspaper,
  BookMarked,
  List,
  Loader2,
  Book,
} from 'lucide-react';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { 
    label: 'Quản lý sản phẩm', 
    icon: Package,
    subLinks: [
        { href: '/admin/products', label: 'Danh sách sản phẩm', icon: List },
        { href: '/admin/attributes', label: 'Thuộc tính', icon: Settings },
        { href: '/admin/recipes', label: 'Công thức', icon: Book },
    ]
  },
  { href: '/admin/inventory', label: 'Kho hàng', icon: Warehouse },
  { href: '/admin/news', label: 'Tin tức & Blog', icon: Newspaper },
  { href: '/admin/promotions', label: 'Khuyến mãi', icon: Ticket },
];

function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      toast({ title: 'Đã đăng xuất' });
    }
  };

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  const getActiveAccordionItem = () => {
    const activeItem = navLinks.find(link => link.subLinks?.some(sub => pathname.startsWith(sub.href)));
    return activeItem ? activeItem.label : undefined;
  };

  return (
    <div className={cn(
        "relative hidden border-r bg-muted/40 md:block transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
    )}>
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <Image src="/logo.png" alt="Vibary Logo" width={28} height={28} />
                    {!isCollapsed && <span className="">VIBARY Admin</span>}
                </Link>
                 <Button variant="outline" size="icon" className="ml-auto h-8 w-8" onClick={toggleSidebar}>
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4", isCollapsed && "px-2")}>
                    <Accordion type="single" collapsible defaultValue={getActiveAccordionItem()} className="w-full">
                        {navLinks.map((link) => (
                            link.subLinks ? (
                                <AccordionItem value={link.label} key={link.label} className="border-b-0">
                                    <AccordionTrigger className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary hover:no-underline",
                                        link.subLinks.some(sub => pathname.startsWith(sub.href)) && "text-primary"
                                    )}>
                                         <div className="flex items-center gap-3">
                                            <link.icon className="h-4 w-4" />
                                            {!isCollapsed && link.label}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-4">
                                        {link.subLinks.map(subLink => (
                                             <Link
                                                key={subLink.href}
                                                href={subLink.href}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary',
                                                    pathname.startsWith(subLink.href) && 'bg-muted text-primary',
                                                    isCollapsed && "justify-center"
                                                )}
                                            >
                                                <subLink.icon className="h-4 w-4" />
                                                {!isCollapsed && subLink.label}
                                            </Link>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary',
                                        pathname === link.href && 'bg-muted text-primary',
                                        isCollapsed && "justify-center"
                                    )}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {!isCollapsed && link.label}
                                    {link.badge && !isCollapsed && (
                                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                        {link.badge}
                                    </Badge>
                                    )}
                                </Link>
                            )
                        ))}
                    </Accordion>
                </nav>
            </div>
            <div className="mt-auto p-4">
                <Card className={cn(isCollapsed && "p-0 bg-transparent border-0")}>
                    <CardHeader className={cn("p-2 pt-0 md:p-4", isCollapsed && "p-0")}>
                         {!isCollapsed && <CardTitle>Cần giúp đỡ?</CardTitle>}
                         {!isCollapsed && <CardDescription>
                            Liên hệ hỗ trợ nếu bạn gặp vấn đề với hệ thống.
                        </CardDescription>}
                    </CardHeader>
                    {!isCollapsed && <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                        <Button size="sm" className="w-full">
                            Hỗ trợ
                        </Button>
                    </CardContent>}
                </Card>

                 <div className={cn("flex items-center p-2 mt-4 border-t", isCollapsed && "flex-col gap-2")}>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
  )
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isUserLoading) {
      return; // Still loading, do nothing.
    }

    if (!user) {
      // No user logged in.
      // If not on the login page, redirect there.
      if (pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
    } else {
      // User is logged in. For now, any logged in user can access admin.
      // If they are on the login page, redirect to the dashboard.
      if (pathname === '/admin/login') {
        router.replace('/admin');
      }
    }
  }, [user, isUserLoading, pathname, router]);
  
  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      toast({ title: 'Đã đăng xuất' });
    }
  };
  
  if (isUserLoading || (!user && pathname !== '/admin/login')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
           <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Image src="/logo.png" alt="Vibary Logo" width={28} height={28} />
                  <span className="sr-only">VIBARY Admin</span>
                </Link>
                {navLinks.map(link => (
                    link.subLinks ? (
                        <Accordion type="single" collapsible key={link.label}>
                            <AccordionItem value={link.label} className="border-b-0">
                                <AccordionTrigger className="text-lg font-medium text-foreground transition-colors hover:text-primary hover:no-underline">
                                    <div className="flex items-center gap-4">
                                        <link.icon className="h-5 w-5" />
                                        {link.label}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-8">
                                    {link.subLinks.map(subLink => (
                                        <Link
                                            key={subLink.href}
                                            href={subLink.href}
                                            className="block py-2 text-muted-foreground hover:text-foreground"
                                        >
                                            {subLink.label}
                                        </Link>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    ) : (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-foreground hover:text-primary"
                        >
                            <link.icon className="h-5 w-5" />
                            {link.label}
                            {link.badge && (
                                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                    {link.badge}
                                </Badge>
                            )}
                        </Link>
                    )
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Search can be added here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                 <Image src="https://i.pravatar.cc/40" width={36} height={36} alt="Admin Avatar" className="rounded-full" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cài đặt</DropdownMenuItem>
              <DropdownMenuItem>Hỗ trợ</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50/50">
            {children}
        </main>
      </div>
    </div>
  );
}
