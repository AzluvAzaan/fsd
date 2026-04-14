"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SlotList, type AvailabilitySlotItem } from "@/components/availability/slot-list";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { cn } from "@/lib/utils";

type AvailabilityPlannerProps = {
  groupId?: string;
  groupName?: string;
  slots: AvailabilitySlotItem[];
  groupMemberNames: string[];
  loading?: boolean;
  error?: string | null;
};

const durations = ["30 min", "60 min", "90 min"] as const;
const ranges = ["This week", "Next 7 days", "Next 2 weeks"] as const;

export function AvailabilityPlanner({
  groupId,
  groupName,
  slots,
  groupMemberNames,
  loading = false,
  error = null,
}: AvailabilityPlannerProps) {
  const [selectedRange, setSelectedRange] =
    useState<(typeof ranges)[number]>("This week");
  const [selectedDuration, setSelectedDuration] =
    useState<(typeof durations)[number]>("60 min");
  const [minimumParticipants, setMinimumParticipants] = useState(2);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [requestDrafted, setRequestDrafted] = useState(false);

  const maxParticipants = Math.max(2, groupMemberNames.length || 2);
  const effectiveMinimumParticipants = Math.min(minimumParticipants, maxParticipants);

  const filteredSlots = useMemo(
    () =>
      slots.filter(
        (slot) => slot.participants.length >= effectiveMinimumParticipants,
      ),
    [effectiveMinimumParticipants, slots],
  );

  const selectedSlot =
    filteredSlots.find((slot) => slot.id === selectedSlotId) ??
    filteredSlots[0];

  return (
    <div className="space-y-6">
      {/* Back arrow */}
      {groupId && (
        <Link
          href={`/app/groups/${groupId}`}
          className="inline-flex items-center justify-center size-10 rounded-full border border-border hover:bg-muted transition-colors"
          aria-label="Back to group"
        >
          <ArrowLeft className="size-4" />
        </Link>
      )}

      <PageHeader
        eyebrow="Shared free slots"
        title={`${groupName ?? "Group"} availability`}
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
                    selectedRange === range
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Duration
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {durations.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setSelectedDuration(duration)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium",
                    selectedDuration === duration
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">
                Minimum participants
              </span>
              <input
                type="range"
                min={2}
                max={maxParticipants}
                value={effectiveMinimumParticipants}
                onChange={(event) =>
                  setMinimumParticipants(Number(event.target.value))
                }
                className="mt-4 w-full accent-[var(--primary)]"
              />
            </label>
            <p className="mt-2 text-sm font-semibold">
              {effectiveMinimumParticipants}+ people available
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <SectionCard className="p-5">
              <p className="text-sm font-medium text-muted-foreground">
                Selected range
              </p>
              <p className="mt-3 text-xl font-semibold">{selectedRange}</p>
            </SectionCard>
            <SectionCard className="p-5">
              <p className="text-sm font-medium text-muted-foreground">
                Meeting length
              </p>
              <p className="mt-3 text-xl font-semibold">{selectedDuration}</p>
            </SectionCard>
            <SectionCard className="p-5">
              <p className="text-sm font-medium text-muted-foreground">
                Candidate slots
              </p>
              <p className="mt-3 text-xl font-semibold">
                {loading ? "..." : filteredSlots.length}
              </p>
            </SectionCard>
          </div>

          {error ? (
            <SectionCard>
              <p className="text-sm text-destructive">{error}</p>
            </SectionCard>
          ) : loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-3xl border border-border/70 bg-card" />
              ))}
            </div>
          ) : (
            <SlotList
              items={filteredSlots}
              selectedSlotId={selectedSlot?.id}
              onSelect={(slotId) => {
                setSelectedSlotId(slotId);
                setRequestDrafted(false);
              }}
              actionLabel="Inspect slot"
            />
          )}
        </div>

        <SectionCard>
          <p className="text-sm font-medium text-muted-foreground">
            Selected result
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {selectedSlot?.date ?? "No slot available"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {selectedSlot
              ? "Review the candidate window here and draft a request from the same page."
              : "Increase the date range or lower the participant threshold to reveal more slots."}
          </p>

          {selectedSlot ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Time
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {selectedSlot.time}
                </p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Participants
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {selectedSlot.participants.join(", ")}
                </p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Planner note
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {selectedSlot.note}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRequestDrafted(true)}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Create request
              </button>

              {requestDrafted ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                  {/* backdrop */}
                  <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setRequestDrafted(false)}
                  />

                  {/* modal */}
                  <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden">
                    {/* header */}
                    <div className="flex items-center justify-between p-6 border-b">
                      <h2 className="text-xl font-semibold">Create Request</h2>
                      <button onClick={() => setRequestDrafted(false)}>
                        ✕
                      </button>
                    </div>

                    {/* body */}
                    <div className="p-6 space-y-4">
                      <input
                        placeholder="Event name"
                        className="w-full border rounded-lg p-3"
                      />
                      <input
                        placeholder="Location"
                        className="w-full border rounded-lg p-3"
                      />
                      <select className="w-full border rounded-lg p-3">
                        <option>As soon as possible</option>
                        <option>This week</option>
                        <option>Next week</option>
                      </select>
                    </div>

                    {/* footer */}
                    <div className="flex justify-end gap-3 p-6 border-t">
                      <button
                        onClick={() => setRequestDrafted(false)}
                        className="px-4 py-2 rounded-full border"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setRequestDrafted(false)}
                        className="px-4 py-2 rounded-full bg-primary text-white"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </SectionCard>
      </div>
    </div>
  );
}
