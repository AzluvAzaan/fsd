import type { RequestItem } from "@/lib/constants/mock-data";
import { requests } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type RequestListProps = {
  items?: RequestItem[];
  selectedRequestId?: string;
  onSelect?: (requestId: string) => void;
  onStatusChange?: (requestId: string, status: RequestItem["status"]) => void;
};

export function RequestList({
  items = requests,
  selectedRequestId,
  onSelect,
  onStatusChange,
}: RequestListProps) {
  return (
    <div className="space-y-4">
      {items.map((request) => (
        <div
          key={request.id}
          className={cn(
            "rounded-3xl border border-border/70 bg-card p-5 shadow-sm",
            selectedRequestId === request.id && "border-primary/30 bg-primary/5 shadow-primary/10",
          )}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <span>{request.type}</span>
                <span>•</span>
                <span>{request.group}</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold">{request.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Proposed by {request.from}</p>
              <p className="mt-3 text-sm font-medium text-primary">{request.proposedTime}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === "accepted" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : request.status === "declined" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-primary/10 text-primary"}`}>
              {request.status}
            </span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
            <button type="button" onClick={() => onSelect?.(request.id)} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
              View detail
            </button>
            {request.status === "pending" ? (
              <>
                <button
                  type="button"
                  onClick={() => onStatusChange?.(request.id, "accepted")}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => onStatusChange?.(request.id, "declined")}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Decline
                </button>
              </>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
