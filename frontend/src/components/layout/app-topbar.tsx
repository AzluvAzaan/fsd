import { Bell, Search, Settings2 } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AppTopbar() {
  return (
    <header className="border-b border-border/70 bg-background/85 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-muted-foreground xl:w-[420px]">
          <Search className="size-4" />
          <span className="text-sm">Search events, groups, or requests...</span>
        </div>
        <div className="flex items-center gap-3 self-end xl:self-auto">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground">
            <Bell className="size-4" />
          </button>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground">
            <Settings2 className="size-4" />
          </button>
          <ThemeToggle />
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-2 py-1.5">
            <div className="size-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500" />
            <div className="pr-2">
              <p className="text-sm font-medium">Azluv</p>
              <p className="text-xs text-muted-foreground">Owner</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
