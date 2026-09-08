export default function Loading() {
  return <div role="status" aria-live="polite" className="container mx-auto max-w-7xl px-4 py-12">
    <span className="sr-only">Đang tải trang…</span>
    <div className="h-8 w-48 rounded bg-muted animate-pulse motion-reduce:animate-none" />
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <div className="aspect-square rounded bg-muted animate-pulse motion-reduce:animate-none" />
      <div className="space-y-4"><div className="h-12 rounded bg-muted" /><div className="h-32 rounded bg-muted" /></div>
    </div>
  </div>;
}
