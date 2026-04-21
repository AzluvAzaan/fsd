"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { Modal } from "@/components/shared/modal";
import { PageHeader } from "@/components/shared/page-header";
import { createGroup, getGroups, joinGroup, type ApiGroup } from "@/lib/api";
import { type Group } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type ModalMode = "create" | "join" | null;

// Adapt real API group to the UI shape (accent cycles through preset colors)
const ACCENTS = [
  "from-violet-500 to-indigo-500",
  "from-fuchsia-500 to-violet-500",
  "from-indigo-500 to-sky-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
];

function apiGroupToUIGroup(g: ApiGroup, index: number): Group {
  return {
    id: g.id,
    name: g.name,
    description: `Invite code: ${g.inviteCode}`,
    members: 1,
    role: "Owner",
    nextWindow: "Set after members join",
    accent: ACCENTS[index % ACCENTS.length],
  };
}

export function GroupsWorkspace() {
  const [items, setItems] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getGroups()
      .then((data) => setItems(data.map(apiGroupToUIGroup)))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    setSubmitting(true);
    try {
      const created = await createGroup(groupName.trim());
      const uiGroup = apiGroupToUIGroup(created, items.length);
      setItems((prev) => [uiGroup, ...prev]);
      setGroupName("");
      setGroupDescription("");
      setModalMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinGroup = async () => {
    const code = inviteCode.trim();
    if (!code) return;
    setSubmitting(true);
    try {
      await joinGroup(code);
      const data = await getGroups();
      setItems(data.map(apiGroupToUIGroup));
      setInviteCode("");
      setModalMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Collaboration"
          title="Your groups"
          description="Coordinate with your teams, view merged calendars, and find the best time to meet."
          actions={
            <>
              <button
                type="button"
                onClick={() => setModalMode("join")}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Join group
              </button>
              <button
                type="button"
                onClick={() => setModalMode("create")}
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="size-4" />
                Create group
              </button>
            </>
          }
        />

        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-[2rem] border border-border/70 bg-card" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/50 py-24 text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Users className="size-6" />
            </div>
            <p className="text-lg font-semibold">No groups yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Create a group or join one with an invite code.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* Create group modal */}
      <Modal
        open={modalMode === "create"}
        onClose={() => setModalMode(null)}
        title="Create a group"
        description="Set up a new coordination group and invite your team."
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Group name</span>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50"
              placeholder="FSD Design Sprint"
              autoFocus
            />
          </label>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || submitting}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              {submitting ? "Creating…" : "Create group"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Join group modal */}
      <Modal
        open={modalMode === "join"}
        onClose={() => setModalMode(null)}
        title="Join a group"
        description="Enter an invite code to join an existing group."
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Invite code</span>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50"
              placeholder="fsd-core-invite"
              autoFocus
            />
          </label>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleJoinGroup}
              disabled={!inviteCode.trim() || submitting}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              {submitting ? "Joining…" : "Join group"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function GroupCard({ group }: { group: Group }) {
  return (
    <article className="flex flex-col rounded-[2rem] border border-border/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="p-6">
        <div className={`mb-5 h-1.5 w-20 rounded-full bg-gradient-to-r ${group.accent}`} />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight">{group.name}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{group.description}</p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
              group.role === "Owner"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {group.role}
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
          <span>{group.members} members</span>
          <span className="font-medium text-foreground">{group.nextWindow}</span>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-border/60 px-6 py-4">
        <span className="text-xs text-muted-foreground">Calendar · Availability</span>
        <Link
          href={`/app/groups/${group.id}`}
          className="rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          Open →
        </Link>
      </div>
    </article>
  );
}
