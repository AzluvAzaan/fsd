"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";

import { AppLogo } from "@/components/layout/app-logo";
import { appNavItems } from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

type SidebarContentProps = {
  pathname: string;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

function SidebarContent({ pathname, onClose, collapsed = false, onToggleCollapse }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand row */}
      <div
        className={cn(
          "mb-8 shrink-0",
          collapsed ? "flex flex-col items-center gap-3" : "flex items-center gap-2",
        )}
      >
        {/* Logo link — flex-1 min-w-0 so it doesn't push the collapse button off-screen */}
        <Link
          href="/app/calendar"
          className={cn(
            "flex min-w-0 items-center rounded-3xl border border-transparent py-2",
            collapsed ? "gap-0 px-0" : "flex-1 gap-3 px-2",
          )}
        >
          <AppLogo size={44} />
          <div
            className={cn(
              "min-w-0 overflow-hidden transition-all duration-300 ease-in-out",
              collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100",
            )}
          >
            <p className="truncate text-2xl font-semibold tracking-tight">SyncUp</p>
          </div>
        </Link>

        {/* Desktop collapse toggle OR mobile close — always visible, shrink-0 */}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        ) : onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight
              className={cn("size-4 transition-transform duration-300", !collapsed && "rotate-180")}
            />
          </button>
        ) : null}
      </div>

      {/* Section label */}
      <div
        className={cn(
          "shrink-0 overflow-hidden px-2 transition-all duration-300 ease-in-out",
          collapsed ? "mb-0 max-h-0 opacity-0" : "mb-5 max-h-10 opacity-100",
        )}
      >
        <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Workspace
        </p>
      </div>

      {/* Nav */}
      <nav className={cn("space-y-1", collapsed && "flex flex-col items-center")}>
        {appNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-2xl transition-colors",
                collapsed ? "justify-center p-2.5" : "gap-3 px-4 py-3 text-sm font-medium",
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                  collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppSidebar({ mobileOpen = false, onMobileClose, collapsed = false, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-border/70 bg-sidebar/95 py-6 backdrop-blur lg:flex lg:flex-col",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-16 px-3" : "w-72 px-5",
        )}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {/* Mobile overlay */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-border/70 bg-sidebar/95 px-5 py-6 backdrop-blur",
          "transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent pathname={pathname} onClose={onMobileClose} />
      </aside>
    </>
  );
}
