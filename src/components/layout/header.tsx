
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAppStore } from "@/hooks/use-app-store";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

const leftNavLinks = [
    { href: '/products', label: 'SẢN PHẨM' },
    { href: '/how-to-buy', label: 'CÁCH MUA' },
    { href: '/about', label: 'VỀ VIBARY' },
]

const rightNavLinks = [
    { href: '/faq', label: 'HỎI ĐÁP' },
    { href: '/news', label: 'TIN MỚI' },
]

export function Header() {
  const { cartCount } = useAppStore();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = pathname === '/';

  const isLinkActive = (href: string) => {
    if (href === '/products') {
      return pathname.startsWith(href);
    }
    return pathname === href;
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300 h-20",
      isHomePage && !isScrolled ? "bg-black/10 backdrop-blur-sm border-transparent" : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
    )}>
      <div className="container mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Desktop Left Nav */}
        <nav className="hidden items-center gap-6 md:flex flex-1">
          {leftNavLinks.map(link => (
            <Link
                key={link.href}
                href={link.href}
                data-active={isLinkActive(link.href)}
                className={cn(
                  "text-xs font-body uppercase tracking-widest transition-all hover:opacity-70 py-2 px-3 rounded-full",
                  isHomePage && !isScrolled ? "text-white" : "text-black",
                  isLinkActive(link.href) && (isHomePage && !isScrolled ? "border border-white" : "border border-black")
                )}
            >
                {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Logo Center */}
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center gap-3">
             <Image src="/logo.png" alt="Vibary Logo" width={36} height={36} className={cn(isHomePage && !isScrolled && "brightness-0 invert")} />
            <span className={cn(
              "font-headline text-3xl font-bold tracking-[0.2em]",
              isHomePage && !isScrolled ? "text-white" : "text-foreground"
            )}>
              VIBARY
            </span>
          </Link>
        </div>

        {/* Desktop Right Nav + Cart */}
        <div className="flex items-center justify-end gap-4 flex-1">
          <nav className="hidden items-center gap-6 md:flex">
             {rightNavLinks.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    data-active={isLinkActive(link.href)}
                    className={cn(
                      "text-xs font-body uppercase tracking-widest transition-all hover:opacity-70 py-2 px-3 rounded-full",
                      isHomePage && !isScrolled ? "text-white" : "text-black",
                      isLinkActive(link.href) && (isHomePage && !isScrolled ? "border border-white" : "border border-black")
                    )}
                >
                    {link.label}
                </Link>
             ))}
          </nav>
          
          <Link href="/cart" className={cn(
            "relative flex items-center gap-1 text-xs font-body uppercase tracking-widest transition-colors hover:opacity-70",
            isHomePage && !isScrolled ? "text-white" : "text-black"
          )}>
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden md:inline">GIỎ</span>
            {isClient && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className={cn("md:hidden border-none bg-transparent", isHomePage && !isScrolled && "text-white")}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Chuyển đổi menu điều hướng</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
               <SheetHeader className="p-6 border-b">
                <SheetTitle className="sr-only">Menu Điều Hướng</SheetTitle>
                <Link href="/" className="flex items-center gap-2">
                   <Image src="/logo.png" alt="Vibary Logo" width={32} height={32} />
                   <span className="font-headline text-2xl font-bold tracking-widest">
                    VIBARY
                  </span>
                </Link>
              </SheetHeader>
              <div className="flex flex-col gap-6 p-6">
                <nav className="flex flex-col gap-4">
                  {[...leftNavLinks, ...rightNavLinks].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
