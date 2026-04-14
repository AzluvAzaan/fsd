"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { CalendarClient } from "@/components/calendar/calendar-client";
import { getGroupById, type ApiGroup } from "@/lib/api";

export default function GroupCalendarPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<ApiGroup | null>(null);

  useEffect(() => {
    getGroupById(groupId).then(setGroup).catch(() => null);
  }, [groupId]);

  return <CalendarClient scope="group" groupName={group?.name} />;
}
