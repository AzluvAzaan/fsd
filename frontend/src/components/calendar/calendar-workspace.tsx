"use client";

import { useEffect, useRef, useState } from "react";
import type { DatesSetArg, EventContentArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { ChevronLeft, ChevronRight, Clock3, Layers3, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { buttonVariants } from "@/components/ui/button";
import { personalEvents, requests, type CalendarEvent } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type CalendarWorkspaceProps = {
  scope?: "personal" | "group";
  groupName?: string;
};

const selectedDayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const eventTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const createEvent = (
  id: string,
  title: string,
  startAt: string,
  endAt: string,
  tone: CalendarEvent["tone"] = "default",
  group?: string,
): CalendarEvent => ({
  id,
  title,
  startAt,
  endAt,
  tone,
  group,
});

const personalCalendarEvents: CalendarEvent[] = [
  ...personalEvents,
  createEvent("ev5", "Design Crit", "2026-03-23T10:00:00", "2026-03-23T11:30:00", "highlight"),
  createEvent("ev6", "Client Review", "2026-03-24T13:00:00", "2026-03-24T14:00:00"),
  createEvent("ev7", "Heads-down Build", "2026-03-25T09:00:00", "2026-03-25T12:00:00", "muted"),
  createEvent("ev8", "Mentor Session", "2026-03-25T15:00:00", "2026-03-25T16:00:00"),
  createEvent("ev9", "Weekly Planning", "2026-03-23T09:30:00", "2026-03-23T10:30:00", "highlight"),
  createEvent("ev10", "Research Sprint", "2026-03-26T11:00:00", "2026-03-26T13:00:00"),
  createEvent("ev11", "Coffee Catch-up", "2026-03-27T14:00:00", "2026-03-27T15:00:00", "muted"),
  createEvent("ev12", "Demo Dry Run", "2026-03-28T16:00:00", "2026-03-28T17:00:00", "highlight"),
];

const buildGroupEvents = (groupName: string): CalendarEvent[] => [
  createEvent(`${groupName}-1`, "Planning Sync", "2026-03-16T09:00:00", "2026-03-16T10:00:00", "highlight", groupName),
  createEvent(`${groupName}-2`, "Engineering Review", "2026-03-17T11:00:00", "2026-03-17T12:30:00", "default", groupName),
  createEvent(`${groupName}-3`, "No-meeting Block", "2026-03-18T13:00:00", "2026-03-18T15:00:00", "muted", groupName),
  createEvent(`${groupName}-4`, "Shared Team Sync", "2026-03-19T14:00:00", "2026-03-19T15:30:00", "highlight", groupName),
  createEvent(`${groupName}-5`, "Wrap-up", "2026-03-20T16:00:00", "2026-03-20T17:00:00", "default", groupName),
  createEvent(`${groupName}-6`, "Retro Prep", "2026-03-23T10:00:00", "2026-03-23T11:00:00", "default", groupName),
  createEvent(`${groupName}-7`, "Merged Availability Review", "2026-03-24T14:00:00", "2026-03-24T15:00:00", "highlight", groupName),
  createEvent(`${groupName}-8`, "Async Feedback Window", "2026-03-26T09:00:00", "2026-03-26T11:00:00", "muted", groupName),
];

function getDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSelectedDay(dateKey: string) {
  return selectedDayFormatter.format(new Date(`${dateKey}T00:00:00`));
}

function formatEventTimeRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return `${eventTimeFormatter.format(start)} - ${eventTimeFormatter.format(end)}`;
}

function toEventInput(event: CalendarEvent): EventInput {
  return {
    id: event.id,
    title: event.title,
    start: event.startAt,
    end: event.endAt,
    extendedProps: {
      tone: event.tone ?? "default",
      group: event.group,
    },
  };
}

export function CalendarWorkspace({ scope = "personal", groupName = "FSD Core" }: CalendarWorkspaceProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const events = scope === "personal" ? personalCalendarEvents : buildGroupEvents(groupName);
  const [calendarTitle, setCalendarTitle] = useState("Mar 16 – 22, 2026");
  const [selectedDate, setSelectedDate] = useState(getDateKey(events[0]?.startAt ?? "2026-03-16T09:00:00"));
  const [visibleRange, setVisibleRange] = useState({
    start: new Date("2026-03-16T00:00:00"),
    end: new Date("2026-03-23T00:00:00"),
  });

  // Prevent SSR rendering of FullCalendar (avoids hydration mismatch + flushSync errors)
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    const nextView = viewMode === "week" ? "timeGridWeek" : "dayGridMonth";
    if (api.view.type !== nextView) {
      // Defer changeView outside React's render cycle — FullCalendar 6.x calls
      // flushSync internally, which throws if invoked during a React 19 render.
      setTimeout(() => api.changeView(nextView), 0);
    }
  }, [viewMode]);

  const selectedEvents = events
    .filter((event) => getDateKey(event.startAt) === selectedDate)
    .sort((left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime());
  const rangeEvents = events.filter((event) => {
    const start = new Date(event.startAt);
    const end = new Date(event.endAt);
    return start < visibleRange.end && end > visibleRange.start;
  });
  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const selectedDayLabel = formatSelectedDay(selectedDate);
  const summaryCards = [
    {
      label: "Scheduled blocks",
      value: `${rangeEvents.length}`,
      note: viewMode === "week" ? "Across the visible week." : "Inside the visible month.",
      icon: Layers3,
    },
    {
      label: "Focused day",
      value: selectedDayLabel,
      note: `${selectedEvents.length} item${selectedEvents.length === 1 ? "" : "s"} selected.`,
      icon: Clock3,
    },
    {
      label: "Pending requests",
      value: `${pendingCount}`,
      note: scope === "personal" ? "Requests linked to your schedule." : "Requests still waiting on group response.",
      icon: Sparkles,
    },
  ];

  const handleCalendarMove = (direction: -1 | 1) => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    if (direction === -1) {
      api.prev();
      return;
    }

    api.next();
  };

  const handleDatesSet = (args: DatesSetArg) => {
    const start = args.view.currentStart;
    const end = args.view.currentEnd;
    setCalendarTitle(args.view.title);
    setVisibleRange({ start, end });

    const selected = new Date(`${selectedDate}T00:00:00`);
    if (selected < start || selected >= end) {
      setSelectedDate(getDateKey(start));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={scope === "personal" ? "Personal workspace" : "Group calendar"}
        title={calendarTitle}
        description={
          scope === "personal"
            ? "Browse, navigate, and coordinate your personal schedule. Switch between weekly and monthly views and inspect any day in detail."
            : `Explore ${groupName}'s shared calendar. Navigate between views and inspect event blocks to find coordination windows.`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleCalendarMove(-1)}
              className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "rounded-full bg-card")}
              aria-label="Previous range"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => handleCalendarMove(1)}
              className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "rounded-full bg-card")}
              aria-label="Next range"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
              {(["week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium capitalize",
                    viewMode === mode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <SectionCard key={card.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">{card.value}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.note}</p>
                </div>
                <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>

      <SectionCard className="overflow-hidden p-0">
        <div className="fsd-calendar overflow-x-auto p-3 sm:p-4 lg:p-6">
          <div className="min-w-[760px]">
            {mounted ? (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                initialDate={events[0]?.startAt}
                headerToolbar={false}
                firstDay={1}
                weekends
                allDaySlot={false}
                nowIndicator
                stickyHeaderDates
                editable={false}
                selectable
                selectMirror={false}
                dayMaxEventRows={3}
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                height={viewMode === "week" ? 860 : "auto"}
                eventDisplay="block"
                slotEventOverlap={false}
                events={events.map(toEventInput)}
                datesSet={handleDatesSet}
                dateClick={(arg) => setSelectedDate(getDateKey(arg.date))}
                eventClick={(arg) => {
                  if (arg.event.start) {
                    setSelectedDate(getDateKey(arg.event.start));
                  }
                }}
                dayCellClassNames={(arg) => (getDateKey(arg.date) === selectedDate ? ["fc-day-selected"] : [])}
                dayHeaderContent={(arg) => {
                  if (arg.view.type !== "timeGridWeek") {
                    return <span className="fc-weekday-label">{arg.text}</span>;
                  }

                  const dateKey = getDateKey(arg.date);
                  const weekdayLabel = arg.date.toLocaleDateString("en-US", { weekday: "short" });
                  const dateLabel = arg.date.toLocaleDateString("en-US", { day: "numeric" });

                  return (
                    <button
                      type="button"
                      onClick={() => setSelectedDate(dateKey)}
                      className={cn("fc-weekday-button", dateKey === selectedDate && "is-selected")}
                    >
                      <span className="fc-weekday-button__label">{weekdayLabel}</span>
                      <span className="fc-weekday-button__date">{dateLabel}</span>
                    </button>
                  );
                }}
                eventClassNames={(arg) => {
                  const tone = arg.event.extendedProps.tone as CalendarEvent["tone"];
                  return [
                    "fc-event-shell",
                    tone === "highlight" ? "fc-event-highlight" : "",
                    tone === "muted" ? "fc-event-muted" : "",
                  ];
                }}
                eventContent={(arg: EventContentArg) => {
                  if (arg.view.type === "dayGridMonth") {
                    return (
                      <div className="fc-event-pill">
                        <p className="fc-event-pill__title">{arg.event.title}</p>
                      </div>
                    );
                  }
                  return (
                    <div className="fc-event-card">
                      <p className="fc-event-time">{arg.timeText}</p>
                      <p className="fc-event-title">{arg.event.title}</p>
                      {arg.event.extendedProps.group ? <p className="fc-event-meta">{arg.event.extendedProps.group as string}</p> : null}
                    </div>
                  );
                }}
              />
            ) : (
              <div style={{ height: viewMode === "week" ? 860 : 560 }} className="rounded-3xl bg-muted/20" />
            )}
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Selected day</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{selectedDayLabel}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {selectedEvents.length > 0
                  ? "Inspect the events for this day without losing context in the main calendar view."
                  : "Nothing scheduled yet — a good window for a new request or focused work."}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              {selectedEvents.length} item{selectedEvents.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event) => (
                <div key={event.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatEventTimeRange(event.startAt, event.endAt)}
                      </p>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", event.tone === "highlight" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                      {event.tone === "highlight" ? "Priority" : "Scheduled"}
                    </span>
                  </div>
                  {event.group ? <p className="mt-3 text-sm font-medium text-primary">{event.group}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-sm leading-6 text-muted-foreground">
                Nothing scheduled for this day yet.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-sm font-medium text-muted-foreground">Request context</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Coordination status</h2>
          <div className="mt-6 space-y-3">
            {requests.filter((request) => request.status === "pending").map((request) => (
              <div key={request.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="font-semibold">{request.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{request.group}</p>
                <p className="mt-3 text-sm font-medium text-primary">{request.proposedTime}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
