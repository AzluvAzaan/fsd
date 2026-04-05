"use client";

import { useState } from "react";
import { CheckCheck, ChevronDown } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { notifications, type NotificationItem } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

export function NotificationsWorkspace() {
  const [items, setItems] = useState<NotificationItem[]>(notifications);
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id ?? null);

  const filteredItems = items.filter((item) => filter === "all" || item.unread);
  const unreadCount = items.filter((item) => item.unread).length;

  const markRead = (id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, unread: false } : item)));
  };

  const markAllRead = () => {
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
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

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/50 py-24 text-center">
          <p className="text-lg font-semibold">All caught up</p>
          <p className="mt-2 text-sm text-muted-foreground">No {filter === "unread" ? "unread " : ""}notifications right now.</p>
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
      {/* Row header — always visible */}
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

      {/* Expanded body */}
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
