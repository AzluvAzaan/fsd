import { ChevronLeft, ChevronRight } from "lucide-react";

import { CalendarBoard } from "@/components/calendar/calendar-board";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Personal workspace"
        title="October 12 – 18, 2023"
        description="Mocked calendar data for layout work now. Swap in real calendar queries later without changing the page structure."
        actions={
          <div className="flex items-center gap-2">
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"><ChevronLeft className="size-4" /></button>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"><ChevronRight className="size-4" /></button>
            <div className="rounded-full border border-border bg-card p-1 text-sm">
              <span className="rounded-full bg-primary px-4 py-1.5 text-primary-foreground">Week</span>
              <span className="px-4 py-1.5 text-muted-foreground">Month</span>
            </div>
          </div>
        }
      />
      <CalendarBoard />
      <SectionCard>
        <h2 className="text-xl font-semibold">Why this page is mocked first</h2>
        <p className="mt-2 text-sm text-muted-foreground">The calendar backend routes and repos are still scaffold-stage. Keeping this page on a clean mock data layer lets the UI, page composition, and interaction shape stabilize first.</p>
      </SectionCard>
    </div>
  );
}
