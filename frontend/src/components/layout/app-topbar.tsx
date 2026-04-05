"use client";

import Link from "next/link";
import { Bell, Menu, Search, Settings2 } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";

type AppTopbarProps = {
  onToggleSidebar: () => void;
};

export function AppTopbar({ onToggleSidebar }: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b border-border/70 bg-background/90 px-4 backdrop-blur sm:px-6">
      <div className="flex w-full items-center justify-between gap-3">
        {/* Left: hamburger + search */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="size-4" />
          </button>
          <label className="flex min-w-0 max-w-[260px] flex-1 items-center gap-3 rounded-2xl border border-border/70 bg-card/90 px-4 py-2.5 text-muted-foreground shadow-sm sm:max-w-sm md:max-w-md xl:max-w-[430px]">
            <Search className="size-4 shrink-0" />
            <input
              type="search"
              placeholder="Search events, groups, or requests..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </label>
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-700/30 dark:bg-amber-950/40 dark:text-amber-400 sm:flex">
            <span className="size-1.5 animate-pulse rounded-full bg-amber-500 dark:bg-amber-400" />
            Dev mode
          </span>
          <Link
            href="/app/notifications"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Open notifications"
          >
            <Bell className="size-4" />
          </Link>
          <Link
            href="/app/settings"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Open settings"
          >
            <Settings2 className="size-4" />
          </Link>
          <ThemeToggle />
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-2 py-1.5 shadow-sm">
            <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-sm font-semibold text-white">
              A
            </div>
            <div className="pr-2 leading-tight">
              <p className="text-sm font-medium">Azluv</p>
              <p className="text-xs text-muted-foreground">Owner</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
