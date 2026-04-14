import { cn } from "@/lib/utils";

export type AvailabilitySlotItem = {
  id: string;
  date: string;
  time: string;
  confidence: string;
  participants: string[];
  note: string;
  startAt?: string;
  endAt?: string;
  participantIds?: string[];
};

type SlotListProps = {
  items: AvailabilitySlotItem[];
  selectedSlotId?: string;
  onSelect?: (slotId: string) => void;
};

export function SlotList({
  items,
  selectedSlotId,
  onSelect,
}: SlotListProps) {
  return (
    <div className="space-y-4">
      {items.map((slot) => {
        const isSelected = selectedSlotId === slot.id;
        return (
          <button
            type="button"
            key={slot.id}
            onClick={() => onSelect?.(slot.id)}
            className={cn(
              "w-full rounded-3xl border border-border/70 bg-card p-5 text-left shadow-sm transition-colors hover:bg-muted/35",
              isSelected && "border-primary/30 bg-primary/5 shadow-primary/10",
            )}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">{slot.confidence}</p>
                <h3 className="mt-1 text-xl font-semibold">{slot.date}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{slot.time}</p>
                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{slot.note}</p>
              </div>
              <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm min-w-[15rem]">
                <p className="font-medium">Available members</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {slot.participants.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
              <p className="text-sm text-muted-foreground">{slot.participants.length} members available in this slot.</p>
              {isSelected ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  Selected
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
