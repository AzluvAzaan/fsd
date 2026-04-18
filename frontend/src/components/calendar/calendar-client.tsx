"use client";

import dynamic from "next/dynamic";
import type { CalendarRecommendedSlot } from "@/components/calendar/calendar-workspace";

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
  selectedUserIds?: string[];
  recommendedSlots?: CalendarRecommendedSlot[];
  selectedRecommendedSlotId?: string;
  onRecommendedSlotSelect?: (slotId: string) => void;
  initialDate?: string;
  hideGroupInsights?: boolean;
  hideGroupHeader?: boolean;
};

export function CalendarClient({
  scope,
  groupName,
  groupId,
  selectedUserIds,
  recommendedSlots,
  selectedRecommendedSlotId,
  onRecommendedSlotSelect,
  initialDate,
  hideGroupInsights,
  hideGroupHeader,
}: CalendarClientProps) {
  return (
    <CalendarWorkspace
      scope={scope}
      groupName={groupName}
      groupId={groupId}
      selectedUserIds={selectedUserIds}
      recommendedSlots={recommendedSlots}
      selectedRecommendedSlotId={selectedRecommendedSlotId}
      onRecommendedSlotSelect={onRecommendedSlotSelect}
      initialDate={initialDate}
      hideGroupInsights={hideGroupInsights}
      hideGroupHeader={hideGroupHeader}
    />
  );
}
