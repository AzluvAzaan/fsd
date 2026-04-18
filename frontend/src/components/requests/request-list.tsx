"use client";

import { Calendar } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ApiEventRequest } from "@/lib/api";

type EnrichedRequest = {
  raw: ApiEventRequest;
  requestType: "received" | "sent";
  groupName: string;
  senderName: string;
};

type RequestListProps = {
  items: EnrichedRequest[];
  onOpenDetail: (item: EnrichedRequest) => void;
  onRespond?: (item: EnrichedRequest, decision: "accepted" | "rejected") => void;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
};

function formatTime(start: string, end: string) {
  if (!start) return "—";
  const s = new Date(start);
  const e = new Date(end);
  const date = s.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const t1 = s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const t2 = e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${t1} – ${t2}`;
}

const statusStyle: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/10 text-red-500",
};

export function RequestList({ items, onOpenDetail, onRespond, onDelete, deletingId }: RequestListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const { raw, requestType, groupName, senderName } = item;
        const isPendingReceived = requestType === "received" && raw.status === "pending";
        const isResolved = raw.status === "accepted" || raw.status === "rejected";

        return (
          <div
            key={raw.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpenDetail(item)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpenDetail(item)}
            className="w-full text-left rounded-3xl border border-border/70 bg-card px-5 py-4 shadow-sm transition-all cursor-pointer hover:border-primary/30 hover:bg-primary/5 hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Eyebrow: type · group */}
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {requestType} · {groupName}
                </p>

                {/* Title */}
                <h3 className="mt-1.5 truncate text-lg font-semibold">{raw.title}</h3>

                {/* Time */}
                <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="size-3.5 shrink-0" />
                  <span>{formatTime(raw.proposedStart, raw.proposedEnd)}</span>
                </div>

                {/* Sender */}
                {requestType === "received" && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    From <span className="font-medium text-foreground">{senderName}</span>
                  </p>
                )}
              </div>

              {/* Status badge */}
              <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize", statusStyle[raw.status] ?? "bg-muted text-muted-foreground")}>
                {raw.status}
              </span>
            </div>

            {/* Accept / Decline — stop propagation so button clicks don't open modal */}
            {isPendingReceived && onRespond && (
              <div
                className="mt-4 flex gap-2 border-t border-border/50 pt-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onRespond(item, "accepted")}
                  className="rounded-full bg-primary px-5 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => onRespond(item, "rejected")}
                  className="rounded-full border border-border bg-background px-5 py-1.5 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  Decline
                </button>
              </div>
            )}

            {/* Delete — shown for resolved requests to allow cleanup */}
            {isResolved && onDelete && (
              <div
                className="mt-3 border-t border-border/50 pt-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={deletingId === raw.id}
                  onClick={() => onDelete(raw.id)}
                  className="text-xs font-medium text-destructive hover:underline disabled:opacity-50"
                >
                  {deletingId === raw.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
