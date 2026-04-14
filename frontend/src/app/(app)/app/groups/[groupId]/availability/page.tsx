"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AvailabilityPlanner } from "@/components/availability/availability-planner";
import { getGroupById, type ApiGroup } from "@/lib/api";

export default function GroupAvailabilityPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<ApiGroup | null>(null);

  useEffect(() => {
    getGroupById(groupId).then(setGroup).catch(() => null);
  }, [groupId]);

  return <AvailabilityPlanner groupName={group?.name} />;
}
