import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

import { groupMembers, groups } from "@/lib/constants/mock-data";
import { SectionCard } from "@/components/shared/section-card";
import { cn } from "@/lib/utils";

export default async function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = groups.find((item) => item.id === groupId);
  if (!group) notFound();

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
          <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${group.accent}`} />
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.1rem]">{group.name}</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{group.description}</p>
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
      <div className="grid gap-4 sm:grid-cols-3">
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Your role</p>
          <p className="mt-2 text-2xl font-semibold">{group.role}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Members</p>
          <p className="mt-2 text-2xl font-semibold">{group.members}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Best overlap</p>
          <p className="mt-2 text-base font-semibold">{group.nextWindow}</p>
        </SectionCard>
      </div>

      {/* Members list */}
      <SectionCard>
        <h2 className="text-lg font-semibold">Members</h2>
        <div className="mt-4 space-y-2">
          {groupMembers.map((member) => (
            <div
              key={member.name}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-5 py-3.5"
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}99)` }}
                >
                  {member.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{member.availability}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
