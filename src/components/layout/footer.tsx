'use client';

import Link from "next/link";
import { Instagram, Facebook, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from 'react';
import { cn } from "@/lib/utils";

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 4h-2.5A3.5 3.5 0 0 0 10 7.5v8.5a4 4 0 1 1-4-4V8.5" />
    </svg>
)

export const Footer = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <footer 
     className="bg-white text-center py-16 sm:py-24"
      ref={ref}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="space-y-4">
            <p className="text-sm tracking-widest uppercase">GỌI NGAY NẾU CẦN ĐẶT BÁNH GẤP BẠN NHÉ!</p>
            <Button asChild variant="outline" size="lg" className="rounded-none text-base tracking-wider">
                <a href="tel:0912550335">
                    <Phone className="mr-2 h-4 w-4" />
                    HOTLINE 091 255 03 35
                </a>
            </Button>
            <div className="flex justify-center items-center gap-2 text-muted-foreground mt-4 text-sm">
              <MapPin className="h-4 w-4 shrink-0" />
              <a
                href="https://www.google.com/maps/search/?api=1&query=Số+3+Nguyễn+Văn+Trỗi,+P.Ninh+Xá,+Bắc+Ninh,+Việt+Nam"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Số 3 Nguyễn Văn Trỗi, P.Ninh Xá, Bắc Ninh, Việt Nam
              </a>
            </div>
        </div>

        <div className="mt-12 space-y-4">
            <p className="text-sm tracking-widest uppercase">THEO DÕI VIBARY</p>
            <div className="flex justify-center gap-4">
                <Link href="https://www.facebook.com/profile.php?id=61576305638969" aria-label="Theo dõi Vibary trên Facebook" target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </Link>
                <Link href="https://www.instagram.com/tiembanhvibary/" aria-label="Theo dõi Vibary trên Instagram" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </Link>
                <Link href="https://www.tiktok.com/@vi_bary" aria-label="Theo dõi Vibary trên TikTok" target="_blank" rel="noopener noreferrer">
                   <TikTokIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </Link>
            </div>
        </div>

        <div className="mt-20 overflow-hidden">
            <p className="font-headline text-4xl text-gray-400 italic">Crafted to be shared</p>
            <h1 className="font-headline text-9xl md:text-[200px] font-bold tracking-widest mt-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 animate-shimmer bg-[length:200%_auto] leading-none">VIBARY</h1>
        </div>

        <div className="mt-20 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VIBARY. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';