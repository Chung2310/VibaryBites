'use client';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
const Header = dynamic(() => import('./header').then(module => module.Header), { loading: () => <div className="h-20 border-b" /> });
const Footer = dynamic(() => import('./footer').then(module => module.Footer));
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
