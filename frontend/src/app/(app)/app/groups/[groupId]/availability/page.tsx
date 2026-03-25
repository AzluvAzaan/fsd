import { notFound } from "next/navigation";

import { AvailabilityPlanner } from "@/components/availability/availability-planner";
import { groups } from "@/lib/constants/mock-data";

export default async function GroupAvailabilityPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = groups.find((item) => item.id === groupId);
  if (!group) notFound();

  return <AvailabilityPlanner groupName={group.name} />;
}
