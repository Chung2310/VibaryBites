import { Skeleton } from '@/components/ui/skeleton';
export default function AdminLoading() {
  return <div role="status" aria-live="polite" className="space-y-6">
    <span className="sr-only">Đang tải trang quản trị…</span>
    <Skeleton className="h-8 w-56" />
    <div className="rounded-xl border bg-background p-6">
      <Skeleton className="mb-6 h-10 w-48" />
      <div className="space-y-4">{[0, 1, 2, 3, 4].map(row => <Skeleton key={row} className="h-12 w-full" />)}</div>
    </div>
  </div>;
}
