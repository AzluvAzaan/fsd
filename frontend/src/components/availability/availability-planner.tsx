"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { SlotList, type AvailabilitySlotItem } from "@/components/availability/slot-list";
import { CalendarClient } from "@/components/calendar/calendar-client";
import { Modal } from "@/components/shared/modal";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { getStoredUser } from "@/lib/auth";
import {
  createEventRequest,
  getGroupCalendar,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export type AvailabilityMemberOption = {
  userId: string;
  name: string;
};

type AvailabilityPlannerProps = {
  groupId?: string;
  groupName?: string;
  groupMembers: AvailabilityMemberOption[];
  loading?: boolean;
  error?: string | null;
};

type PlannerStep = "filters" | "results";

type RangeOption = {
  id: "this-week" | "next-7-days" | "next-2-weeks";
  label: string;
};

type ToastItem = {
  id: string;
  kind: "success" | "error";
  message: string;
};

const durationOptions = [30, 60, 90] as const;
const rangeOptions: RangeOption[] = [
  { id: "this-week", label: "This week" },
  { id: "next-7-days", label: "Next 7 days" },
  { id: "next-2-weeks", label: "Next 2 weeks" },
];
const weekdayOptions = [
  { id: 1, label: "M" },
  { id: 2, label: "T" },
  { id: 3, label: "W" },
  { id: 4, label: "T" },
  { id: 5, label: "F" },
] as const;
const SLOT_STEP_MINUTES = 30;
const BUSINESS_START_MINUTES = 8 * 60;
const BUSINESS_END_MINUTES = 18 * 60;
const MAX_RECOMMENDED_SLOTS = 30;

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const weekday = next.getDay();
  const daysSinceMonday = weekday === 0 ? 6 : weekday - 1;
  next.setDate(next.getDate() - daysSinceMonday);
  return next;
}

