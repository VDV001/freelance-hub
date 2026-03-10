import { cn } from "@/lib/utils";

type BentoGridProps = {
  children: React.ReactNode;
  className?: string;
};

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {children}
    </div>
  );
}

type BentoCardProps = {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
};

export function BentoCard({ children, className, colSpan = 1, rowSpan = 1 }: BentoCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-border rounded-bento p-6 transition-all duration-300 hover:bg-bg-card-hover hover:border-border-hover hover:-translate-y-1",
        colSpan === 2 && "md:col-span-2",
        rowSpan === 2 && "md:row-span-2",
        className
      )}
    >
      {children}
    </div>
  );
}
