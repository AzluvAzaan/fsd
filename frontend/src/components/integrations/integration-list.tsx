import type { IntegrationItem } from "@/lib/constants/mock-data";
import { integrations } from "@/lib/constants/mock-data";
// Note: IntegrationList is only used in dev / non-connected contexts now.
import { cn } from "@/lib/utils";

type IntegrationListProps = {
  items?: IntegrationItem[];
  activeIntegrationId?: string;
  onAction?: (integrationId: string) => void;
};

export function IntegrationList({
  items = integrations,
  activeIntegrationId,
  onAction,
}: IntegrationListProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "rounded-3xl border border-border/70 bg-card p-6 shadow-sm",
            activeIntegrationId === item.id && "border-primary/30 bg-primary/5 shadow-primary/10",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">{item.status}</p>
              <h3 className="mt-1 text-xl font-semibold">{item.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onAction?.(item.id)}
            className="mt-5 inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            {item.actionLabel}
          </button>
        </div>
      ))}
    </div>
  );
}
