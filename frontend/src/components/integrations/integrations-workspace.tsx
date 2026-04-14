"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Plug } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { cn } from "@/lib/utils";

type SyncState = "idle" | "syncing" | "done" | "error";

type Integration = {
  id: string;
  name: string;
  description: string;
  status: string;
  connected: boolean;
};

const INTEGRATIONS: Integration[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description:
      "Primary sync source for pulling your busy slots and publishing accepted events back to your calendar. Use the sync button on the Calendar page to pull in your latest events.",
    status: "Connected",
    connected: true,
  },
  {
    id: "google-signin",
    name: "Google Sign-In",
    description:
      "Powers account login and session onboarding. Your identity is verified through your Google account.",
    status: "Authorized",
    connected: true,
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

export function IntegrationsWorkspace() {
  const [activeId, setActiveId] = useState(INTEGRATIONS[0]?.id ?? "");

  const integrations = INTEGRATIONS;
  const active = integrations.find((i) => i.id === activeId) ?? integrations[0];
  const connectedCount = integrations.filter((i) => i.connected).length;

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

                {active.id === "google-calendar" && (
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Syncing</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Use the sync button on your Calendar page to pull in the latest events from Google Calendar.
                    </p>
                  </div>
                )}

                {active.id === "google-signin" && (
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Session</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You are signed in via Google. Your identity is managed through the OAuth session established at login.
                    </p>
                  </div>
                )}

                {!active.connected && (
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Availability</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      The quick-add parser is planned for a future release.
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
