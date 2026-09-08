'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
export function MobileNavigation({ links, onClose }: { links: { href: string; label: string }[]; onClose: () => void }) {
 const pathname = usePathname();
 return <Sheet open onOpenChange={open => { if (!open) onClose(); }}>
  <SheetContent side="left" className="overflow-y-auto p-0">
   <SheetHeader className="border-b p-6"><SheetTitle className="text-left font-headline text-2xl font-bold tracking-widest">VIBARY</SheetTitle></SheetHeader>
   <SheetDescription className="sr-only">Điều hướng cửa hàng VIBARY</SheetDescription>
   <nav className="flex flex-col gap-4 p-6">{links.map(link => {
    const active = pathname === link.href || pathname.startsWith(link.href + '/');
    return <Link key={link.href} href={link.href} prefetch={true} onClick={onClose} aria-current={active ? 'page' : undefined} className={cn('text-lg font-medium', active ? 'text-foreground underline' : 'text-muted-foreground')}>{link.label}</Link>;
   })}</nav>
  </SheetContent>
 </Sheet>;
}
