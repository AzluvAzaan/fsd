"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  AvailabilityPlanner,
  type AvailabilityMemberOption,
} from "@/components/availability/availability-planner";
import {
  getGroupById,
  getGroupMembers,
  getUserById,
  type ApiGroup,
} from "@/lib/api";

export default function GroupAvailabilityPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<ApiGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<AvailabilityMemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [groupData, members] = await Promise.all([
          getGroupById(groupId),
          getGroupMembers(groupId),
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

        const normalizedMembers: AvailabilityMemberOption[] = members.map((member, index) => ({
          userId: member.userId,
          name: memberUsers[index]?.displayName ?? memberUsers[index]?.email ?? member.userId,
        }));

        setGroup(groupData);
        setGroupMembers(normalizedMembers);
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
      groupMembers={groupMembers}
      loading={loading}
      error={error}
    />
  );
}
