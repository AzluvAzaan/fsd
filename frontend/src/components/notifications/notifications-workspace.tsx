"use client";

import { useState } from "react";

import { NotificationList } from "@/components/notifications/notification-list";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { notifications, type NotificationItem } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

export function NotificationsWorkspace() {
  const [items, setItems] = useState<NotificationItem[]>(notifications);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedNotificationId, setSelectedNotificationId] = useState(items[0]?.id ?? "");

  const filteredItems = items.filter((item) => filter === "all" || item.unread);
  const selectedNotification = filteredItems.find((item) => item.id === selectedNotificationId) ?? filteredItems[0];
  const unreadCount = items.filter((item) => item.unread).length;

  const markRead = (notificationId: string) => {
    setItems((current) => current.map((item) => (item.id === notificationId ? { ...item, unread: false } : item)));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="This feed now supports filtering and read-state updates in the frontend, which makes the route behave like a real inbox instead of a static mock list."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-full border border-border bg-card p-1">
              {(["all", "unread"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium capitalize",
                    filter === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setItems((current) => current.map((item) => ({ ...item, unread: false })))}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Mark all read
            </button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Unread</p>
          <p className="mt-3 text-3xl font-semibold">{unreadCount}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Visible items</p>
          <p className="mt-3 text-3xl font-semibold">{filteredItems.length}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Selected context</p>
          <p className="mt-3 text-base font-semibold">{selectedNotification?.title ?? "None selected"}</p>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <NotificationList
          items={filteredItems}
          selectedNotificationId={selectedNotification?.id}
          onSelect={setSelectedNotificationId}
          onMarkRead={markRead}
        />

        <SectionCard>
          <p className="text-sm font-medium text-muted-foreground">Notification detail</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{selectedNotification?.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {selectedNotification?.body ?? "Select a notification to view more context."}
          </p>

          {selectedNotification ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                <p className="mt-2 text-lg font-semibold">{selectedNotification.time}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">Read state</p>
                <p className="mt-2 text-lg font-semibold">{selectedNotification.unread ? "Unread" : "Read"}</p>
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </div>
  );
}
