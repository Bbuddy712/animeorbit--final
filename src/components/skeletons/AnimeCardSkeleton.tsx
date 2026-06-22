import { Skeleton } from './Skeleton';

export function AnimeCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[2/3] w-full rounded-3xl" />
      <div className="space-y-2 px-1">
        <Skeleton className="h-4 w-4/5" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
}
