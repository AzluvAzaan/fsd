import { calendarDays, calendarHours, personalEvents } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

export function CalendarBoard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
      <div className="grid grid-cols-[88px_repeat(5,minmax(140px,1fr))] border-b border-border/70 bg-background/60">
        <div className="border-r border-border/70 p-4" />
        {calendarDays.map((day) => (
          <div key={day} className="border-r border-border/70 p-4 last:border-r-0">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{day.split(" ")[0]}</p>
            <p className="mt-1 text-2xl font-semibold">{day.split(" ")[1]}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[88px_repeat(5,minmax(140px,1fr))]">
        <div className="border-r border-border/70">
          {calendarHours.map((hour) => (
            <div key={hour} className="flex h-20 items-start justify-end border-b border-border/60 pr-3 pt-2 text-xs text-muted-foreground last:border-b-0">{hour}</div>
          ))}
        </div>
        {calendarDays.map((day, dayIndex) => (
          <div key={day} className="relative grid grid-rows-[repeat(20,minmax(20px,1fr))] border-r border-border/70 last:border-r-0">
            {Array.from({ length: 20 }).map((_, rowIndex) => (
              <div key={rowIndex} className="border-b border-border/50 last:border-b-0" />
            ))}
            {personalEvents
              .filter((event) => event.dayLabel === day)
              .map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "absolute left-2 right-2 rounded-2xl border p-3 shadow-sm",
                    event.tone === "highlight"
                      ? "border-primary/20 bg-primary/10"
                      : "border-border bg-card",
                  )}
                  style={{
                    top: `${(event.rowStart - 1) * 20 + 8}px`,
                    height: `${event.rowSpan * 20 - 8}px`,
                  }}
                >
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{event.start} - {event.end}</p>
                  {event.group ? <p className="mt-2 text-xs font-medium text-primary">{event.group}</p> : null}
                </div>
              ))}
            {dayIndex === 3 ? <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-primary/50" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
