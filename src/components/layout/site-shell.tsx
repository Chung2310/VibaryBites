'use client';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { AppProvider } from '@/hooks/use-app-store';
import { Toaster } from '@/components/ui/toaster';
export function SiteShell({ children }: { children: React.ReactNode }) {
  const isAdmin = usePathname().startsWith('/admin');
  return <AppProvider><div className="relative flex min-h-dvh flex-col bg-background">
    {!isAdmin && <Header />}
    <div className="flex-grow">{children}</div>
    {!isAdmin && <Footer />}
  </div><Toaster /></AppProvider>;
}
