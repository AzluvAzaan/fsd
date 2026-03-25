"use client";

import { useMemo, useState } from "react";

import { SlotList } from "@/components/availability/slot-list";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { availabilitySlots } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type AvailabilityPlannerProps = {
  groupName: string;
};

const durations = ["30 min", "60 min", "90 min"] as const;
const ranges = ["This week", "Next 7 days", "Next 2 weeks"] as const;

export function AvailabilityPlanner({ groupName }: AvailabilityPlannerProps) {
  const [selectedRange, setSelectedRange] = useState<(typeof ranges)[number]>("This week");
  const [selectedDuration, setSelectedDuration] = useState<(typeof durations)[number]>("60 min");
  const [minimumParticipants, setMinimumParticipants] = useState(3);
  const [selectedSlotId, setSelectedSlotId] = useState(availabilitySlots[0]?.id ?? "");
  const [requestDrafted, setRequestDrafted] = useState(false);

  const filteredSlots = useMemo(
    () => availabilitySlots.filter((slot) => slot.participants.length >= minimumParticipants),
    [minimumParticipants],
  );

  const selectedSlot = filteredSlots.find((slot) => slot.id === selectedSlotId) ?? filteredSlots[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Shared free slots"
        title={`${groupName} availability`}
        description="Find shared free windows across the group's schedule. Set a range, pick a duration, and narrow by participant count."
      />

      <SectionCard>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr_0.8fr]">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Range</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ranges.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium",
                    selectedRange === range ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted",
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Duration</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {durations.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setSelectedDuration(duration)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium",
                    selectedDuration === duration ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted",
                  )}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Minimum participants</span>
              <input
                type="range"
                min={2}
                max={5}
                value={minimumParticipants}
                onChange={(event) => setMinimumParticipants(Number(event.target.value))}
                className="mt-4 w-full accent-[var(--primary)]"
              />
            </label>
            <p className="mt-2 text-sm font-semibold">{minimumParticipants}+ people available</p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <SectionCard className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Selected range</p>
              <p className="mt-3 text-xl font-semibold">{selectedRange}</p>
            </SectionCard>
            <SectionCard className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Meeting length</p>
              <p className="mt-3 text-xl font-semibold">{selectedDuration}</p>
            </SectionCard>
            <SectionCard className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Candidate slots</p>
              <p className="mt-3 text-xl font-semibold">{filteredSlots.length}</p>
            </SectionCard>
          </div>

          <SlotList items={filteredSlots} selectedSlotId={selectedSlot?.id} onSelect={(slotId) => {
            setSelectedSlotId(slotId);
            setRequestDrafted(false);
          }} actionLabel="Inspect slot" />
        </div>

        <SectionCard>
          <p className="text-sm font-medium text-muted-foreground">Selected result</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{selectedSlot?.date ?? "No slot available"}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {selectedSlot
              ? "Review the candidate window here and draft a request from the same page."
              : "Increase the date range or lower the participant threshold to reveal more slots."}
          </p>

          {selectedSlot ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">Time</p>
                <p className="mt-2 text-lg font-semibold">{selectedSlot.time}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">Participants</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedSlot.participants.join(", ")}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">Planner note</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedSlot.note}</p>
              </div>

              <button
                type="button"
                onClick={() => setRequestDrafted(true)}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Draft request
              </button>

              {requestDrafted ? (
                <div className="rounded-3xl bg-primary/8 p-4">
                  <p className="text-sm font-semibold text-primary">Draft ready</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Draft ready for {selectedSlot.date} at {selectedSlot.time}. Review the details and send when you're ready.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </SectionCard>
      </div>
    </div>
  );
}
