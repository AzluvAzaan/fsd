import { NotificationList } from "@/components/notifications/notification-list";
import { PageHeader } from "@/components/shared/page-header";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Inbox" title="Notifications" description="A clean feed for system updates, request changes, and integration prompts. Powered by mock data until notification routes are implemented." />
      <NotificationList />
    </div>
  );
}
