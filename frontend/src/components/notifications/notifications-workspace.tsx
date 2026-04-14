"use client";

import { useEffect, useState } from "react";
import { CheckCheck, ChevronDown } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { getNotifications, markNotificationRead, type ApiNotification } from "@/lib/api";
import { notifications as mockNotifications, type NotificationItem } from "@/lib/constants/mock-data";
import { getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

function formatNotificationType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSentAt(sentAt: string): string {
  const date = new Date(sentAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function apiNotifToUINotif(n: ApiNotification): NotificationItem {
  return {
    id: n.id,
    title: formatNotificationType(n.type),
    body: n.channel === "in_app"
      ? "In-app notification · " + formatSentAt(n.sentAt)
      : `Sent via ${n.channel} · ` + formatSentAt(n.sentAt),
    time: formatSentAt(n.sentAt),
    unread: true,
  };
}

export function NotificationsWorkspace() {
  const isLoggedIn = !!getStoredUser();

  const [mockItems, setMockItems] = useState<NotificationItem[]>(mockNotifications);
  const [liveItems, setLiveItems] = useState<NotificationItem[] | null>(null);
  const [loading, setLoading] = useState(isLoggedIn);

  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    getNotifications()
      .then((data) => {
        const mapped = data.map(apiNotifToUINotif);
        setLiveItems(mapped);
        setExpandedId(mapped[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const items = isLoggedIn ? (liveItems ?? []) : mockItems;
  const filteredItems = items.filter((item) => filter === "all" || item.unread);
  const unreadCount = items.filter((item) => item.unread).length;

  const markRead = async (id: string) => {
    if (isLoggedIn) {
      try {
        await markNotificationRead(id);
      } catch {
        // best-effort; update UI regardless
      }
      setLiveItems((current) =>
        current ? current.map((item) => (item.id === id ? { ...item, unread: false } : item)) : current,
      );
    } else {
      setMockItems((current) => current.map((item) => (item.id === id ? { ...item, unread: false } : item)));
    }
  };

  const markAllRead = async () => {
    if (isLoggedIn) {
      const unread = (liveItems ?? []).filter((n) => n.unread);
      await Promise.allSettled(unread.map((n) => markNotificationRead(n.id)));
      setLiveItems((current) => current ? current.map((item) => ({ ...item, unread: false })) : current);
    } else {
      setMockItems((current) => current.map((item) => ({ ...item, unread: false })));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inbox"
        title={
          unreadCount > 0
            ? `Notifications · ${unreadCount} unread`
            : "Notifications"
        }
        description="Stay updated on group activity, invites, and scheduling changes."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-border bg-card p-1">
              {(["all", "unread"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                    filter === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-[1.5rem] border border-border/70 bg-card" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/50 py-24 text-center">
          <p className="text-lg font-semibold">All caught up</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No {filter === "unread" ? "unread " : ""}notifications right now.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              onToggle={() => toggleExpand(item.id)}
              onMarkRead={() => markRead(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  item,
  expanded,
  onToggle,
  onMarkRead,
}: {
  item: NotificationItem;
  expanded: boolean;
  onToggle: () => void;
  onMarkRead: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-border/70 bg-card shadow-sm transition-shadow",
        expanded && "shadow-md",
        item.unread && "border-primary/20 bg-primary/[0.02]",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-6 py-4 text-left"
      >
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {item.unread ? (
            <span className="size-2 shrink-0 rounded-full bg-primary" />
          ) : (
            <span className="size-2 shrink-0" />
          )}
          <div className="min-w-0">
            <p className={cn("text-sm font-medium", item.unread ? "text-foreground" : "text-muted-foreground")}>
              {item.title}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <div className="border-t border-border/60 px-6 py-4">
          <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
          {item.unread && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onMarkRead}
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Mark as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
