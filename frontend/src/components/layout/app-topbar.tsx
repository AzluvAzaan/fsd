import Link from "next/link";
import { Bell, Search, Settings2 } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/90 px-4 py-3 text-muted-foreground shadow-sm xl:w-[430px]">
          <Search className="size-4" />
          <input
            type="search"
            placeholder="Search events, groups, or requests..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </label>
        <div className="flex items-center gap-3 self-end xl:self-auto">
          <Link
            href="/app/notifications"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
            aria-label="Open notifications"
          >
            <Bell className="size-4" />
          </Link>
          <Link
            href="/app/settings"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
            aria-label="Open settings"
          >
            <Settings2 className="size-4" />
          </Link>
          <ThemeToggle />
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-2 py-1.5 shadow-sm">
            <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-sm font-semibold text-white">
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
