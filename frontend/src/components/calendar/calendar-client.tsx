"use client";

import dynamic from "next/dynamic";

// Client-side-only dynamic import — prevents SSR hydration and resolves
// FullCalendar 6.x + React 19 flushSync lifecycle incompatibility
const CalendarWorkspace = dynamic(
  () => import("@/components/calendar/calendar-workspace").then((m) => ({ default: m.CalendarWorkspace })),
  { ssr: false },
);

type CalendarClientProps = {
  scope?: "personal" | "group";
  groupName?: string;
  groupId?: string;
};

export function CalendarClient({ scope, groupName, groupId }: CalendarClientProps) {
  return <CalendarWorkspace scope={scope} groupName={groupName} groupId={groupId} />;
}
