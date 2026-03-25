import Link from "next/link";

import type { Group } from "@/lib/constants/mock-data";
import { groups } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type GroupGridProps = {
  items?: Group[];
  activeGroupId?: string;
  onSelect?: (groupId: string) => void;
};

export function GroupGrid({ items = groups, activeGroupId, onSelect }: GroupGridProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((group) => (
        <article
          key={group.id}
          className={cn(
            "rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
            activeGroupId === group.id && "border-primary/30 bg-primary/5 shadow-primary/10",
          )}
        >
          <button type="button" onClick={() => onSelect?.(group.id)} className="w-full text-left">
            <div className={`mb-5 h-2 w-28 rounded-full bg-gradient-to-r ${group.accent}`} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold tracking-tight">{group.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{group.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{group.role}</span>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3 text-sm">
              <p className="text-muted-foreground">{group.members} members</p>
              <p className="font-medium text-foreground">{group.nextWindow}</p>
            </div>
          </button>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
            <p className="text-sm text-muted-foreground">Overview, merged calendar, and availability tools are ready.</p>
            <Link href={`/app/groups/${group.id}`} className="text-sm font-semibold text-primary">
              Open
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
