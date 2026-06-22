import { Skeleton } from './Skeleton';

export function CarouselSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-[180px] flex-shrink-0 space-y-3">
            <Skeleton className="aspect-[2/3] w-full rounded-3xl" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