function getRangeWindow(rangeId: RangeOption["id"]) {
  const now = new Date();

  if (rangeId === "this-week") {
    const from = startOfWeek(now);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  const from = now;
  const to = new Date(now);
  to.setDate(to.getDate() + (rangeId === "next-2-weeks" ? 14 : 7));

  return { from: from.toISOString(), to: to.toISOString() };
}

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

function ceilToStep(date: Date, stepMinutes: number) {
  const ms = stepMinutes * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function buildRecommendedSlots(
  freeSlots: Array<{ startTime: string; endTime: string }>,
  durationMinutes: number,
  selectedWeekdays: Set<number>,
) {
  const durationMs = durationMinutes * 60 * 1000;
  const stepMs = SLOT_STEP_MINUTES * 60 * 1000;
  const output: Array<{ startAt: string; endAt: string }> = [];

  for (const free of freeSlots) {
    const freeStart = new Date(free.startTime);
    const freeEnd = new Date(free.endTime);
    if (freeEnd.getTime() - freeStart.getTime() < durationMs) continue;

    let cursor = ceilToStep(freeStart, SLOT_STEP_MINUTES);
    while (cursor.getTime() + durationMs <= freeEnd.getTime()) {
      const candidateStart = new Date(cursor);
      const candidateEnd = new Date(cursor.getTime() + durationMs);
      const weekday = candidateStart.getDay();
      const sameDay = candidateStart.toDateString() === candidateEnd.toDateString();
      const startMinute = minutesOfDay(candidateStart);
      const endMinute = minutesOfDay(candidateEnd);

      if (
        sameDay &&
        selectedWeekdays.has(weekday) &&
        startMinute >= BUSINESS_START_MINUTES &&
        endMinute <= BUSINESS_END_MINUTES
      ) {
        output.push({
          startAt: candidateStart.toISOString(),
          endAt: candidateEnd.toISOString(),
        });
        if (output.length >= MAX_RECOMMENDED_SLOTS) {
          return output;
        }
      }

      cursor = new Date(cursor.getTime() + stepMs);
    }
  }

  return output;
}

export function AvailabilityPlanner({
  groupId,
  groupName,
  groupMembers,
  loading = false,
  error = null,
}: AvailabilityPlannerProps) {
  const [step, setStep] = useState<PlannerStep>("filters");
  const [selectedRange, setSelectedRange] = useState<RangeOption["id"]>("this-week");
  const [selectedDuration, setSelectedDuration] = useState<(typeof durationOptions)[number]>(60);
  const [minimumParticipants, setMinimumParticipants] = useState(2);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [selectedWeekdays, setSelectedWeekdays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));

  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlotItem[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const [requestDrafted, setRequestDrafted] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestLocation, setRequestLocation] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (groupMembers.length === 0) {
      setSelectedMemberIds(new Set());
      return;
    }

    setSelectedMemberIds(new Set(groupMembers.map((member) => member.userId)));
  }, [groupMembers]);

  const selectedMembers = useMemo(
    () => groupMembers.filter((member) => selectedMemberIds.has(member.userId)),
    [groupMembers, selectedMemberIds],
  );

  const selectedMemberNames = selectedMembers.map((member) => member.name);
  const maxParticipants = Math.max(1, selectedMembers.length);
  const effectiveMinimumParticipants = Math.min(minimumParticipants, maxParticipants);

  useEffect(() => {
    setMinimumParticipants((current) => Math.min(Math.max(current, 1), maxParticipants));
  }, [maxParticipants]);

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) ?? slots[0];

  const recommendedSlots = useMemo(
    () =>
      slots.map((slot) => ({
        id: slot.id,
        startAt: slot.startAt ?? "",
        endAt: slot.endAt ?? "",
      })),
    [slots],
  );

  function pushToast(kind: ToastItem["kind"], message: string) {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    setToasts((current) => [...current, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }

  async function handleFindSlots() {
    if (!groupId) {
      setSearchError("Group context is missing. Refresh and try again.");
      return;
    }

    if (selectedMemberIds.size === 0) {
      setSearchError("Select at least one participant before searching.");
      return;
    }

    if (selectedWeekdays.size === 0) {
      setSearchError("Select at least one day before searching.");
      return;
    }

    try {
      setSearching(true);
      setSearchError(null);

      const selectedUserIds = Array.from(selectedMemberIds);
      const { from, to } = getRangeWindow(selectedRange);
      const calendar = await getGroupCalendar(groupId, selectedUserIds, from, to);

      const candidateSlots = buildRecommendedSlots(
        calendar.freeSlots ?? [],
        selectedDuration,
        selectedWeekdays,
      );

      const confidence =
        selectedMemberIds.size === groupMembers.length
          ? "All selected members free"
          : `${selectedMembers.length} selected members free`;

      const mappedSlots = candidateSlots.map((slot, index) => {
        const start = new Date(slot.startAt);
        const end = new Date(slot.endAt);

        return {
          id: `free-${index}`,
          startAt: slot.startAt,
          endAt: slot.endAt,
          date: formatDateLabel(start),
          time: formatTimeLabel(start, end),
          confidence,
          participants: selectedMemberNames,
          participantIds: selectedUserIds,
          note: `${selectedMemberNames.length} participants available for ${selectedDuration} minutes.`,
        } satisfies AvailabilitySlotItem;
      });

      const filteredSlots =
        selectedMembers.length >= effectiveMinimumParticipants ? mappedSlots : [];

      setSlots(filteredSlots);
      setSelectedSlotId(filteredSlots[0]?.id ?? "");
      setStep("results");
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : "Failed to compute group availability",
      );
      setSlots([]);
    } finally {
      setSearching(false);
    }
  }

  function toggleMember(userId: string) {
    setSelectedMemberIds((current) => {
      const next = new Set(current);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  function toggleWeekday(day: number) {
    setSelectedWeekdays((current) => {
      const next = new Set(current);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  }

  async function handleCreateDraft() {
    if (!groupId) {
      pushToast("error", "Group context is missing. Refresh and try again.");
      return;
    }

    if (!requestTitle.trim()) {
      pushToast("error", "Add an event name before creating the request.");
      return;
    }

    if (!selectedSlot?.startAt || !selectedSlot?.endAt) {
      pushToast("error", "Select a slot before creating the request.");
      return;
    }

    const selectedParticipantIds = selectedSlot.participantIds ?? Array.from(selectedMemberIds);
    const currentUserId = getStoredUser()?.id;
    const recipientIds = selectedParticipantIds.filter((id) => id !== currentUserId);

    if (recipientIds.length === 0) {
      pushToast("error", "Select at least one other participant to receive the request.");
      return;
    }

    try {
      setRequestSubmitting(true);

      await createEventRequest({
        groupId,
        title: requestTitle.trim(),
        eventType: "meeting",
        proposedStart: selectedSlot.startAt,
        proposedEnd: selectedSlot.endAt,
        recipientIds,
      });

      setRequestDrafted(false);
      setRequestTitle("");
      setRequestLocation("");
      setRequestNote("");
      pushToast("success", `Request sent for ${selectedSlot.date} at ${selectedSlot.time}.`);
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Failed to create request.");
    } finally {
      setRequestSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {toasts.length > 0 ? (
        <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-lg",
                toast.kind === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive",
              )}
            >
              {toast.message}
            </div>
          ))}
        </div>
      ) : null}

      {groupId && step === "filters" && (
        <Link
          href={`/app/groups/${groupId}`}
          className="inline-flex items-center justify-center size-10 rounded-full border border-border hover:bg-muted transition-colors"
          aria-label="Back to group"
        >
          <ArrowLeft className="size-4" />
        </Link>
      )}

      {step === "filters" ? (
        <PageHeader
          eyebrow="Shared free slots"
          title={`${groupName ?? "Group"} availability`}
          description="Step 1: set filters. Step 2: inspect highlighted recommendations and draft a request."
        />
      ) : null}

      {error ? (
        <SectionCard>
          <p className="text-sm text-destructive">{error}</p>
        </SectionCard>
      ) : null}

      {step === "filters" ? (
        <>
          <SectionCard>
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr_0.8fr]">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Range</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rangeOptions.map((range) => (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setSelectedRange(range.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium",
                        selectedRange === range.id
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-background hover:bg-muted",
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {durationOptions.map((duration) => (
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
                      {duration} min
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
                    min={1}
                    max={Math.max(1, maxParticipants)}
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

          <SectionCard>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">Participants</p>
              <p className="text-xs text-muted-foreground">
                {selectedMembers.length}/{groupMembers.length} selected
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {groupMembers.map((member) => {
                const active = selectedMemberIds.has(member.userId);
                return (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => toggleMember(member.userId)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium",
                      active
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {member.name}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard>
            <p className="text-sm font-medium text-muted-foreground">Days</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {weekdayOptions.map((day, index) => {
                const active = selectedWeekdays.has(day.id);
                return (
                  <button
                    key={`${day.id}-${index}`}
                    type="button"
                    onClick={() => toggleWeekday(day.id)}
                    className={cn(
                      "grid size-11 place-items-center rounded-full border text-sm font-semibold",
                      active
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {searchError ? (
            <SectionCard>
              <p className="text-sm text-destructive">{searchError}</p>
            </SectionCard>
          ) : null}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={loading || searching || groupMembers.length === 0}
              onClick={() => {
                void handleFindSlots();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searching ? "Finding..." : "Find slots"}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div>
            <button
              type="button"
              onClick={() => setStep("filters")}
              className="inline-flex items-center justify-center size-10 rounded-full border border-border bg-background hover:bg-muted"
              aria-label="Back to filters"
            >
              <ArrowLeft className="size-4" />
            </button>
          </div>

          {searchError ? (
            <SectionCard>
              <p className="text-sm text-destructive">{searchError}</p>
            </SectionCard>
          ) : null}

          <CalendarClient
            scope="group"
            groupName={groupName}
            groupId={groupId}
            selectedUserIds={Array.from(selectedMemberIds)}
            recommendedSlots={recommendedSlots}
            selectedRecommendedSlotId={selectedSlot?.id}
            onRecommendedSlotSelect={(slotId) => {
              setSelectedSlotId(slotId);
            }}
            hideGroupInsights
            hideGroupHeader
          />

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              {slots.length > 0 ? (
                <SlotList
                  items={slots}
                  selectedSlotId={selectedSlot?.id}
                  onSelect={(slotId) => {
                    setSelectedSlotId(slotId);
                  }}
                />
              ) : (
                <SectionCard>
                  <p className="text-sm font-medium">No matching slots</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Adjust your filters and run Find slots again.
                  </p>
                </SectionCard>
              )}
            </div>

            <SectionCard>
              <p className="text-sm font-medium text-muted-foreground">Selected slot</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {selectedSlot?.date ?? "No slot selected"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {selectedSlot
                  ? "Use this recommendation to draft your request."
                  : "Select one of the recommended slots from the calendar or cards."}
              </p>

              {selectedSlot ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Time</p>
                    <p className="mt-2 text-lg font-semibold">{selectedSlot.time}</p>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Participants</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {selectedSlot.participants.join(", ")}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Planner note</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {selectedSlot.note}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRequestDrafted(true);
                    }}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Create request
                  </button>
                </div>
              ) : null}
            </SectionCard>
          </div>

          <Modal
            open={requestDrafted}
            onClose={() => setRequestDrafted(false)}
            title="Create Request"
            description={selectedSlot ? `${selectedSlot.date} · ${selectedSlot.time}` : undefined}
            className="max-w-2xl"
          >
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground">Event name</span>
                <input
                  value={requestTitle}
                  onChange={(event) => setRequestTitle(event.target.value)}
                  placeholder="Weekly project sync"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground">Location</span>
                <input
                  value={requestLocation}
                  onChange={(event) => setRequestLocation(event.target.value)}
                  placeholder="Online / Meeting room"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground">Planner note</span>
                <textarea
                  value={requestNote}
                  onChange={(event) => setRequestNote(event.target.value)}
                  placeholder="Agenda or context for the group"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
              </label>

              <div className="rounded-2xl border border-border/70 bg-muted/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Included participants
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {selectedMembers.map((member) => member.name).join(", ") || "None"}
                </p>
              </div>

              {requestLocation || requestNote ? (
                <p className="text-xs text-muted-foreground">
                  Additional details are captured in this draft only.
                </p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestDrafted(false)}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleCreateDraft();
                  }}
                  disabled={requestSubmitting}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {requestSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
