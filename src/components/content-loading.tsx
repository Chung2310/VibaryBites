import { Skeleton } from '@/components/ui/skeleton';
export function ContentLoading() {
  return <div role="status" aria-live="polite" className="min-h-64 space-y-5 rounded-xl border bg-background p-6">
    <span className="sr-only">Đang tải nội dung…</span>
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-24 w-full" />
  </div>;
}
