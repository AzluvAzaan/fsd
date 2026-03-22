import Link from "next/link";

import { groups } from "@/lib/constants/mock-data";

export function GroupGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {groups.map((group) => (
        <Link key={group.id} href={`/app/groups/${group.id}`} className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className={`mb-5 h-2 w-28 rounded-full bg-gradient-to-r ${group.accent}`} />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{group.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{group.description}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{group.role}</span>
          </div>
          <div className="mt-6 flex items-center justify-between text-sm">
            <p className="text-muted-foreground">{group.members} members</p>
            <p className="font-medium text-foreground">{group.nextWindow}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
