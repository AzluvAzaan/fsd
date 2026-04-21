"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, LogOut, Menu, Search, Settings2 } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { clearStoredUser, getStoredUser, type StoredUser } from "@/lib/auth";

type AppTopbarProps = {
  onToggleSidebar: () => void;
};

export function AppTopbar({ onToggleSidebar }: AppTopbarProps) {
  const router = useRouter();
  const [user] = useState<StoredUser | null>(() => getStoredUser());

  function handleLogout() {
    clearStoredUser();
    router.push("/");
  }

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

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

          {user ? (
            /* Logged-in user pill with logout */
            <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-2 py-1.5 shadow-sm">
              <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="pr-1 leading-tight">
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
