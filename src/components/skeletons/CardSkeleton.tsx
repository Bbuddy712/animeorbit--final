import { Skeleton } from './Skeleton';

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-[#0a1228]/95 p-3 ${className}`}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-14 w-14 rounded-3xl" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-2xl" />
        <Skeleton className="h-9 flex-1 rounded-2xl" />
      </div>
    </div>
  );
}
