import { Skeleton } from './Skeleton';

export function ModalSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Description */}
      <Skeleton className="h-4 w-3/4" />

      {/* Content blocks */}
      <div className="space-y-3 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Footer buttons */}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 flex-1 rounded-2xl" />
      </div>
    </div>
  );
}
