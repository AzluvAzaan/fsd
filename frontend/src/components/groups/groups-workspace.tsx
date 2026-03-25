"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";

import { GroupGrid } from "@/components/groups/group-grid";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { groups, type Group } from "@/lib/constants/mock-data";
import { cn } from "@/lib/utils";

type PanelMode = "create" | "join" | null;

const initialGroup = groups[0]?.id ?? "";

export function GroupsWorkspace() {
  const [items, setItems] = useState<Group[]>(groups);
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [activeGroupId, setActiveGroupId] = useState(initialGroup);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("Create a new mock group or simulate joining one with an invite code.");

  const activeGroup = items.find((group) => group.id === activeGroupId) ?? items[0];

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;

    const id = groupName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const nextGroup: Group = {
      id,
      name: groupName.trim(),
      description: groupDescription.trim() || "New mock coordination group ready for UI review.",
      members: 1,
      role: "Owner",
      nextWindow: "Best overlap: Set after invites",
      accent: "from-violet-500 to-indigo-500",
    };

    setItems([nextGroup, ...items]);
    setActiveGroupId(nextGroup.id);
    setGroupName("");
    setGroupDescription("");
    setPanelMode(null);
    setMessage(`Created ${nextGroup.name} in frontend mock state.`);
  };

  const handleJoinGroup = () => {
    const normalizedCode = inviteCode.trim();
    if (!normalizedCode) return;

    const joinedGroup: Group = {
      id: normalizedCode.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "invite-group",
      name: `Invite ${normalizedCode.toUpperCase()}`,
      description: "Joined from a mock invite code. Replace with backend invite validation later.",
      members: 4,
      role: "Member",
      nextWindow: "Best overlap: Fri 3:00 PM",
      accent: "from-indigo-500 to-sky-500",
    };

    const existing = items.find((group) => group.id === joinedGroup.id);
    const nextItems = existing ? items : [joinedGroup, ...items];

    setItems(nextItems);
    setActiveGroupId(joinedGroup.id);
    setInviteCode("");
    setPanelMode(null);
    setMessage(`Joined ${joinedGroup.name} in frontend mock state.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Collaboration"
        title="Your groups"
        description="The groups landing page now includes working create and join flows in local frontend state, so the route is useful before the real group endpoints are ready."
        actions={
          <>
            <button
              type="button"
              onClick={() => setPanelMode(panelMode === "join" ? null : "join")}
              className={cn(
                "rounded-full border border-border px-4 py-2 text-sm font-medium",
                panelMode === "join" ? "border-primary/30 bg-primary/10 text-primary" : "bg-card hover:bg-muted",
              )}
            >
              Join group
            </button>
            <button
              type="button"
              onClick={() => setPanelMode(panelMode === "create" ? null : "create")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium",
                panelMode === "create" ? "bg-primary/90 text-primary-foreground" : "bg-primary text-primary-foreground",
              )}
            >
              Create group
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Active groups</p>
          <p className="mt-3 text-3xl font-semibold">{items.length}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Mock groups you can browse immediately through the rest of the app.</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Selected workspace</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{activeGroup?.name}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeGroup?.nextWindow}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Interaction state</p>
          <p className="mt-3 text-base font-semibold">{message}</p>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <GroupGrid items={items} activeGroupId={activeGroupId} onSelect={setActiveGroupId} />
        </div>

        <div className="space-y-6">
          <SectionCard>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selected group</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{activeGroup?.name}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeGroup?.description}</p>
              </div>
              <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="mt-2 text-lg font-semibold">{activeGroup?.role}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">Members</p>
                <p className="mt-2 text-lg font-semibold">{activeGroup?.members}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">Next overlap</p>
                <p className="mt-2 text-lg font-semibold">{activeGroup?.nextWindow}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mock flow panel</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {panelMode === "create" ? "Create group" : panelMode === "join" ? "Join group" : "Choose an action"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {panelMode === "create"
                    ? "This form adds a new mock group card immediately."
                    : panelMode === "join"
                      ? "Simulate invite-driven entry without the backend yet."
                      : "Open one of the actions above to test the page flow."}
                </p>
              </div>
              <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Plus className="size-5" />
              </div>
            </div>

            {panelMode === "create" ? (
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium">Group name</span>
                  <input
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/40"
                    placeholder="FSD Design Sprint"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Description</span>
                  <textarea
                    value={groupDescription}
                    onChange={(event) => setGroupDescription(event.target.value)}
                    className="mt-2 min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/40"
                    placeholder="Describe what this group coordinates."
                  />
                </label>
                <button type="button" onClick={handleCreateGroup} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Add mock group
                </button>
              </div>
            ) : null}

            {panelMode === "join" ? (
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium">Invite code</span>
                  <input
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/40"
                    placeholder="fsd-core-invite"
                  />
                </label>
                <button type="button" onClick={handleJoinGroup} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Join in mock mode
                </button>
              </div>
            ) : null}

            {panelMode === null ? (
              <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted/30 p-5 text-sm leading-6 text-muted-foreground">
                Use this side panel to turn the dead header buttons into working UI flows without depending on backend group creation yet.
              </div>
            ) : null}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
