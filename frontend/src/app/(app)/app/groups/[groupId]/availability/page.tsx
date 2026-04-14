"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AvailabilityPlanner } from "@/components/availability/availability-planner";
import {
  getGroupAvailability,
  getGroupById,
  getGroupMembers,
  getUserById,
  type ApiGroup,
} from "@/lib/api";

function formatDateLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTimeLabel(start: Date, end: Date) {
  return `${start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export default function GroupAvailabilityPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<ApiGroup | null>(null);
  const [groupMemberNames, setGroupMemberNames] = useState<string[]>([]);
  const [slots, setSlots] = useState<
    Array<{
      id: string;
      date: string;
      time: string;
      confidence: string;
      participants: string[];
      note: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [groupData, members, availability] = await Promise.all([
          getGroupById(groupId),
          getGroupMembers(groupId),
          getGroupAvailability(groupId),
        ]);

        const memberUsers = await Promise.all(
          members.map(async (member) => {
            try {
              return await getUserById(member.userId);
            } catch {
              return null;
            }
          }),
        );

        if (!active) return;

        const names = memberUsers
          .map((user, index) => user?.displayName ?? user?.email ?? members[index].userId)
          .filter(Boolean) as string[];

        const normalizedSlots = (availability.freeSlots ?? []).map((slot, index) => {
          const start = new Date(slot.startTime);
          const end = new Date(slot.endTime);
          const durationMin = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

          return {
            id: `free-${index}`,
            date: formatDateLabel(start),
            time: formatTimeLabel(start, end),
            confidence: "All members free",
            participants: names,
            note: `${names.length} participants available for ${durationMin} minutes.`,
          };
        });

        setGroup(groupData);
        setGroupMemberNames(names);
        setSlots(normalizedSlots);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load availability");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [groupId]);

  return (
    <AvailabilityPlanner
      groupId={groupId}
      groupName={group?.name}
      slots={slots}
      groupMemberNames={groupMemberNames}
      loading={loading}
      error={error}
    />
  );
}
