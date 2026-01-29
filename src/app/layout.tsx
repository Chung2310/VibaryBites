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
import React, { useMemo } from "react";
import { FirebaseProvider, initializeFirebaseClient } from "@/firebase";

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
  const { firebaseApp, auth, firestore } = useMemo(() => initializeFirebaseClient(), []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
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

  return (
    <>
      <div className="relative flex min-h-dvh flex-col bg-background">
        {!isAdminPage && <Header />}
        {!isAdminPage && !isProductPage && !isHomePage && (
          <div className="sticky top-20 z-40">
            <AnnouncementBar />
          </div>
        )}
        <main className="relative z-10 bg-background">{children}</main>
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
