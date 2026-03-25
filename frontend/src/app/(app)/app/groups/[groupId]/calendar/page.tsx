import { notFound } from "next/navigation";

import { CalendarClient } from "@/components/calendar/calendar-client";
import { groups } from "@/lib/constants/mock-data";

export default async function GroupCalendarPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = groups.find((item) => item.id === groupId);
  if (!group) notFound();

  return <CalendarClient scope="group" groupName={group.name} />;
}
