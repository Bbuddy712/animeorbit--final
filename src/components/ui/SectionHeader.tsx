import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, className, action }: SectionHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#f8fafc] sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[#94a3b8]">{subtitle}</p>
        )}
      </div>
      {action && <div className="mt-2 sm:mt-0">{action}</div>}
    </div>
  );
}
