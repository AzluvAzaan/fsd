"use client";

import { Calendar, Clock, MapPin, MessageSquare, Users } from "lucide-react";

import { Modal } from "@/components/shared/modal";
import type { ApiEventRequest } from "@/lib/api";
import { cn } from "@/lib/utils";

type RequestDetailModalProps = {
  open: boolean;
  request: ApiEventRequest | null;
  /** Whether the current user is the recipient ("received") or sender ("sent"). */
  requestType: "received" | "sent";
  groupName: string;
  senderName: string;
  onClose: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  responding?: boolean;
};

function formatDateRange(start: string, end: string) {
  if (!start) return "Time not set";
  const s = new Date(start);
  const e = new Date(end);
  const date = s.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const startTime = s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endTime = e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const duration = Math.round((e.getTime() - s.getTime()) / 60000);
  const durationLabel = duration >= 60
    ? `${Math.floor(duration / 60)}h${duration % 60 > 0 ? ` ${duration % 60}m` : ""}`
    : `${duration}m`;
  return { date, time: `${startTime} – ${endTime}`, duration: durationLabel };
}

export function RequestDetailModal({
  open,
  request,
  requestType,
  groupName,
  senderName,
  onClose,
  onAccept,
  onDecline,
  responding = false,
}: RequestDetailModalProps) {
  if (!request) return null;

  const isPendingReceived = requestType === "received" && request.status === "pending";
  const formatted = formatDateRange(request.proposedStart, request.proposedEnd);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    rejected: "bg-red-500/10 text-red-500",
  };

  return (
    <Modal open={open} onClose={onClose} title={request.title} className="max-w-lg">
      {/* Status + type row */}
      <div className="flex items-center gap-2 mb-5">
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", statusColors[request.status] ?? "bg-muted text-muted-foreground")}>
          {request.status}
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-muted-foreground">
          {request.type || "meeting"}
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-muted-foreground">
          {requestType}
        </span>
      </div>

      <div className="space-y-3">
        {/* Date */}
        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
          <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{typeof formatted === "string" ? formatted : formatted.date}</p>
            {typeof formatted !== "string" && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {formatted.time}
                <span className="ml-2 text-xs opacity-60">{formatted.duration}</span>
              </p>
            )}
          </div>
        </div>

        {/* Time block */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
          <Clock className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Duration</p>
            <p className="mt-0.5 text-sm font-medium">
              {typeof formatted === "string" ? "—" : formatted.duration}
            </p>
          </div>
        </div>

        {/* Group */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
          <Users className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Group</p>
            <p className="mt-0.5 text-sm font-medium">{groupName || request.groupId}</p>
          </div>
        </div>

        {/* From */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
          <div className="flex size-4 shrink-0 items-center justify-center">
            <div className="size-4 rounded-full bg-primary/20 text-[9px] font-bold text-primary flex items-center justify-center">
              {(senderName || "?")[0].toUpperCase()}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {requestType === "sent" ? "From (you)" : "From"}
            </p>
            <p className="mt-0.5 text-sm font-medium">{senderName || request.senderId}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Location</p>
            <p className={cn("mt-0.5 text-sm font-medium", !request.location && "text-muted-foreground")}>
              {request.location || "—"}
            </p>
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
          <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</p>
            <p className={cn("mt-0.5 text-sm leading-relaxed", !request.note && "text-muted-foreground")}>
              {request.note || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Accept / Decline actions */}
      {isPendingReceived && (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={responding}
            onClick={onAccept}
            className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {responding ? "…" : "Accept"}
          </button>
          <button
            type="button"
            disabled={responding}
            onClick={onDecline}
            className="flex-1 rounded-full border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      )}
    </Modal>
  );
}
