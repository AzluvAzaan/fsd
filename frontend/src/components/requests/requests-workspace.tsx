"use client";

import { useCallback, useEffect, useState } from "react";

import { RequestDetailModal } from "@/components/requests/request-detail-modal";
import { RequestList } from "@/components/requests/request-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  deleteEventRequest,
  getEventRequests,
  getGroupById,
  getSentEventRequests,
  getUserById,
  respondToEventRequest,
  type ApiEventRequest,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const typeFilters = ["all", "received", "sent"] as const;
type TypeFilter = (typeof typeFilters)[number];

type EnrichedRequest = {
  raw: ApiEventRequest;
  requestType: "received" | "sent";
  groupName: string;
  senderName: string;
};

export function RequestsWorkspace() {
  const [items, setItems] = useState<EnrichedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TypeFilter>("all");

  // Modal state
  const [modalItem, setModalItem] = useState<EnrichedRequest | null>(null);
  const [responding, setResponding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [received, sent] = await Promise.all([getEventRequests(), getSentEventRequests()]);

      // Collect unique group and sender IDs to batch-resolve names
      const groupIds = new Set([...received, ...sent].map((r) => r.groupId).filter(Boolean));
      const senderIds = new Set([...received, ...sent].map((r) => r.senderId).filter(Boolean));

      const [groupMap, senderMap] = await Promise.all([
        Promise.all([...groupIds].map((id) => getGroupById(id).then((g) => [id, g.name] as const).catch(() => [id, id] as const))).then(Object.fromEntries),
        Promise.all([...senderIds].map((id) => getUserById(id).then((u) => [id, u.displayName || u.email || id] as const).catch(() => [id, id] as const))).then(Object.fromEntries),
      ]);

      const enrich = (r: ApiEventRequest, requestType: "received" | "sent"): EnrichedRequest => ({
        raw: r,
        requestType,
        groupName: (groupMap as Record<string, string>)[r.groupId] ?? r.groupId,
        senderName: requestType === "sent" ? "You" : ((senderMap as Record<string, string>)[r.senderId] ?? r.senderId),
      });

      setItems([...received.map((r) => enrich(r, "received")), ...sent.map((r) => enrich(r, "sent"))]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const filtered = items.filter((item) => filter === "all" || item.requestType === filter);
  const pendingItems = filtered.filter((item) => item.raw.status === "pending");
  const seenItems = filtered.filter((item) => item.raw.status !== "pending");

  const handleClearAll = async () => {
    const ids = seenItems.map((item) => item.raw.id);
    await Promise.allSettled(ids.map((id) => handleDelete(id)));
  };

  const handleRespond = async (target: EnrichedRequest, decision: "accepted" | "rejected") => {
    setResponding(true);
    try {
      await respondToEventRequest(target.raw.id, decision);
      const nextStatus = decision === "accepted" ? "accepted" : "rejected";
      setItems((current) =>
        current.map((item) =>
          item.raw.id === target.raw.id
            ? { ...item, raw: { ...item.raw, status: nextStatus } }
            : item,
        ),
      );
      // Keep modal open but reflect new status
      if (modalItem?.raw.id === target.raw.id) {
        setModalItem((prev) =>
          prev ? { ...prev, raw: { ...prev.raw, status: nextStatus } } : null,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to respond");
    } finally {
      setResponding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteEventRequest(id);
      setItems((current) => current.filter((item) => item.raw.id !== id));
      if (modalItem?.raw.id === id) setModalItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete request");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Coordination"
        title="Requests"
        description="Track incoming and outgoing event proposals."
        actions={
          <div className="flex items-center rounded-full border border-border bg-card p-1">
            {typeFilters.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium capitalize",
                  filter === type
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
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
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl border border-border/70 bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No requests"
          body="Once group members send event proposals they will appear here."
        />
      ) : (
        <div className="space-y-8">
          {pendingItems.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Pending · {pendingItems.length}
              </p>
              <RequestList
                items={pendingItems}
                onOpenDetail={(item) => setModalItem(item)}
                onRespond={handleRespond}
                deletingId={deletingId}
              />
            </section>
          )}

          {seenItems.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Seen · {seenItems.length}
                </p>
                <button
                  type="button"
                  onClick={() => void handleClearAll()}
                  className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all
                </button>
              </div>
              <RequestList
                items={seenItems}
                onOpenDetail={(item) => setModalItem(item)}
                onDelete={(id) => void handleDelete(id)}
                deletingId={deletingId}
              />
            </section>
          )}
        </div>
      )}

      {modalItem && (
        <RequestDetailModal
          open={!!modalItem}
          request={modalItem.raw}
          requestType={modalItem.requestType}
          groupName={modalItem.groupName}
          senderName={modalItem.senderName}
          onClose={() => setModalItem(null)}
          onAccept={() => modalItem && handleRespond(modalItem, "accepted")}
          onDecline={() => modalItem && handleRespond(modalItem, "rejected")}
          responding={responding}
        />
      )}
    </div>
  );
}
