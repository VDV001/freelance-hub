import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "info" | "accent";
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-bg-card text-text-secondary border-border",
    success: "bg-success/10 text-success border-success/20",
    info: "bg-info/10 text-info border-info/20",
    accent: "bg-accent/10 text-accent border-accent/20",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full border", variants[variant], className)}>
      {children}
    </span>
  );
}
