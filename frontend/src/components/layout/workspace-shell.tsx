"use client";

import { useState } from "react";

import { AppRightRail } from "@/components/layout/app-right-rail";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [railOpen, setRailOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex min-h-screen">
        <AppSidebar
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => {
            setSidebarCollapsed((v) => !v);
            // Let FullCalendar detect the new container width after the 300ms transition
            setTimeout(() => window.dispatchEvent(new Event("resize")), 320);
          }}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            onToggleRail={() => {
              setRailOpen((v) => !v);
              setTimeout(() => window.dispatchEvent(new Event("resize")), 320);
            }}
            railOpen={railOpen}
          />
          <div className="flex min-h-0 flex-1">
            <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
            <AppRightRail open={railOpen} onClose={() => setRailOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
