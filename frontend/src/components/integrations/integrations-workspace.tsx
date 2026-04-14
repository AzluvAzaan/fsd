"use client";

import { useState } from "react";
import { CheckCircle2, RefreshCw, Clock, Plug } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { syncGoogleCalendar } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type SyncState = "idle" | "syncing" | "done" | "error";

type Integration = {
  id: string;
  name: string;
  description: string;
  status: string;
  connected: boolean;
};

function buildIntegrations(isLoggedIn: boolean): Integration[] {
  return [
    {
      id: "google-calendar",
      name: "Google Calendar",
      description:
        "Primary sync source for pulling your busy slots and publishing accepted events back to your calendar.",
      status: isLoggedIn ? "Connected" : "Not connected",
      connected: isLoggedIn,
    },
    {
      id: "google-signin",
      name: "Google Sign-In",
      description:
        "Powers account login and session onboarding. Your identity is verified through your Google account.",
      status: isLoggedIn ? "Authorized" : "Not authorized",
      connected: isLoggedIn,
    },
    {
      id: "text-parser",
      name: "Quick Add Parser",
      description:
        "Natural language event creation — type something like \"team lunch Friday 1pm\" and it creates the event.",
      status: "Coming soon",
      connected: false,
    },
  ];
}

export function IntegrationsWorkspace() {
  const isLoggedIn = !!getStoredUser();
  const integrations = buildIntegrations(isLoggedIn);

  const [activeId, setActiveId] = useState(integrations[0]?.id ?? "");
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [lastSyncCount, setLastSyncCount] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const active = integrations.find((i) => i.id === activeId) ?? integrations[0];
  const connectedCount = integrations.filter((i) => i.connected).length;

  async function handleSync() {
    if (!isLoggedIn || syncState === "syncing") return;
    setSyncState("syncing");
    setSyncError(null);
    try {
      const result = await syncGoogleCalendar();
      setLastSyncCount(result.synced);
      setSyncState("done");
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Sync failed");
      setSyncState("error");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Connections"
        title="Integrations"
        description="Connect your calendars and external services to keep your schedule in sync across platforms."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Connected services</p>
          <p className="mt-3 text-3xl font-semibold">{connectedCount}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Current focus</p>
          <p className="mt-3 text-xl font-semibold">{active?.name}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <p className="mt-3 text-base font-semibold">{active?.status}</p>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Integration cards */}
        <div className="grid gap-4 lg:grid-cols-2">
          {integrations.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={cn(
                "rounded-3xl border border-border/70 bg-card p-6 shadow-sm text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                activeId === item.id && "border-primary/30 bg-primary/5 shadow-primary/10",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl",
                    item.connected
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.connected ? <CheckCircle2 className="size-4" /> : <Plug className="size-4" />}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      item.connected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                    )}
                  >
                    {item.status}
                  </p>
                  <h3 className="mt-0.5 text-base font-semibold">{item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <SectionCard>
          {active && (
            <>
              <p className="text-sm font-medium text-muted-foreground">Integration detail</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{active.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{active.description}</p>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Current status</p>
                  <div className="mt-2 flex items-center gap-2">
                    {active.connected ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <Clock className="size-4 text-muted-foreground" />
                    )}
                    <p className="text-lg font-semibold">{active.status}</p>
                  </div>
                </div>

                {/* Google Calendar sync action */}
                {active.id === "google-calendar" && isLoggedIn && (
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Sync calendar</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pull your latest events from Google Calendar into Free Slot Detector.
                    </p>

                    {syncState === "done" && lastSyncCount !== null && (
                      <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Synced {lastSyncCount} event{lastSyncCount === 1 ? "" : "s"} successfully.
                      </p>
                    )}
                    {syncState === "error" && syncError && (
                      <p className="mt-2 text-sm text-destructive">{syncError}</p>
                    )}

                    <button
                      type="button"
                      onClick={handleSync}
                      disabled={syncState === "syncing"}
                      className="mt-4 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      <RefreshCw className={cn("size-4", syncState === "syncing" && "animate-spin")} />
                      {syncState === "syncing" ? "Syncing…" : syncState === "done" ? "Sync again" : "Sync now"}
                    </button>
                  </div>
                )}

                {/* Google Sign-In — already authorized */}
                {active.id === "google-signin" && isLoggedIn && (
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Session</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You are signed in via Google. Your identity is managed through the OAuth session established at login.
                    </p>
                  </div>
                )}

                {/* Not connected / coming soon states */}
                {!active.connected && (
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      {active.id === "text-parser" ? "Availability" : "Action"}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {active.id === "text-parser"
                        ? "The quick-add parser is planned for a future release."
                        : "Sign in with Google on the login page to connect this integration."}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
