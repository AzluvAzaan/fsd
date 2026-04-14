"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Users } from "lucide-react";

import { getGroupById, getGroupMembers, getUserById, type ApiGroup, type ApiGroupMember, type User } from "@/lib/api";
import { SectionCard } from "@/components/shared/section-card";

const ACCENTS = [
  "from-violet-500 to-indigo-500",
  "from-fuchsia-500 to-violet-500",
  "from-indigo-500 to-sky-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
];

const AVATAR_COLORS = ["#7c3aed", "#db2777", "#2563eb", "#059669", "#d97706"];

type MemberWithUser = ApiGroupMember & { user: User | null };

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();

  const [group, setGroup] = useState<ApiGroup | null>(null);
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [g, rawMembers] = await Promise.all([
          getGroupById(groupId),
          getGroupMembers(groupId),
        ]);
        setGroup(g);

        // Enrich members with user details (in parallel)
        const enriched = await Promise.all(
          rawMembers.map(async (m) => {
            try {
              const user = await getUserById(m.userId);
              return { ...m, user };
            } catch {
              return { ...m, user: null };
            }
          }),
        );
        setMembers(enriched);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load group");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [groupId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-48 animate-pulse rounded-[2rem] border border-border/70 bg-card" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-[2rem] border border-border/70 bg-card" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/50 py-24 text-center">
        <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <Users className="size-6" />
        </div>
        <p className="text-lg font-semibold">Group not found</p>
        <p className="mt-2 text-sm text-muted-foreground">{error ?? "This group does not exist."}</p>
        <Link
          href="/app/groups"
          className="mt-6 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Back to groups
        </Link>
      </div>
    );
  }

  // Derive a stable accent from the group ID
  const accentIndex = group.id.charCodeAt(0) % ACCENTS.length;
  const accent = ACCENTS[accentIndex];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Link
            href="/app/groups"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All groups
          </Link>
          <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${accent}`} />
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.1rem]">{group.name}</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Invite code: <span className="font-mono">{group.inviteCode}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/app/groups/${group.id}/calendar`}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <CalendarDays className="size-4" />
            Calendar
          </Link>
          <Link
            href={`/app/groups/${group.id}/availability`}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Clock className="size-4" />
            Find free time
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Members</p>
          <p className="mt-2 text-2xl font-semibold">{members.length}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Created</p>
          <p className="mt-2 text-base font-semibold">
            {new Date(group.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </SectionCard>
      </div>

      {/* Members list */}
      <SectionCard>
        <h2 className="text-lg font-semibold">Members</h2>
        <div className="mt-4 space-y-2">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            members.map((member, i) => {
              const isOwner = member.userId === group.createdById;
              const displayName = member.user?.displayName ?? member.user?.email ?? member.userId;
              const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const initial = displayName[0]?.toUpperCase() ?? "?";

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-5 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)` }}
                    >
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isOwner ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isOwner ? "Owner" : "Member"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>
    </div>
  );
}
