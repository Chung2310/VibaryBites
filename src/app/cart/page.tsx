'use client';
import dynamic from 'next/dynamic';
import { ContentLoading } from '@/components/content-loading';
const PageContent = dynamic(() => import('./page-content'), {
  loading: () => <div className="container mx-auto max-w-7xl px-4 py-12"><ContentLoading /></div>,
});
export default function Page() { return <PageContent />; }
