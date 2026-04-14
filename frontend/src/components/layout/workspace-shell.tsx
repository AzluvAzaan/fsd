"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { clearStoredUser, getStoredUser } from "@/lib/auth";
import { getUserById } from "@/lib/api";

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    getUserById(user.id)
      .then(() => setVerified(true))
      .catch(() => {
        clearStoredUser();
        router.replace("/login");
      });
  }, [router]);

  if (!verified) return null;

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
            setTimeout(() => window.dispatchEvent(new Event("resize")), 320);
          }}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
