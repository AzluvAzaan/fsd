"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Layers3, Sparkles } from "lucide-react";

import { CalendarBoard } from "@/components/calendar/calendar-board";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { buttonVariants } from "@/components/ui/button";
import { personalEvents, requests, type CalendarEvent } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type CalendarWorkspaceProps = {
  scope?: "personal" | "group";
  groupName?: string;
};

type WeekView = {
  rangeLabel: string;
  days: string[];
  events: CalendarEvent[];
  focusDay: string;
};

const personalWeeks: WeekView[] = [
  {
    rangeLabel: "October 12 - 18, 2023",
    days: ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16"],
    events: personalEvents,
    focusDay: "Thu 15",
  },
  {
    rangeLabel: "October 19 - 25, 2023",
    days: ["Mon 19", "Tue 20", "Wed 21", "Thu 22", "Fri 23"],
    focusDay: "Tue 20",
    events: [
      { id: "ev5", title: "Design Crit", dayLabel: "Mon 19", start: "10:00", end: "11:30", lane: 0, rowStart: 5, rowSpan: 3, tone: "highlight" },
      { id: "ev6", title: "Client Review", dayLabel: "Tue 20", start: "13:00", end: "14:00", lane: 0, rowStart: 11, rowSpan: 2, tone: "default" },
      { id: "ev7", title: "Heads-down Build", dayLabel: "Wed 21", start: "09:00", end: "12:00", lane: 0, rowStart: 3, rowSpan: 6, tone: "muted" },
      { id: "ev8", title: "Mentor Session", dayLabel: "Fri 23", start: "15:00", end: "16:00", lane: 0, rowStart: 15, rowSpan: 2, tone: "default" },
    ],
  },
  {
    rangeLabel: "October 26 - November 1, 2023",
    days: ["Mon 26", "Tue 27", "Wed 28", "Thu 29", "Fri 30"],
    focusDay: "Wed 28",
    events: [
      { id: "ev9", title: "Weekly Planning", dayLabel: "Mon 26", start: "09:30", end: "10:30", lane: 0, rowStart: 4, rowSpan: 2, tone: "highlight" },
      { id: "ev10", title: "Research Sprint", dayLabel: "Wed 28", start: "11:00", end: "13:00", lane: 0, rowStart: 7, rowSpan: 4, tone: "default" },
      { id: "ev11", title: "Coffee Catch-up", dayLabel: "Thu 29", start: "14:00", end: "15:00", lane: 0, rowStart: 13, rowSpan: 2, tone: "muted" },
      { id: "ev12", title: "Demo Dry Run", dayLabel: "Fri 30", start: "16:00", end: "17:00", lane: 0, rowStart: 17, rowSpan: 2, tone: "highlight" },
    ],
  },
];

const groupWeeks = (groupName: string): WeekView[] => [
  {
    rangeLabel: "October 12 - 18, 2023",
    days: ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16"],
    focusDay: "Thu 15",
    events: [
      { id: `${groupName}-1`, title: "Planning Sync", dayLabel: "Mon 12", start: "09:00", end: "10:00", lane: 0, rowStart: 3, rowSpan: 2, tone: "highlight", group: groupName },
      { id: `${groupName}-2`, title: "Engineering Review", dayLabel: "Tue 13", start: "11:00", end: "12:30", lane: 0, rowStart: 7, rowSpan: 3, tone: "default", group: groupName },
      { id: `${groupName}-3`, title: "No-meeting Block", dayLabel: "Wed 14", start: "13:00", end: "15:00", lane: 0, rowStart: 11, rowSpan: 4, tone: "muted", group: groupName },
      { id: `${groupName}-4`, title: "Shared Team Sync", dayLabel: "Thu 15", start: "14:00", end: "15:30", lane: 0, rowStart: 13, rowSpan: 3, tone: "highlight", group: groupName },
      { id: `${groupName}-5`, title: "Wrap-up", dayLabel: "Fri 16", start: "16:00", end: "17:00", lane: 0, rowStart: 17, rowSpan: 2, tone: "default", group: groupName },
    ],
  },
  {
    rangeLabel: "October 19 - 25, 2023",
    days: ["Mon 19", "Tue 20", "Wed 21", "Thu 22", "Fri 23"],
    focusDay: "Tue 20",
    events: [
      { id: `${groupName}-6`, title: "Retro Prep", dayLabel: "Mon 19", start: "10:00", end: "11:00", lane: 0, rowStart: 5, rowSpan: 2, tone: "default", group: groupName },
      { id: `${groupName}-7`, title: "Merged Availability Review", dayLabel: "Tue 20", start: "14:00", end: "15:00", lane: 0, rowStart: 13, rowSpan: 2, tone: "highlight", group: groupName },
      { id: `${groupName}-8`, title: "Async Feedback Window", dayLabel: "Thu 22", start: "09:00", end: "11:00", lane: 0, rowStart: 3, rowSpan: 4, tone: "muted", group: groupName },
    ],
  },
];

const monthDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthCells = Array.from({ length: 35 }, (_, index) => {
  const dayNumber = index - 1;
  const inMonth = dayNumber >= 1 && dayNumber <= 31;
  const mappedWeekIndex = dayNumber >= 12 && dayNumber <= 16 ? 0 : dayNumber >= 19 && dayNumber <= 23 ? 1 : dayNumber >= 26 && dayNumber <= 30 ? 2 : undefined;

  return {
    id: index,
    dayNumber,
    inMonth,
    mappedWeekIndex,
    eventCount: [12, 15, 20, 28, 30].includes(dayNumber) ? 2 : [13, 14, 16, 19, 22].includes(dayNumber) ? 1 : 0,
  };
});

export function CalendarWorkspace({ scope = "personal", groupName = "FSD Core" }: CalendarWorkspaceProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const weeks = scope === "personal" ? personalWeeks : groupWeeks(groupName);
  const [weekIndex, setWeekIndex] = useState(0);
  const currentWeek = weeks[weekIndex];
  const [selectedDay, setSelectedDay] = useState(currentWeek.days[currentWeek.days.length - 2]);
  const [selectedMonthDay, setSelectedMonthDay] = useState(15);

  const selectedEvents = currentWeek.events.filter((event) => event.dayLabel === selectedDay);
  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const summaryCards = [
    {
      label: "Scheduled blocks",
      value: `${currentWeek.events.length}`,
      note: scope === "personal" ? "Across your current week view." : "Shared blocks across the group.",
      icon: Layers3,
    },
    {
      label: "Focused day",
      value: selectedDay,
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

  const handleWeekChange = (direction: -1 | 1) => {
    const nextIndex = (weekIndex + direction + weeks.length) % weeks.length;
    setWeekIndex(nextIndex);
    setSelectedDay(weeks[nextIndex].focusDay);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={scope === "personal" ? "Personal workspace" : "Group calendar"}
        title={currentWeek.rangeLabel}
        description={
          scope === "personal"
            ? "Weekly and monthly calendar views now run on local frontend state, so the toolbar and selection behavior work before the backend calendar domain is finished."
            : `${groupName} now has a functional mock calendar workspace with a working view switch, date stepping, and per-day focus panels.`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleWeekChange(-1)}
              className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "rounded-full bg-card")}
              aria-label="Previous range"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => handleWeekChange(1)}
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
        {viewMode === "week" ? (
          <CalendarBoard
            days={currentWeek.days}
            events={currentWeek.events}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            focusDay={currentWeek.focusDay}
          />
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-7 gap-3">
              {monthDays.map((day) => (
                <p key={day} className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {day}
                </p>
              ))}
              {monthCells.map((cell) => (
                <button
                  key={cell.id}
                  type="button"
                  disabled={!cell.inMonth}
                  onClick={() => {
                    setSelectedMonthDay(cell.dayNumber);

                    if (cell.mappedWeekIndex !== undefined) {
                      setWeekIndex(cell.mappedWeekIndex);
                      const matchedDay = weeks[cell.mappedWeekIndex].days.find((day) => day.endsWith(String(cell.dayNumber)));
                      if (matchedDay) {
                        setSelectedDay(matchedDay);
                      }
                    }
                  }}
                  className={cn(
                    "min-h-28 rounded-3xl border border-border/70 p-4 text-left shadow-sm",
                    cell.inMonth ? "bg-card hover:border-primary/30 hover:bg-primary/5" : "bg-muted/40 text-muted-foreground opacity-60",
                    selectedMonthDay === cell.dayNumber && "border-primary/30 bg-primary/6",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn("text-sm font-semibold", cell.inMonth ? "text-foreground" : "text-muted-foreground")}>
                      {cell.inMonth ? cell.dayNumber : ""}
                    </span>
                    {cell.eventCount > 0 ? (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        {cell.eventCount} {cell.eventCount === 1 ? "event" : "events"}
                      </span>
                    ) : null}
                  </div>
                  {cell.eventCount > 0 ? (
                    <p className="mt-6 text-sm leading-6 text-muted-foreground">
                      {cell.mappedWeekIndex === undefined ? "Light schedule" : "Tap to sync the weekly detail panel with this date."}
                    </p>
                  ) : (
                    <p className="mt-6 text-sm leading-6 text-muted-foreground">No major blocks planned.</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Selected day</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{selectedDay}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {selectedEvents.length > 0
                  ? "Use this panel to inspect the current day without losing context in the main calendar grid."
                  : "This day is open right now, which makes it a good candidate for a new request or deep work block."}
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
                        {event.start} - {event.end}
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
                No events are blocking this day in the mock schedule.
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
          <div className="mt-6 rounded-3xl bg-primary/8 p-4">
            <p className="text-sm font-semibold text-primary">Why this page is mock-first</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The UI now has working calendar interactions and day selection, while the data contract still stays simple enough to swap to the real calendar endpoints later.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
