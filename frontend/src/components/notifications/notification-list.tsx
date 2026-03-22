import { notifications } from "@/lib/constants/mock-data";

export function NotificationList() {
  return (
    <div className="space-y-4">
      {notifications.map((item) => (
        <div key={item.id} className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {item.unread ? <span className="size-2 rounded-full bg-primary" /> : null}
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
