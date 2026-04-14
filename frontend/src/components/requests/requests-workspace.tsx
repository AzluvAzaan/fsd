"use client";

import { useEffect, useState } from "react";

import { RequestList } from "@/components/requests/request-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { getEventRequests, respondToEventRequest, type ApiEventRequest } from "@/lib/api";
import { type RequestItem } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

const typeFilters = ["all", "received", "sent"] as const;
type TypeFilter = (typeof typeFilters)[number];

function formatProposedTime(start: string, end: string): string {
  if (!start) return "Time not set";
  const s = new Date(start);
  const e = new Date(end);
  const datePart = s.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const startTime = s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endTime = e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${startTime} – ${endTime}`;
}

function apiRequestToUIRequest(r: ApiEventRequest): RequestItem {
  return {
    id: r.id,
    title: r.title || "Event request",
    type: "received", // ListPending only returns requests where current user is recipient
    group: r.groupId,
    proposedTime: formatProposedTime(r.proposedStart, r.proposedEnd),
    status: r.status === "rejected" ? "declined" : (r.status as RequestItem["status"]),
    from: r.senderId,
  };
}

export function RequestsWorkspace() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<TypeFilter>("all");
  const [selectedRequestId, setSelectedRequestId] = useState("");

  useEffect(() => {
    getEventRequests()
      .then((data) => {
        const mapped = data.map(apiRequestToUIRequest);
        setItems(mapped);
        setSelectedRequestId(mapped[0]?.id ?? "");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter((item) => filter === "all" || item.type === filter);
  const selectedRequest = filteredItems.find((item) => item.id === selectedRequestId) ?? filteredItems[0];

  const handleStatusChange = async (requestId: string, status: RequestItem["status"]) => {
    setSelectedRequestId(requestId);
    const decision = status === "accepted" ? "accepted" : "rejected";
    try {
      await respondToEventRequest(requestId, decision);
      setItems((current) =>
        current.map((item) => (item.id === requestId ? { ...item, status } : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to respond to request");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Coordination"
        title="Requests"
        description="Track incoming and outgoing event proposals. Filter by type and respond to pending requests."
        actions={
          <div className="flex items-center rounded-full border border-border bg-card p-1">
            {typeFilters.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium capitalize",
                  filter === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        }
      />

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl border border-border/70 bg-card" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No requests in this view"
          body="You have no pending requests. Once group members send you event proposals, they will appear here."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <RequestList
            items={filteredItems}
            selectedRequestId={selectedRequest?.id}
            onSelect={setSelectedRequestId}
            onStatusChange={handleStatusChange}
          />

          <SectionCard>
            <p className="text-sm font-medium text-muted-foreground">Request detail</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{selectedRequest?.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {selectedRequest
                ? "Keep the currently selected request visible while you scan the list."
                : "Select a request to inspect its details."}
            </p>

            {selectedRequest ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Group</p>
                  <p className="mt-2 text-lg font-semibold">{selectedRequest.group}</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Proposed time</p>
                  <p className="mt-2 text-lg font-semibold">{selectedRequest.proposedTime}</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-medium text-muted-foreground">From</p>
                  <p className="mt-2 text-lg font-semibold">{selectedRequest.from}</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{selectedRequest.status}</p>
                </div>
              </div>
            ) : null}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
