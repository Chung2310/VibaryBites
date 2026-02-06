'use client';

import type { Metadata } from "next";
import { Playfair_Display, Fraunces, Lexend } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AppProvider } from "@/hooks/use-app-store";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import React, { useMemo, useState, useEffect } from "react";
import { FirebaseProvider, initializeFirebaseClient } from "@/firebase";
import { FirebaseStorage } from "firebase/storage";
import { AnimatePresence } from "framer-motion";
import { Preloader } from "@/components/preloader";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-headline",
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-body',
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

function AppProviders({ children }: { children: React.ReactNode }) {
  const { firebaseApp, auth, firestore, storage } = useMemo(() => initializeFirebaseClient(), []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
      storage={storage} // Pass storage here
    >
      <AppProvider>
        <LayoutContent>{children}</LayoutContent>
      </AppProvider>
    </FirebaseProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isProductPage = pathname.startsWith('/products');
  const isHomePage = pathname === '/';
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only once on the client
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = 'visible';
    }, 2500); // Duration of the preloader

    // Prevent scrolling while preloader is active
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'visible'; // Ensure scroll is re-enabled on unmount
    };
  }, []);


  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader />}
      </AnimatePresence>
      <div className="relative flex min-h-dvh flex-col bg-background">
        {!isAdminPage && <Header />}
        <div className="flex-grow">
          {children}
        </div>
        {!isAdminPage && <Footer />}
      </div>
      <Toaster />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <title>VIBARY - Bánh ngọt Pháp hiện đại</title>
        <meta name="description" content="Bánh Entremet thanh lịch tại Bắc Ninh, làm từ trái cây Việt Nam theo mùa." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Lexend:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          playfair.variable,
          fraunces.variable,
          lexend.variable
        )}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
