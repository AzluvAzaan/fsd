"use client";

import { useState } from "react";

import { RequestList } from "@/components/requests/request-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { requests, type RequestItem } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

const typeFilters = ["all", "received", "sent"] as const;
type TypeFilter = (typeof typeFilters)[number];

export function RequestsWorkspace() {
  const [items, setItems] = useState<RequestItem[]>(requests);
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [selectedRequestId, setSelectedRequestId] = useState(items[0]?.id ?? "");

  const filteredItems = items.filter((item) => filter === "all" || item.type === filter);
  const selectedRequest = filteredItems.find((item) => item.id === selectedRequestId) ?? filteredItems[0];

  const handleStatusChange = (requestId: string, status: RequestItem["status"]) => {
    setItems((current) => current.map((item) => (item.id === requestId ? { ...item, status } : item)));
    setSelectedRequestId(requestId);
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

      {filteredItems.length === 0 ? (
        <EmptyState title="No requests in this view" body="Try a different filter or check back when new requests arrive." />
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
                ? "This side panel keeps the currently selected request visible while you continue scanning the list."
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
