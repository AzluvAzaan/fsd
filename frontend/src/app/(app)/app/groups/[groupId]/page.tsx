import Link from "next/link";
import { notFound } from "next/navigation";

import { groupMembers, groups } from "@/lib/constants/mock-data";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default async function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = groups.find((item) => item.id === groupId);
  if (!group) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Group overview"
        title={group.name}
        description={group.description}
        actions={
          <>
            <Link href={`/app/groups/${group.id}/calendar`} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">Open calendar</Link>
            <Link href={`/app/groups/${group.id}/availability`} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Find free time</Link>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard>
          <h2 className="text-xl font-semibold">Members</h2>
          <div className="mt-5 space-y-3">
            {groupMembers.map((member) => (
              <div key={member.name} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 p-4">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <p className="text-sm text-muted-foreground">{member.availability}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard>
          <h2 className="text-xl font-semibold">Quick summary</h2>
          <div className="mt-5 space-y-4 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Role:</span> {group.role}</p>
            <p><span className="font-medium text-foreground">Members:</span> {group.members}</p>
            <p><span className="font-medium text-foreground">Best overlap:</span> {group.nextWindow}</p>
            <p>This page is ready to swap from mock data to real group details once the group repo + handlers are implemented.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
