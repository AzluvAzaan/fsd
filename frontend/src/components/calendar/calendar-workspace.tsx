"use client";

import { useEffect, useRef, useState } from "react";
import type { DatesSetArg, EventContentArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { ChevronLeft, ChevronRight, Clock3, Layers3, RefreshCw, Sparkles, X } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { buttonVariants } from "@/components/ui/button";
import { getCalendar, syncGoogleCalendar } from "@/lib/api";
import {
  availabilitySlots,
  groupMembers,
  memberSchedules,
  type CalendarEvent,
} from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type CalendarWorkspaceProps = {
  scope?: "personal" | "group";
  groupName?: string;
};

type CompositeEntry = {
  memberName: string;
  title: string;
  color: string;
};

type CompositeCalendarEvent = {
  id: string;
  startAt: string;
  endAt: string;
  entries: CompositeEntry[];
};

type PersonalEventCategory = "Work" | "School" | "Social" | "Personal";

type HoverTooltip = {
  entries: CompositeEntry[];
  timeRange: string;
  x: number;
  y: number;
} | null;

type DetailPopupEntry = {
  label: string;
  title: string;
  color: string;
  detail?: string;
  avatarText?: string;
};

type ClickedEvent = {
  entries: DetailPopupEntry[];
  timeRange: string;
  x: number;
  y: number;
} | null;

type DayPopup = {
  dateKey: string;
  x: number;
  y: number;
  width: number;
  maxHeight: number;
} | null;

const VIEWPORT_GUTTER = 12;
const DAY_POPUP_WIDTH = 360;
const DAY_POPUP_HEIGHT = 560;

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

const personalCategoryMeta: Record<PersonalEventCategory, { color: string; keywords: string[] }> = {
  Work: {
    color: "#7c3aed",
    keywords: ["sync", "review", "build", "planning", "sprint", "demo", "client", "crit", "design", "work", "retro"],
  },
  School: {
    color: "#0284c7",
    keywords: ["mentor", "research", "study", "class", "lecture", "assignment", "lab", "tutorial"],
  },
  Social: {
    color: "#d97706",
    keywords: ["coffee", "catch-up", "lunch", "dinner", "meetup", "hangout"],
  },
  Personal: {
    color: "#16a34a",
    keywords: [],
  },
};

function getPersonalEventCategory(event: CalendarEvent): PersonalEventCategory {
  const text = `${event.title} ${event.group ?? ""}`.toLowerCase();
  for (const category of ["Social", "School", "Work"] as const) {
    if (personalCategoryMeta[category].keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }
  return "Personal";
}

// Flat raw events (used for bottom panels / member breakdown)
const groupCalendarEvents: CalendarEvent[] = Object.entries(memberSchedules).flatMap(
  ([memberName, evts]) => evts.map((ev) => ({ ...ev, memberName })),
);

// Composite events: merge all events with the exact same start+end time into one block.
// This ensures FullCalendar renders ONE block per time slot instead of N narrow columns.
const compositeGroupEvents: CompositeCalendarEvent[] = (() => {
  const byKey = new Map<string, CompositeCalendarEvent>();
  for (const [memberName, memberEvts] of Object.entries(memberSchedules)) {
    const member = groupMembers.find((m) => m.name === memberName);
    const color = member?.color ?? "#7c3aed";
    for (const ev of memberEvts) {
      const key = `${ev.startAt}|${ev.endAt}`;
      if (byKey.has(key)) {
        byKey.get(key)!.entries.push({ memberName, title: ev.title, color });
      } else {
        byKey.set(key, {
          id: `cmp-${byKey.size}`,
          startAt: ev.startAt,
          endAt: ev.endAt,
          entries: [{ memberName, title: ev.title, color }],
        });
      }
    }
  }
  return Array.from(byKey.values());
})();

function toCompositeEventInput(ev: CompositeCalendarEvent): EventInput {
  return { id: ev.id, start: ev.startAt, end: ev.endAt, extendedProps: { entries: ev.entries } };
}

// Per-day member colors for group month view dots
const memberColorsByDay = (() => {
  const map = new Map<string, string[]>();
  for (const ev of compositeGroupEvents) {
    const day = ev.startAt.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    for (const entry of ev.entries) {
      if (!map.get(day)!.includes(entry.color)) map.get(day)!.push(entry.color);
    }
  }
  return map;
})();

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
  return `${eventTimeFormatter.format(start)} – ${eventTimeFormatter.format(end)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getFloatingPopupPosition(rect: DOMRect, popupWidth: number, popupHeight: number) {
  const x = clamp(
    rect.right + 12 + popupWidth > window.innerWidth ? rect.left - popupWidth - 12 : rect.right + 12,
    VIEWPORT_GUTTER,
    Math.max(VIEWPORT_GUTTER, window.innerWidth - popupWidth - VIEWPORT_GUTTER),
  );
  const y = clamp(
    rect.top,
    VIEWPORT_GUTTER,
    Math.max(VIEWPORT_GUTTER, window.innerHeight - popupHeight - VIEWPORT_GUTTER),
  );

  return { x, y };
}

function getPersonalEventDetail(event: CalendarEvent): DetailPopupEntry {
  const category = getPersonalEventCategory(event);
  const detailParts = [];
  if (event.group) detailParts.push(event.group);
  if (event.tone === "highlight") detailParts.push("Priority");
  if (event.tone === "muted") detailParts.push("Focus block");

  return {
    label: category,
    title: event.title,
    color: personalCategoryMeta[category].color,
    detail: detailParts.length > 0 ? detailParts.join(" · ") : "Personal calendar",
    avatarText: category[0],
  };
}

function toEventInput(event: CalendarEvent): EventInput {
  const category = getPersonalEventCategory(event);
  return {
    id: event.id,
    title: event.title,
    start: event.startAt,
    end: event.endAt,
    extendedProps: {
      tone: event.tone ?? "default",
      group: event.group,
      memberName: event.memberName,
      accentColor: event.memberName ? undefined : personalCategoryMeta[category].color,
      category,
    },
  };
}

type SyncState = "idle" | "syncing" | "done" | "error";

export function CalendarWorkspace({ scope = "personal", groupName = "FSD Core" }: CalendarWorkspaceProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  // Personal events fetched from the real API
  const [personalEvents, setPersonalEvents] = useState<CalendarEvent[]>([]);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [lastSyncCount, setLastSyncCount] = useState<number | null>(null);

  const events = scope === "personal" ? personalEvents : groupCalendarEvents;
  const calendarFeedEvents = scope === "personal"
    ? events.map(toEventInput)
    : compositeGroupEvents.map(toCompositeEventInput);

  const todayKey = getDateKey(new Date());
  const [calendarTitle, setCalendarTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [visibleRange, setVisibleRange] = useState(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  });
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip>(null);
  const [clickedEvent, setClickedEvent] = useState<ClickedEvent>(null);
  const [dayPopup, setDayPopup] = useState<DayPopup>(null);

  // Prevent SSR rendering of FullCalendar (avoids hydration mismatch + flushSync errors)
  useEffect(() => { setMounted(true); }, []);

  // Fetch real calendar events on mount (personal scope only)
  useEffect(() => {
    if (scope !== "personal") return;
    fetchCalendar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  function fetchCalendar() {
    getCalendar().then((view) => {
      setPersonalEvents(
        (view.events ?? []).map((e) => ({
          id: e.id,
          title: e.title,
          startAt: e.startTime,
          endAt: e.endTime,
          tone: "default" as const,
        })),
      );
    }).catch(() => {
      // leave events empty — calendar still renders correctly showing current week
    });
  }

  async function handleSync() {
    if (syncState === "syncing") return;
    setSyncState("syncing");
    try {
      const result = await syncGoogleCalendar();
      setLastSyncCount(result.synced);
      setSyncState("done");
      fetchCalendar(); // refresh calendar after sync
    } catch {
      setSyncState("error");
    }
  }

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

  useEffect(() => { if (viewMode !== "month") setDayPopup(null); }, [viewMode]);

  const selectedEvents = events
    .filter((event) => getDateKey(event.startAt) === selectedDate)
    .sort((left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime());

  const rangeEvents = events.filter((event) => {
    const start = new Date(event.startAt);
    const end = new Date(event.endAt);
    return start < visibleRange.end && end > visibleRange.start;
  });

  const selectedDayLabel = formatSelectedDay(selectedDate);

  // Compute personal color dots and legend dynamically from live events
  const personalColorsByDay = (() => {
    const map = new Map<string, string[]>();
    for (const ev of personalEvents) {
      const day = ev.startAt.slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      const cat = getPersonalEventCategory(ev);
      map.get(day)!.push(personalCategoryMeta[cat].color);
    }
    return map;
  })();

  const personalLegendItems = (() => {
    const usedCats = new Set(personalEvents.map(getPersonalEventCategory));
    return (Object.keys(personalCategoryMeta) as PersonalEventCategory[])
      .filter((c) => usedCats.has(c))
      .map((c) => ({ label: c, color: personalCategoryMeta[c].color }));
  })();

  const dayPopupEvents = dayPopup
    ? events
        .filter((e) => e.startAt.slice(0, 10) === dayPopup.dateKey)
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    : [];
  const dayPopupMemberBreakdown = dayPopup && scope === "group"
    ? groupMembers
        .map((m) => ({ member: m, events: dayPopupEvents.filter((e) => e.memberName === m.name) }))
        .filter(({ events }) => events.length > 0)
    : [];

  // Per-member breakdown for the selected day (group scope only)
  const selectedMemberBreakdown = scope === "group"
    ? groupMembers.map((member) => ({
        member,
        events: events
          .filter((e) => e.memberName === member.name && getDateKey(e.startAt) === selectedDate)
          .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
      }))
    : [];

  const summaryCards = [
    {
      label: scope === "group" ? "Combined events" : "Scheduled blocks",
      value: `${rangeEvents.length}`,
      note: scope === "group"
        ? `Across ${groupMembers.length} members this week.`
        : viewMode === "week" ? "Across the visible week." : "Inside the visible month.",
      icon: Layers3,
    },
    {
      label: "Focused day",
      value: selectedDayLabel,
      note: scope === "group"
        ? `${selectedEvents.length} event${selectedEvents.length === 1 ? "" : "s"} across members.`
        : `${selectedEvents.length} item${selectedEvents.length === 1 ? "" : "s"} selected.`,
      icon: Clock3,
    },
    {
      label: "Open windows",
      value: `${availabilitySlots.length}`,
      note: "Best overlap slots identified this week.",
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
    <div className="space-y-4">
      {scope === "personal" ? (
        <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-border/70 bg-card/90 px-7 py-5 shadow-sm">
          <div>
            <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground">Personal calendar</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{calendarTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
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
            <button
              type="button"
              onClick={handleSync}
              disabled={syncState === "syncing"}
              title={
                syncState === "done" && lastSyncCount !== null
                  ? `Synced ${lastSyncCount} event${lastSyncCount === 1 ? "" : "s"}`
                  : syncState === "error"
                  ? "Sync failed — try again"
                  : "Sync Google Calendar"
              }
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-lg" }),
                "rounded-full bg-card",
                syncState === "done" && "border-emerald-400/50 text-emerald-600 dark:text-emerald-400",
                syncState === "error" && "border-destructive/50 text-destructive",
              )}
              aria-label="Sync Google Calendar"
            >
              <RefreshCw className={cn("size-4", syncState === "syncing" && "animate-spin")} />
            </button>
          </div>
        </div>
      ) : (
        <PageHeader
          eyebrow="Group calendar"
          title={calendarTitle}
          description={`Combined view of all ${groupName} member schedules. Find overlap windows and coordinate meetings.`}
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
      )}

      {scope === "group" && (
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
      )}

      <SectionCard className="overflow-hidden p-0">
        {(scope === "group" || personalLegendItems.length > 0) && (
          <div className="flex flex-wrap gap-2 border-b border-border/60 px-3 py-3 sm:px-4 lg:px-6">
            {scope === "group"
              ? groupMembers.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5"
                  >
                    <span
                      className="inline-block size-2.5 rounded-full flex-shrink-0"
                      style={{ background: member.color }}
                    />
                    <span className="text-xs font-semibold">{member.name}</span>
                  </div>
                ))
              : personalLegendItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5"
                  >
                    <span
                      className="inline-block size-2.5 rounded-full flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                ))}
          </div>
        )}
        <div className="fsd-calendar overflow-x-auto p-3 sm:p-4 lg:p-6">
          <div className="min-w-[760px]">
            {mounted ? (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                initialDate={new Date().toISOString()}
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
                height={viewMode === "week" ? "auto" : 660}
                eventDisplay="block"
                slotEventOverlap={false}
                events={calendarFeedEvents}
                datesSet={handleDatesSet}
                dateClick={(arg) => {
                  const dateKey = getDateKey(arg.date);
                  setSelectedDate(dateKey);
                  setClickedEvent(null);
                  if (viewMode === "month") {
                    const rect = (arg.dayEl as HTMLElement).getBoundingClientRect();
                    const pw = Math.min(DAY_POPUP_WIDTH, window.innerWidth - VIEWPORT_GUTTER * 2);
                    const maxHeight = Math.min(DAY_POPUP_HEIGHT, window.innerHeight - VIEWPORT_GUTTER * 2);
                    let x = rect.left;
                    let y = rect.bottom + 6;
                    if (y + maxHeight > window.innerHeight - VIEWPORT_GUTTER) y = rect.top - maxHeight - 6;
                    x = clamp(x, VIEWPORT_GUTTER, Math.max(VIEWPORT_GUTTER, window.innerWidth - pw - VIEWPORT_GUTTER));
                    y = clamp(y, VIEWPORT_GUTTER, Math.max(VIEWPORT_GUTTER, window.innerHeight - maxHeight - VIEWPORT_GUTTER));
                    setDayPopup({ dateKey, x, y, width: pw, maxHeight });
                  } else {
                    setDayPopup(null);
                  }
                }}
                dayCellContent={(arg) => {
                  if (arg.view.type !== "dayGridMonth") return undefined;
                  const day = getDateKey(arg.date);
                  const colors = scope === "group"
                    ? (memberColorsByDay.get(day) ?? [])
                    : (personalColorsByDay.get(day) ?? []);
                  return (
                    <div className="fsd-daycell-inner">
                      <span className="fsd-daycell-number">{arg.dayNumberText}</span>
                      {colors.length > 0 && (
                        <div className="fsd-daycell-bars">
                          {colors.slice(0, 5).map((color, index) => (
                            <span key={`${color}-${index}`} className="fsd-daycell-bar" style={{ background: `${color}50` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }}
                eventClick={(arg) => {
                  if (arg.event.start) {
                    setSelectedDate(getDateKey(arg.event.start));
                  }
                  const rect = arg.el.getBoundingClientRect();
                  const popupWidth = 264;

                  if (scope === "group") {
                    const entries = (arg.event.extendedProps.entries as CompositeEntry[]).map((entry) => {
                      const member = groupMembers.find((m) => m.name === entry.memberName);
                      return {
                        label: entry.memberName,
                        title: entry.title,
                        color: entry.color,
                        detail: member?.availability,
                        avatarText: entry.memberName[0],
                      };
                    });
                    const popupHeight = 80 + entries.length * 56;
                    const { x, y } = getFloatingPopupPosition(rect, popupWidth, popupHeight);
                    setClickedEvent({
                      entries,
                      timeRange: arg.event.start && arg.event.end
                        ? `${eventTimeFormatter.format(arg.event.start)} – ${eventTimeFormatter.format(arg.event.end)}`
                        : "",
                      x,
                      y,
                    });
                    return;
                  }

                  const event = personalEvents.find((item) => item.id === arg.event.id);
                  if (!event) return;
                  const entries = [getPersonalEventDetail(event)];
                  const popupHeight = 136;
                  const { x, y } = getFloatingPopupPosition(rect, popupWidth, popupHeight);
                  setClickedEvent({
                    entries,
                    timeRange: arg.event.start && arg.event.end
                      ? `${eventTimeFormatter.format(arg.event.start)} – ${eventTimeFormatter.format(arg.event.end)}`
                      : "",
                    x,
                    y,
                  });
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
                eventClassNames={() => ["fc-event-shell"]}
                eventMouseEnter={(arg) => {
                  const entries = arg.event.extendedProps.entries as CompositeEntry[];
                  const rect = arg.el.getBoundingClientRect();
                  const tooltipWidth = 230;
                  const x = rect.right + 10 + tooltipWidth > window.innerWidth
                    ? rect.left - tooltipWidth - 10
                    : rect.right + 10;
                  if (scope === "group") {
                    setHoverTooltip({
                      entries,
                      timeRange: arg.event.start && arg.event.end
                        ? `${eventTimeFormatter.format(arg.event.start)} – ${eventTimeFormatter.format(arg.event.end)}`
                        : "",
                      x,
                      y: rect.top,
                    });
                    return;
                  }

                  const tone = arg.event.extendedProps.tone as CalendarEvent["tone"];
                  const category = (arg.event.extendedProps.category as PersonalEventCategory | undefined) ?? "Personal";
                  const accentColor = (arg.event.extendedProps.accentColor as string | undefined) ?? "#7c3aed";
                  setHoverTooltip({
                    entries: [{
                      memberName: category,
                      title: arg.event.title,
                      color: accentColor,
                    }],
                    timeRange: arg.event.start && arg.event.end
                      ? `${eventTimeFormatter.format(arg.event.start)} – ${eventTimeFormatter.format(arg.event.end)}`
                      : "",
                    x,
                    y: rect.top,
                  });
                }}
                eventMouseLeave={() => setHoverTooltip(null)}
                eventContent={(arg: EventContentArg) => {
                  if (scope === "group") {
                    const entries = arg.event.extendedProps.entries as CompositeEntry[];
                    return (
                      <div
                        style={{
                          height: "100%",
                          margin: "0 3px",
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                          borderRadius: "5px",
                          border: `1px solid ${entries[0]?.color ?? "#7c3aed"}28`,
                        }}
                      >
                        {entries.map((entry) => (
                          <div
                            key={entry.memberName}
                            style={{ flex: 1, background: `${entry.color}52`, minHeight: 4 }}
                          />
                        ))}
                      </div>
                    );
                  }

                  if (arg.view.type === "dayGridMonth") {
                    return (
                      <div
                        className="fc-event-pill"
                        style={{
                          background: `${((arg.event.extendedProps.accentColor as string | undefined) ?? "#7c3aed")}22`,
                          borderColor: `${((arg.event.extendedProps.accentColor as string | undefined) ?? "#7c3aed")}32`,
                          borderLeftColor: `${((arg.event.extendedProps.accentColor as string | undefined) ?? "#7c3aed")}7a`,
                        }}
                      >
                        <p className="fc-event-pill__title">{arg.event.title}</p>
                      </div>
                    );
                  }
                  const accentColor = (arg.event.extendedProps.accentColor as string | undefined) ?? "#7c3aed";
                  return (
                    <div
                      className="fc-event-personal-bar"
                      style={{
                        borderColor: `${accentColor}22`,
                        background: `${accentColor}4d`,
                      }}
                    />
                  );
                }}
              />
            ) : (
              <div style={{ height: viewMode === "week" ? 720 : 560 }} className="rounded-3xl bg-muted/20" />
            )}
          </div>
        </div>
      </SectionCard>

      {scope === "group" && (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <SectionCard>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selected day</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{selectedDayLabel}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {selectedEvents.length > 0
                    ? "Member schedules for this day. Free members are available for coordination."
                    : "No one has events on this day — a wide-open window for the whole group."}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                {`${selectedMemberBreakdown.filter((m) => m.events.length > 0).length} busy`}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {selectedMemberBreakdown.map(({ member, events: memberDayEvents }) => (
                <div key={member.name} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="inline-block size-2.5 rounded-full flex-shrink-0 mt-0.5"
                        style={{ background: member.color }}
                      />
                      <p className="text-sm font-semibold">{member.name}</p>
                    </div>
                    {memberDayEvents.length > 0 ? (
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold flex-shrink-0"
                        style={{ background: `${member.color}18`, color: member.color }}
                      >
                        {memberDayEvents.length} event{memberDayEvents.length === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground flex-shrink-0">
                        Free
                      </span>
                    )}
                  </div>
                  {memberDayEvents.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 pl-5">
                      {memberDayEvents.map((ev) => (
                        <p key={ev.id} className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{ev.title}</span>
                          {" · "}
                          {formatEventTimeRange(ev.startAt, ev.endAt)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <p className="text-sm font-medium text-muted-foreground">Overlap analysis</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Best meeting windows</h2>
            <div className="mt-6 space-y-3">
              {availabilitySlots.map((slot) => (
                <div key={slot.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-sm">{slot.date}</p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary flex-shrink-0">
                      {slot.confidence}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-primary">{slot.time}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{slot.note}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {slot.participants.map((name) => {
                      const member = groupMembers.find((m) => m.name === name);
                      return (
                        <span
                          key={name}
                          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={member ? { background: `${member.color}18`, color: member.color } : undefined}
                        >
                          <span
                            className="inline-block size-1.5 rounded-full flex-shrink-0"
                            style={{ background: member?.color }}
                          />
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {hoverTooltip && !clickedEvent && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-2xl border border-border/80 bg-card shadow-xl p-3.5"
          style={{ left: hoverTooltip.x, top: hoverTooltip.y, minWidth: 190, maxWidth: 240 }}
        >
          <div className="space-y-1.5">
            {hoverTooltip.entries.map((entry) => (
              <div key={entry.memberName} className="flex items-center gap-2">
                <span
                  className="inline-block size-2 rounded-full flex-shrink-0"
                  style={{ background: entry.color }}
                />
                <p className="text-xs font-semibold flex-shrink-0" style={{ color: entry.color }}>
                  {entry.memberName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{entry.title}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs font-medium text-muted-foreground border-t border-border/60 pt-2">
            {hoverTooltip.timeRange}
          </p>
        </div>
      )}

      {clickedEvent && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setClickedEvent(null)} />
          <div
            className="fixed z-[9999] w-64 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl"
            style={{ left: clickedEvent.x, top: clickedEvent.y }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground">{clickedEvent.timeRange}</p>
              <button
                type="button"
                onClick={() => setClickedEvent(null)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div className="divide-y divide-border/50">
              {clickedEvent.entries.map((entry) => {
                return (
                  <div key={`${entry.label}-${entry.title}`} className="flex items-start gap-3 px-4 py-3">
                    <span
                      className="mt-0.5 inline-flex size-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ background: entry.color }}
                    >
                      {entry.avatarText ?? entry.label[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight" style={{ color: entry.color }}>
                        {entry.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">{entry.title}</p>
                      {entry.detail && (
                        <p className="mt-1 text-xs leading-4 text-muted-foreground/70">{entry.detail}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {dayPopup && (() => {
        const d = new Date(`${dayPopup.dateKey}T00:00:00`);
        const weekday = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
        const dayNum = d.getDate();

        // Mini timeGrid constants — mirrors slotMinTime/slotMaxTime
        const GRID_START_H = 8;
        const GRID_END_H = 18;
        const GRID_MINS = (GRID_END_H - GRID_START_H) * 60; // 600
        const GRID_PX = 420; // total grid height px
        const PX_MIN = GRID_PX / GRID_MINS; // 0.7 px/min
        const HOURS = Array.from({ length: GRID_END_H - GRID_START_H + 1 }, (_, i) => GRID_START_H + i);
        const LABEL_COL_W = 52;
        const EVENT_GUTTER_X = 10;
        const GRID_PAD_TOP = 18;
        const GRID_PAD_BOTTOM = 0;
        const GRID_FRAME_H = GRID_PX + GRID_PAD_TOP + GRID_PAD_BOTTOM;

        const toTop = (iso: string) => {
          const dt = new Date(iso);
          return Math.max(0, GRID_PAD_TOP + (dt.getHours() * 60 + dt.getMinutes() - GRID_START_H * 60) * PX_MIN);
        };
        const toH = (s: string, e: string) => {
          const mins = (new Date(e).getTime() - new Date(s).getTime()) / 60000;
          return Math.max(14, mins * PX_MIN);
        };

        const grpEvs = compositeGroupEvents.filter(ev => ev.startAt.slice(0, 10) === dayPopup.dateKey);
        const persEvs = personalEvents.filter((ev: CalendarEvent) => ev.startAt.slice(0, 10) === dayPopup.dateKey);
        const isEmpty = scope === "group" ? grpEvs.length === 0 : persEvs.length === 0;
        const HEADER_H = 84;
        const FOOTER_H = scope === "group" && !isEmpty ? 52 : 0;
        const BODY_MAX_H = Math.max(220, dayPopup.maxHeight - HEADER_H - FOOTER_H);

        const busyMemberNames = scope === "group"
          ? new Set(grpEvs.flatMap(ev => ev.entries.map(e => e.memberName)))
          : new Set<string>();
        const freeCount = groupMembers.length - busyMemberNames.size;

        return (
          <>
            <div className="fixed inset-0 z-[9990]" onClick={() => setDayPopup(null)} />
            <div
              className="animate-in fade-in zoom-in-95 fixed z-[9991] origin-top overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl duration-150"
              style={{ left: dayPopup.x, top: dayPopup.y, width: dayPopup.width, maxHeight: dayPopup.maxHeight }}
            >
              {/* Column header — mirrors week view day header */}
              <div className="flex items-center justify-between border-b border-border/60 bg-background/60 px-4 py-3">
                <div className="flex flex-col items-start">
                  <span className="text-[0.6rem] font-black tracking-[0.15em] text-muted-foreground">{weekday}</span>
                  <span className="text-[2rem] font-black leading-none tracking-tight">{dayNum}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {!isEmpty && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {scope === "group"
                        ? `${grpEvs.length} slot${grpEvs.length === 1 ? "" : "s"}`
                        : `${persEvs.length} event${persEvs.length === 1 ? "" : "s"}`}
                    </span>
                  )}
                  <button type="button" onClick={() => setDayPopup(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>

              {isEmpty ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  {scope === "group" ? "Everyone is free — great window for a meeting." : "Nothing scheduled — a clear window."}
                </p>
              ) : (
                <div className="overflow-y-auto" style={{ maxHeight: BODY_MAX_H }}>
                  {/* Time grid */}
                  <div className="relative px-3" style={{ height: GRID_FRAME_H }}>
                    {/* Hour lines + labels */}
                    {HOURS.map((hr) => {
                      const y = GRID_PAD_TOP + (hr - GRID_START_H) * 60 * PX_MIN;
                      const label = hr === 12 ? "12PM" : hr > 12 ? `${hr - 12}PM` : `${hr}AM`;
                      return (
                        <div key={hr} className="absolute left-0 right-0 flex items-start" style={{ top: y }}>
                          <span
                            className="flex-shrink-0 pr-2 text-right text-[0.62rem] font-bold leading-none text-muted-foreground"
                            style={{ width: LABEL_COL_W, marginTop: -6 }}
                          >
                            {label}
                          </span>
                          <div className="flex-1 border-t border-dashed border-border/40" />
                        </div>
                      );
                    })}

                    {/* Events */}
                    <div
                      className="absolute"
                      style={{
                        left: LABEL_COL_W + EVENT_GUTTER_X,
                        right: EVENT_GUTTER_X,
                        top: 0,
                        height: GRID_FRAME_H,
                      }}
                    >
                      {scope === "group"
                        ? grpEvs.map((ev) => (
                            <div
                              key={ev.id}
                              className="absolute left-0 right-0"
                              style={{ top: toTop(ev.startAt), height: toH(ev.startAt, ev.endAt) }}
                              onMouseEnter={(event) => {
                                const rect = event.currentTarget.getBoundingClientRect();
                                const tooltipWidth = 230;
                                const x = rect.right + 10 + tooltipWidth > window.innerWidth
                                  ? rect.left - tooltipWidth - 10
                                  : rect.right + 10;
                                setHoverTooltip({
                                  entries: ev.entries,
                                  timeRange: formatEventTimeRange(ev.startAt, ev.endAt),
                                  x,
                                  y: clamp(rect.top, VIEWPORT_GUTTER, Math.max(VIEWPORT_GUTTER, window.innerHeight - 140)),
                                });
                              }}
                              onMouseLeave={() => setHoverTooltip(null)}
                            >
                              <div
                                className="h-full overflow-hidden rounded-[0.7rem] border"
                                style={{
                                  margin: "0 2px",
                                  borderColor: `${ev.entries[0]?.color ?? "#7c3aed"}2f`,
                                  background: "color-mix(in srgb, var(--card) 82%, white 18%)",
                                }}
                              >
                                <div className="flex h-full flex-col overflow-hidden">
                                  {ev.entries.map((entry) => (
                                    <div key={entry.memberName} style={{ flex: 1, background: `${entry.color}42`, minHeight: 4 }} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))
                        : persEvs.sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()).map((ev: CalendarEvent) => {
                            const accentColor = personalCategoryMeta[getPersonalEventCategory(ev)].color;
                            return (
                              <div
                                key={ev.id}
                                className="absolute left-0 right-0 overflow-hidden"
                                style={{
                                  top: toTop(ev.startAt),
                                  height: toH(ev.startAt, ev.endAt),
                                  margin: "0 2px",
                                  borderRadius: "0.6rem",
                                  border: `1px solid ${accentColor}30`,
                                  borderLeft: `3px solid ${accentColor}80`,
                                  background: `${accentColor}22`,
                                  padding: "3px 6px",
                                }}
                                onClick={(event) => {
                                  const rect = event.currentTarget.getBoundingClientRect();
                                  const entries = [getPersonalEventDetail(ev)];
                                  const popupHeight = 136;
                                  const { x, y } = getFloatingPopupPosition(rect, 264, popupHeight);
                                  setClickedEvent({
                                    entries,
                                    timeRange: formatEventTimeRange(ev.startAt, ev.endAt),
                                    x,
                                    y,
                                  });
                                }}
                              >
                                <p className="text-[0.55rem] font-black uppercase tracking-wide leading-none text-muted-foreground">
                                  {formatEventTimeRange(ev.startAt, ev.endAt)}
                                </p>
                                <p className="mt-0.5 overflow-hidden text-[0.7rem] font-bold leading-tight" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                                  {ev.title}
                                </p>
                              </div>
                            );
                          })
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* Footer — group only */}
              {scope === "group" && !isEmpty && (
                <div className="flex items-center gap-3 border-t border-border/60 bg-background/40 px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{busyMemberNames.size}</span> busy
                  </span>
                  {freeCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">{freeCount}</span> free
                    </span>
                  )}
                  <div className="ml-auto flex gap-1">
                    {groupMembers.map((m) => (
                      <span
                        key={m.name}
                        className="inline-block size-2 rounded-full flex-shrink-0"
                        style={{ background: busyMemberNames.has(m.name) ? m.color : `${m.color}30` }}
                        title={m.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}
