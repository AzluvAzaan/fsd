export type CalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  tone?: "default" | "highlight" | "muted";
  group?: string;
  memberName?: string;
};

export type GroupMember = {
  name: string;
  role: string;
  availability: string;
  color: string;
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

export const groupMembers: GroupMember[] = [
  { name: "Azluv", role: "Owner", availability: "High overlap this week", color: "#7c3aed" },
  { name: "Sarah", role: "Member", availability: "Free Tue / Thu afternoons", color: "#c026d3" },
  { name: "Ryan", role: "Member", availability: "Busy mornings, open after 2 PM", color: "#0284c7" },
  { name: "Iman", role: "Member", availability: "Mostly free Wed / Fri", color: "#16a34a" },
  { name: "Jia", role: "Member", availability: "Open Tue noon onward", color: "#d97706" },
];

// Per-member event schedules used by the group calendar view
export const memberSchedules: Record<string, CalendarEvent[]> = {
  "Azluv": [
    { id: "az-1", title: "Planning Sync", startAt: "2026-03-16T09:00:00", endAt: "2026-03-16T10:00:00", tone: "highlight" },
    { id: "az-2", title: "Focus Block", startAt: "2026-03-18T13:00:00", endAt: "2026-03-18T15:00:00", tone: "muted" },
    { id: "az-3", title: "Shared Team Sync", startAt: "2026-03-19T14:00:00", endAt: "2026-03-19T15:30:00", tone: "highlight" },
    { id: "az-4", title: "Client Review", startAt: "2026-03-20T16:00:00", endAt: "2026-03-20T17:00:00" },
    { id: "az-5", title: "Retro Prep", startAt: "2026-03-23T10:00:00", endAt: "2026-03-23T11:00:00" },
    { id: "az-6", title: "Availability Review", startAt: "2026-03-24T14:00:00", endAt: "2026-03-24T15:00:00", tone: "highlight" },
  ],
  "Sarah": [
    { id: "sa-1", title: "Engineering Review", startAt: "2026-03-17T11:00:00", endAt: "2026-03-17T12:30:00", tone: "highlight" },
    { id: "sa-2", title: "Client Call", startAt: "2026-03-17T14:00:00", endAt: "2026-03-17T15:00:00" },
    { id: "sa-3", title: "Shared Team Sync", startAt: "2026-03-19T14:00:00", endAt: "2026-03-19T15:30:00", tone: "highlight" },
    { id: "sa-4", title: "Morning Standup", startAt: "2026-03-20T09:00:00", endAt: "2026-03-20T09:30:00" },
    { id: "sa-5", title: "Sprint Review", startAt: "2026-03-23T14:00:00", endAt: "2026-03-23T15:30:00", tone: "highlight" },
    { id: "sa-6", title: "Async Feedback", startAt: "2026-03-26T09:00:00", endAt: "2026-03-26T11:00:00", tone: "muted" },
  ],
  "Ryan": [
    { id: "ry-1", title: "Design Handoff", startAt: "2026-03-17T09:00:00", endAt: "2026-03-17T10:00:00" },
    { id: "ry-2", title: "Engineering Review", startAt: "2026-03-17T11:00:00", endAt: "2026-03-17T12:30:00", tone: "highlight" },
    { id: "ry-3", title: "No-meeting Block", startAt: "2026-03-18T13:00:00", endAt: "2026-03-18T15:00:00", tone: "muted" },
    { id: "ry-4", title: "Shared Team Sync", startAt: "2026-03-19T14:00:00", endAt: "2026-03-19T15:30:00", tone: "highlight" },
    { id: "ry-5", title: "Focus Time", startAt: "2026-03-24T10:00:00", endAt: "2026-03-24T12:00:00", tone: "muted" },
  ],
  "Iman": [
    { id: "im-1", title: "Planning Sync", startAt: "2026-03-16T09:00:00", endAt: "2026-03-16T10:00:00", tone: "highlight" },
    { id: "im-2", title: "Research Block", startAt: "2026-03-18T10:00:00", endAt: "2026-03-18T12:00:00", tone: "muted" },
    { id: "im-3", title: "No-meeting Block", startAt: "2026-03-18T13:00:00", endAt: "2026-03-18T15:00:00", tone: "muted" },
    { id: "im-4", title: "Shared Team Sync", startAt: "2026-03-19T14:00:00", endAt: "2026-03-19T15:30:00", tone: "highlight" },
    { id: "im-5", title: "Docs Review", startAt: "2026-03-23T13:00:00", endAt: "2026-03-23T14:00:00" },
  ],
  "Jia": [
    { id: "ji-1", title: "Engineering Review", startAt: "2026-03-17T11:00:00", endAt: "2026-03-17T12:30:00", tone: "highlight" },
    { id: "ji-2", title: "User Testing", startAt: "2026-03-17T15:00:00", endAt: "2026-03-17T16:30:00" },
    { id: "ji-3", title: "Shared Team Sync", startAt: "2026-03-19T14:00:00", endAt: "2026-03-19T15:30:00", tone: "highlight" },
    { id: "ji-4", title: "Wrap-up", startAt: "2026-03-20T16:00:00", endAt: "2026-03-20T17:00:00" },
    { id: "ji-5", title: "Sync with PM", startAt: "2026-03-24T14:00:00", endAt: "2026-03-24T15:00:00" },
  ],
};

export const availabilitySlots: AvailabilitySlot[] = [
  { id: "slot-1", date: "Tuesday, Mar 17", time: "12:30 PM – 2:00 PM", confidence: "Perfect overlap", participants: ["Azluv", "Sarah", "Ryan", "Iman", "Jia"], note: "All 5 members free; best window this week." },
  { id: "slot-2", date: "Wednesday, Mar 18", time: "8:00 AM – 10:00 AM", confidence: "Good overlap", participants: ["Azluv", "Sarah", "Ryan", "Jia"], note: "4/5 members free; Iman has Research Block from 10." },
  { id: "slot-3", date: "Friday, Mar 20", time: "10:00 AM – 4:00 PM", confidence: "Strong overlap", participants: ["Azluv", "Sarah", "Ryan", "Iman", "Jia"], note: "All 5 members free; ideal for longer sessions." },
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
