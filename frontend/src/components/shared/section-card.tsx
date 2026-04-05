import { cn } from "@/lib/utils";

export function SectionCard({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm", className)} style={style}>
      {children}
    </section>
  );
}
