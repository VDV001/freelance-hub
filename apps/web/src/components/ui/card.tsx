import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-border rounded-card p-6",
        hover && "transition-all duration-300 hover:bg-bg-card-hover hover:border-border-hover hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}
