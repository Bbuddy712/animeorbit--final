import { Skeleton } from './Skeleton';

export function SectionSkeleton({ title = true }: { title?: boolean }) {
  return (
    <div className="space-y-4">
      {title && <Skeleton className="h-7 w-48" />}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[2/3] w-full rounded-3xl" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
