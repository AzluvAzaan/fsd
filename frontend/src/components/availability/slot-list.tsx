import { availabilitySlots } from "@/lib/constants/mock-data";

export function SlotList() {
  return (
    <div className="space-y-4">
      {availabilitySlots.map((slot) => (
        <div key={slot.id} className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">{slot.confidence}</p>
              <h3 className="mt-1 text-xl font-semibold">{slot.date}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{slot.time}</p>
              <p className="mt-4 text-sm text-muted-foreground">{slot.note}</p>
            </div>
            <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">
              <p className="font-medium">Participants</p>
              <p className="mt-2 text-muted-foreground">{slot.participants.join(", ")}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
