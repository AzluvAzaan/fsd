"use client";

import { useMemo, useState } from "react";

import { availabilitySlots } from "@/lib/constants/mock-data";

export function AvailabilityPlanner() {
  const minimumParticipants = 3;
  const selectedSlotId = availabilitySlots[0]?.id ?? "";
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