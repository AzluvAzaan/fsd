export type CalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  tone?: "default" | "highlight" | "muted";
  group?: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  members: number;
  role: string;
  nextWindow: string;
  accent: string;
};

export type AvailabilitySlot = {
  id: string;
  date: string;
  time: string;
  confidence: string;
  participants: string[];
  note: string;
};

export type RequestItem = {
  id: string;
  title: string;
  type: "received" | "sent";
  group: string;
  proposedTime: string;
  status: "pending" | "accepted" | "declined";
  from: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export type IntegrationItem = {
  id: string;
  name: string;
  status: string;
  description: string;
  actionLabel: string;
};

export const personalEvents: CalendarEvent[] = [
  { id: "ev1", title: "Product Strategy Sync", startAt: "2026-03-16T09:00:00", endAt: "2026-03-16T10:30:00", tone: "highlight" },
  { id: "ev2", title: "Morning Coffee", startAt: "2026-03-19T09:00:00", endAt: "2026-03-19T10:00:00", tone: "default" },
  { id: "ev3", title: "Deep Work Block", startAt: "2026-03-19T10:30:00", endAt: "2026-03-19T12:30:00", tone: "default" },
  { id: "ev4", title: "Team Sync", startAt: "2026-03-19T14:00:00", endAt: "2026-03-19T15:00:00", tone: "highlight", group: "FSD Core" },
];

export const todayAgenda = [
  { title: "Morning Coffee", time: "09:00 AM - 10:00 AM" },
  { title: "Deep Work Block", time: "10:30 AM - 12:30 PM" },
  { title: "Team Sync", time: "02:00 PM - 03:00 PM", highlight: true },
];

export const groups: Group[] = [
  { id: "fsd-core", name: "FSD Core", description: "Main product and implementation team for Free Slot Detector.", members: 5, role: "Owner", nextWindow: "Best overlap: Tue 2:00 PM", accent: "from-violet-500 to-indigo-500" },
  { id: "capstone", name: "Capstone Crew", description: "Academic coordination and milestone planning group.", members: 4, role: "Member", nextWindow: "Best overlap: Wed 11:00 AM", accent: "from-fuchsia-500 to-violet-500" },
  { id: "weekend-plans", name: "Weekend Plans", description: "Casual availability planning for social meetups.", members: 6, role: "Member", nextWindow: "Best overlap: Sat 4:00 PM", accent: "from-indigo-500 to-sky-500" },
];

export const groupMembers = [
  { name: "Azluv", role: "Owner", availability: "High overlap this week" },
  { name: "Sarah", role: "Member", availability: "Free Tue / Thu afternoons" },
  { name: "Ryan", role: "Member", availability: "Busy mornings, open after 2 PM" },
  { name: "Iman", role: "Member", availability: "Mostly free Wed / Fri" },
  { name: "Jia", role: "Member", availability: "Open Tue noon onward" },
];

export const availabilitySlots: AvailabilitySlot[] = [
  { id: "slot-1", date: "Tuesday, Mar 17", time: "2:00 PM - 3:00 PM", confidence: "Best overlap", participants: ["Azluv", "Sarah", "Ryan", "Iman"], note: "4/5 members free; ideal for product sync." },
  { id: "slot-2", date: "Wednesday, Mar 18", time: "11:00 AM - 12:00 PM", confidence: "Good overlap", participants: ["Azluv", "Ryan", "Iman"], note: "3/5 members free; lighter coordination slot." },
  { id: "slot-3", date: "Thursday, Mar 19", time: "4:00 PM - 5:30 PM", confidence: "Strong overlap", participants: ["Azluv", "Sarah", "Jia", "Iman"], note: "4/5 members free; good for longer discussion." },
];

export const requests: RequestItem[] = [
  { id: "req-1", title: "Sprint planning", type: "received", group: "FSD Core", proposedTime: "Tue, Mar 17 · 2:00 PM", status: "pending", from: "Sarah" },
  { id: "req-2", title: "Capstone review", type: "sent", group: "Capstone Crew", proposedTime: "Wed, Mar 18 · 11:00 AM", status: "pending", from: "Azluv" },
  { id: "req-3", title: "Weekend meetup", type: "received", group: "Weekend Plans", proposedTime: "Sat, Mar 21 · 4:00 PM", status: "accepted", from: "Ryan" },
];

export const notifications: NotificationItem[] = [
  { id: "noti-1", title: "New event request received", body: "Sarah proposed a sprint planning session for FSD Core.", time: "5 min ago", unread: true },
  { id: "noti-2", title: "Availability updated", body: "Shared free slot results were refreshed for Capstone Crew.", time: "1 hr ago", unread: true },
  { id: "noti-3", title: "Google Calendar sync pending", body: "Reconnect Google to keep your calendar current.", time: "Yesterday", unread: false },
];

export const integrations: IntegrationItem[] = [
  { id: "google-calendar", name: "Google Calendar", status: "Planned integration", description: "Primary sync source for pulling busy slots and publishing accepted events.", actionLabel: "Connect later" },
  { id: "gmail-auth", name: "Google Sign-In", status: "Backend scaffold exists", description: "Will power account login and session onboarding once the auth flow is completed.", actionLabel: "Prepare flow" },
  { id: "text-parser", name: "Quick Add Parser", status: "Future enhancement", description: "Natural language event creation once parser and event routes are ready.", actionLabel: "Design later" },
];
