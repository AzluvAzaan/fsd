"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { appNavItems } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border/70 bg-sidebar/95 px-5 py-6 backdrop-blur lg:flex lg:flex-col">
      <Link href="/app/calendar" className="mb-8 flex items-center gap-3 rounded-3xl border border-transparent px-2 py-2">
        <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-indigo-400 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
          FS
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight">SyncUp</p>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Collaborative Calendar</p>
        </div>
      </Link>
      <div className="mb-5 px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Workspace</p>
      </div>
      <nav className="space-y-2">
        {appNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Mock data mode</p>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Active</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Main routes now use replaceable mock state so interaction work can continue while backend domains are still incomplete.
        </p>
      </div>
    </aside>
  );
}
