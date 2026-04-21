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
  const [requestDrafted, setRequestDrafted] = useState(false); // used as modal open

  const filteredSlots = useMemo(
    () => availabilitySlots.filter((slot) => slot.participants.length >= minimumParticipants),
    [minimumParticipants],
  );

  const selectedSlot = filteredSlots.find((slot) => slot.id === selectedSlotId) ?? filteredSlots[0];

  return (
    <div className="space-y-6">
      {/* ...existing code unchanged... */}

      {selectedSlot ? (
        <div className="mt-6 space-y-4">
          {/* ...existing cards... */}

          {/* 🔁 BUTTON UPDATED */}
          <button
            type="button"
            onClick={() => setRequestDrafted(true)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Create request
          </button>
        </div>
      ) : null}

      {/* ✅ MODAL ADDED */}
      {requestDrafted && (
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
              <button onClick={() => setRequestDrafted(false)}>✕</button>
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
              <button className="px-4 py-2 rounded-full bg-primary text-white">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}