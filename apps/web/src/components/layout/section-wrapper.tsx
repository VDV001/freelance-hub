import { cn } from "@/lib/utils";

type SectionWrapperProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

export function SectionWrapper({ id, children, className }: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("py-24 md:py-32 px-6 md:px-8 max-w-7xl mx-auto", className)}
    >
      {children}
    </section>
  );
}
