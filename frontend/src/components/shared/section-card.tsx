import { cn } from "@/lib/utils";

export function SectionCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm", className)}>{children}</section>;
}
