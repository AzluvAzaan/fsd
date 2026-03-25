import type { AvailabilitySlot } from "@/lib/constants/mock-data";
import { availabilitySlots } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type SlotListProps = {
  items?: AvailabilitySlot[];
  selectedSlotId?: string;
  onSelect?: (slotId: string) => void;
  actionLabel?: string;
};

export function SlotList({
  items = availabilitySlots,
  selectedSlotId,
  onSelect,
  actionLabel = "Review slot",
}: SlotListProps) {
  return (
    <div className="space-y-4">
      {items.map((slot) => (
        <div
          key={slot.id}
          className={cn(
            "rounded-3xl border border-border/70 bg-card p-5 shadow-sm",
            selectedSlotId === slot.id && "border-primary/30 bg-primary/5 shadow-primary/10",
          )}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">{slot.confidence}</p>
              <h3 className="mt-1 text-xl font-semibold">{slot.date}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{slot.time}</p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{slot.note}</p>
            </div>
            <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">
              <p className="font-medium">Participants</p>
              <p className="mt-2 text-muted-foreground">{slot.participants.join(", ")}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
            <p className="text-sm text-muted-foreground">{slot.participants.length} members can attend.</p>
            <button type="button" onClick={() => onSelect?.(slot.id)} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
              {actionLabel}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
