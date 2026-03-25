"use client";

import { useState } from "react";

import { IntegrationList } from "@/components/integrations/integration-list";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { integrations, type IntegrationItem } from "@/lib/constants/mock-data";

const nextIntegrationState: Record<string, Pick<IntegrationItem, "status" | "actionLabel">> = {
  "google-calendar": { status: "Connection drafted", actionLabel: "Connected in mock mode" },
  "gmail-auth": { status: "Flow reviewed", actionLabel: "Ready for backend hook-up" },
  "text-parser": { status: "UI placeholder approved", actionLabel: "Mock design captured" },
};

export function IntegrationsWorkspace() {
  const [items, setItems] = useState<IntegrationItem[]>(integrations);
  const [activeIntegrationId, setActiveIntegrationId] = useState(items[0]?.id ?? "");

  const activeIntegration = items.find((item) => item.id === activeIntegrationId) ?? items[0];

  const handleAction = (integrationId: string) => {
    setActiveIntegrationId(integrationId);
    setItems((current) =>
      current.map((item) =>
        item.id === integrationId
          ? { ...item, status: nextIntegrationState[integrationId]?.status ?? item.status, actionLabel: nextIntegrationState[integrationId]?.actionLabel ?? item.actionLabel }
          : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Connections"
        title="Integrations"
        description="The integration cards now respond to actions in local state so you can iterate on status messaging and layout before auth and sync endpoints are fully available."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Configured cards</p>
          <p className="mt-3 text-3xl font-semibold">{items.length}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Current focus</p>
          <p className="mt-3 text-xl font-semibold">{activeIntegration?.name}</p>
        </SectionCard>
        <SectionCard className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <p className="mt-3 text-base font-semibold">{activeIntegration?.status}</p>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <IntegrationList items={items} activeIntegrationId={activeIntegration?.id} onAction={handleAction} />

        <SectionCard>
          <p className="text-sm font-medium text-muted-foreground">Integration detail</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{activeIntegration?.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeIntegration?.description}</p>

          {activeIntegration ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">Current status</p>
                <p className="mt-2 text-lg font-semibold">{activeIntegration.status}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">Primary CTA</p>
                <p className="mt-2 text-lg font-semibold">{activeIntegration.actionLabel}</p>
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </div>
  );
}
