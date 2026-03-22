import { notFound } from "next/navigation";

import { SlotList } from "@/components/availability/slot-list";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { groups } from "@/lib/constants/mock-data";

export default async function GroupAvailabilityPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = groups.find((item) => item.id === groupId);
  if (!group) notFound();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Shared free slots" title={`${group.name} availability`} description="This page is intentionally built on mock slot data first. The UI can now evolve independently from the unfinished availability backend." />
      <SectionCard>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-primary/10 p-4"><p className="text-sm font-medium text-primary">Range</p><p className="mt-2 text-lg font-semibold">Oct 16 - Oct 20</p></div>
          <div className="rounded-2xl bg-muted/60 p-4"><p className="text-sm font-medium">Duration</p><p className="mt-2 text-lg font-semibold">60 minutes</p></div>
          <div className="rounded-2xl bg-muted/60 p-4"><p className="text-sm font-medium">Constraint</p><p className="mt-2 text-lg font-semibold">3+ people available</p></div>
        </div>
      </SectionCard>
      <SlotList />
    </div>
  );
}
