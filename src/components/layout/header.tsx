
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


const mainNavLinks = [
    { href: '/products', label: 'SẢN PHẨM' },
    { href: '/how-to-buy', label: 'CÁCH MUA' },
    { href: '/about', label: 'VỀ VIBARY' },
]

const secondaryNavLinks = [
    { href: '/faq', label: 'HỎI ĐÁP' },
    { href: '/news', label: 'TIN MỚI' },
]

export function Header() {
  const { cartCount } = useAppStore();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const isLinkActive = (href: string) => {
    // For `/products`, we want to match sub-paths as well.
    if (href === '/products') {
      return pathname.startsWith(href);
    }
    // For all other links, we want an exact match.
    return pathname === href;
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-20">
      <div className="container mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav className="hidden items-center gap-6 md:flex">
          {mainNavLinks.map(link => {
            const isActive = isLinkActive(link.href);
            return (
              <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  data-active={isActive}
                  className="text-sm font-body uppercase tracking-wider text-black transition-all hover:text-black/70 py-2 px-3 rounded-full data-[active=true]:border data-[active=true]:border-black"
              >
                  {link.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="flex items-center justify-center flex-1 md:flex-none">
          <Link href="/" className="flex items-center gap-3">
             <Image src="/logo.png" alt="Vibary Logo" width={36} height={36} />
            <span className="font-headline text-3xl font-bold tracking-widest text-foreground">
              VIBARY
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-6 md:flex">
             {secondaryNavLinks.map(link => {
                const isActive = isLinkActive(link.href);
                return (
                    <Link
                        key={`${link.href}-${link.label}`}
                        href={link.href}
                        data-active={isActive}
                        className="text-sm font-body uppercase tracking-wider text-black transition-all hover:text-black/70 py-2 px-3 rounded-full data-[active=true]:border data-[active=true]:border-black"
                    >
                        {link.label}
                    </Link>
                )
             })}
          </nav>
          <Link href="/cart" className="relative flex items-center gap-1 text-sm font-body uppercase tracking-wider text-black transition-colors hover:text-black/70">
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden md:inline">GIỎ</span>
            {isClient && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {cartCount}
              </span>
            )}
            <span className="sr-only">Giỏ hàng</span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Chuyển đổi menu điều hướng</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <SheetHeader>
                <SheetTitle className="sr-only">Menu Điều Hướng</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6">
                <Link href="/" className="flex items-center gap-2">
                   <Image src="/logo.png" alt="Vibary Logo" width={36} height={36} />
                   <span className="font-headline text-2xl font-bold tracking-widest">
                    VIBARY
                  </span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {[...mainNavLinks, ...secondaryNavLinks].map((link) => (
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
    </>
  );
}
