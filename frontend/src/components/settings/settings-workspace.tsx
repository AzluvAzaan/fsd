"use client";

import { useState } from "react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { cn } from "@/lib/utils";

export function SettingsWorkspace() {
  const [displayName, setDisplayName] = useState("Azluv");
  const [dailyDigest, setDailyDigest] = useState(true);
  const [compactCalendar, setCompactCalendar] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Local frontend preferences are ready to be wired to a real settings API later.");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="This route now has working frontend controls for profile and preference state, instead of static placeholder cards."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SectionCard>
            <p className="text-sm font-medium text-muted-foreground">Profile basics</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Account</h2>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Display name</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/40"
                />
              </label>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="mt-2 text-lg font-semibold">Owner</p>
              </div>
              <button
                type="button"
                onClick={() => setSaveMessage(`Saved mock profile settings for ${displayName || "this user"}.`)}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Save profile
              </button>
            </div>
          </SectionCard>

          <SectionCard>
            <p className="text-sm font-medium text-muted-foreground">Workspace preferences</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Behavior</h2>
            <div className="mt-6 space-y-4">
              {[
                {
                  label: "Daily digest notifications",
                  value: dailyDigest,
                  onChange: () => setDailyDigest((value) => !value),
                },
                {
                  label: "Compact calendar density",
                  value: compactCalendar,
                  onChange: () => setCompactCalendar((value) => !value),
                },
              ].map((setting) => (
                <button
                  key={setting.label}
                  type="button"
                  onClick={setting.onChange}
                  className="flex w-full items-center justify-between rounded-3xl border border-border/70 bg-background/70 px-4 py-4 text-left"
                >
                  <span className="font-medium">{setting.label}</span>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", setting.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                    {setting.value ? "On" : "Off"}
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <p className="text-sm font-medium text-muted-foreground">Appearance</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Theme</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The global theme switch already works. This page now gives it a real destination inside settings too.
            </p>
            <div className="mt-6 flex items-center justify-between rounded-3xl border border-border/70 bg-background/70 p-4">
              <div>
                <p className="font-medium">Color mode</p>
                <p className="mt-1 text-sm text-muted-foreground">Toggle between the light and dark workspace palettes.</p>
              </div>
              <ThemeToggle />
            </div>
          </SectionCard>

          <SectionCard>
            <p className="text-sm font-medium text-muted-foreground">Save state</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Status</h2>
            <div className="mt-6 rounded-3xl bg-primary/8 p-4">
              <p className="text-sm font-semibold text-primary">Frontend persistence placeholder</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{saveMessage}</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
