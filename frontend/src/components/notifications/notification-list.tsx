import type { NotificationItem } from "@/lib/constants/mock-data";
import { notifications } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type NotificationListProps = {
  items?: NotificationItem[];
  selectedNotificationId?: string;
  onSelect?: (notificationId: string) => void;
  onMarkRead?: (notificationId: string) => void;
};

export function NotificationList({
  items = notifications,
  selectedNotificationId,
  onSelect,
  onMarkRead,
}: NotificationListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "rounded-3xl border border-border/70 bg-card p-5 shadow-sm",
            selectedNotificationId === item.id && "border-primary/30 bg-primary/5 shadow-primary/10",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {item.unread ? <span className="size-2 rounded-full bg-primary" /> : null}
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{item.body}</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{item.time}</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
            <button type="button" onClick={() => onSelect?.(item.id)} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
              Open
            </button>
            {item.unread ? (
              <button type="button" onClick={() => onMarkRead?.(item.id)} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Mark read
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
