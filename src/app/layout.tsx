import type { Metadata } from 'next';
import { Playfair_Display, Fraunces, Lexend } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { SiteShell } from '@/components/layout/site-shell';
const playfair = Playfair_Display({ subsets: ['latin', 'vietnamese'], variable: '--font-headline', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin', 'vietnamese'], variable: '--font-fraunces', display: 'swap' });
const lexend = Lexend({ subsets: ['latin', 'vietnamese'], variable: '--font-body', display: 'swap' });
export const metadata: Metadata = {
  title: 'VIBARY - Bánh ngọt Pháp hiện đại',
  description: 'Bánh Entremet thanh lịch tại Bắc Ninh, làm từ trái cây Việt Nam theo mùa.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body className={cn('min-h-screen bg-background font-body antialiased', playfair.variable, fraunces.variable, lexend.variable)}><SiteShell>{children}</SiteShell></body></html>;
}
