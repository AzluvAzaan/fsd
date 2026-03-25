import type { LucideIcon } from "lucide-react";
import { Bell, CalendarDays, FolderKanban, Link2, Settings2, Send } from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const appNavItems: AppNavItem[] = [
  { href: "/app/calendar", label: "Personal Calendar", icon: CalendarDays },
  { href: "/app/groups", label: "Groups", icon: FolderKanban },
  { href: "/app/requests", label: "Requests", icon: Send },
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  { href: "/app/integrations", label: "Integrations", icon: Link2 },
  { href: "/app/settings", label: "Settings", icon: Settings2 },
];
