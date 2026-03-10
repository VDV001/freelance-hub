import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
};

export function Button({ variant = "primary", size = "md", href, className, children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-card cursor-pointer";
  const variants = {
    primary: "bg-accent text-bg hover:bg-accent-hover shadow-lg shadow-accent/20",
    outline: "border border-border text-text-primary hover:border-accent hover:text-accent",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-card",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return <a href={href} className={classes}>{children}</a>;
  }

  return <button className={classes} {...props}>{children}</button>;
}
