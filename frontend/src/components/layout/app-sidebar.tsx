"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { appNavItems } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-sidebar px-5 py-6 lg:flex lg:flex-col">
      <Link href="/app/calendar" className="mb-8 flex items-center gap-3 px-2">
        <div className="size-11 rounded-full bg-primary shadow-lg shadow-primary/20" />
        <div>
          <p className="text-2xl font-semibold tracking-tight">SyncUp</p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Collaborative Calendar</p>
        </div>
      </Link>
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
      <div className="mt-auto rounded-3xl border border-border/70 bg-card/80 p-4">
        <p className="text-sm font-medium">Mock data mode</p>
        <p className="mt-1 text-sm text-muted-foreground">All main pages currently run on a replaceable mock data layer, so frontend work can continue before the backend is ready.</p>
      </div>
    </aside>
  );
}
