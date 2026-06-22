import { cn } from '@/lib/utils';

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function PremiumCard({ children, className, hoverable = true, ...props }: PremiumCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1526]/95 p-5 transition-all duration-300",
        hoverable && "hover:border-[#7c3aed]/40 hover:shadow-[0_0_0_1px_rgba(124,58,237,0.2),0_20px_60px_-15px_rgba(0,0,0,0.6)] hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {/* Subtle top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7c3aed]/30 to-transparent" />
      {children}
    </div>
  );
}
