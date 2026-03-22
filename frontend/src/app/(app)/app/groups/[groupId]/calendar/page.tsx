import { notFound } from "next/navigation";

import { CalendarBoard } from "@/components/calendar/calendar-board";
import { PageHeader } from "@/components/shared/page-header";
import { groups } from "@/lib/constants/mock-data";

export default async function GroupCalendarPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = groups.find((item) => item.id === groupId);
  if (!group) notFound();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Group calendar" title={`${group.name} calendar`} description="Mock merged-calendar view for design and navigation work. Later this should be powered by the group/calendar endpoints." />
      <CalendarBoard />
    </div>
  );
}
