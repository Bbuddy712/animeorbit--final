import { Skeleton } from './Skeleton';

export function HeroSkeleton() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center bg-[#030b18]">
      <div className="relative z-10 max-w-3xl px-6 text-center space-y-6">
        <Skeleton className="mx-auto h-8 w-64 rounded-full" />
        <Skeleton className="mx-auto h-16 w-[420px]" />
        <Skeleton className="mx-auto h-5 w-[380px]" />
        <div className="flex justify-center gap-4 pt-4">
          <Skeleton className="h-12 w-40 rounded-2xl" />
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
