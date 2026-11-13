export function PostSkeleton() {
  return (
    <div className="flex gap-3 border-b border-line px-4 py-4" aria-hidden="true">
      <div className="size-10 shrink-0 rounded-full bg-blush" />
      <div className="flex-1 space-y-2.5 pt-1">
        <div className="flex gap-2">
          <div className="h-3 w-24 rounded bg-skeleton" />
          <div className="h-3 w-14 rounded bg-skeleton/70" />
        </div>
        <div className="h-3 w-full rounded bg-skeleton" />
        <div className="h-3 w-4/5 rounded bg-skeleton" />
        <div className="h-3 w-1/2 rounded bg-skeleton" />
      </div>
    </div>
  );
}
