import type { CalendarEvent } from "@/lib/constants/mock-data";
import { calendarDays, calendarHours, personalEvents } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type CalendarBoardProps = {
  days?: string[];
  events?: CalendarEvent[];
  selectedDay?: string;
  onSelectDay?: (day: string) => void;
  focusDay?: string;
};

export function CalendarBoard({
  days = calendarDays,
  events = personalEvents,
  selectedDay,
  onSelectDay,
  focusDay = "Thu 15",
}: CalendarBoardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
      <div className="grid grid-cols-[88px_repeat(5,minmax(140px,1fr))] border-b border-border/70 bg-background/60">
        <div className="border-r border-border/70 p-4" />
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDay?.(day)}
            className={cn(
              "border-r border-border/70 p-4 text-left last:border-r-0",
              selectedDay === day ? "bg-primary/8" : "hover:bg-muted/60",
            )}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{day.split(" ")[0]}</p>
            <p className="mt-1 text-2xl font-semibold">{day.split(" ")[1]}</p>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[88px_repeat(5,minmax(140px,1fr))]">
        <div className="border-r border-border/70">
          {calendarHours.map((hour) => (
            <div key={hour} className="flex h-20 items-start justify-end border-b border-border/60 pr-3 pt-2 text-xs text-muted-foreground last:border-b-0">
              {hour}
            </div>
          ))}
        </div>
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDay?.(day)}
            className={cn(
              "relative grid grid-rows-[repeat(20,minmax(20px,1fr))] border-r border-border/70 text-left last:border-r-0",
              selectedDay === day ? "bg-primary/5" : "hover:bg-background/70",
            )}
          >
            {Array.from({ length: 20 }).map((_, rowIndex) => (
              <div key={rowIndex} className="border-b border-border/50 last:border-b-0" />
            ))}
            {events
              .filter((event) => event.dayLabel === day)
              .map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "absolute right-2 rounded-2xl border p-3 shadow-sm",
                    event.tone === "highlight"
                      ? "border-primary/20 bg-primary/10"
                      : event.tone === "muted"
                        ? "border-border/70 bg-background/80"
                        : "border-border bg-card",
                  )}
                  style={{
                    left: `${0.5 + event.lane * 0.7}rem`,
                    top: `${(event.rowStart - 1) * 20 + 8}px`,
                    height: `${event.rowSpan * 20 - 8}px`,
                  }}
                >
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.start} - {event.end}
                  </p>
                  {event.group ? <p className="mt-2 text-xs font-medium text-primary">{event.group}</p> : null}
                </div>
              ))}
            {focusDay === day ? <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-primary/50" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
