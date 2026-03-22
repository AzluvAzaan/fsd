import { integrations } from "@/lib/constants/mock-data";

export function IntegrationList() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {integrations.map((item) => (
        <div key={item.id} className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">{item.status}</p>
              <h3 className="mt-1 text-xl font-semibold">{item.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
          <button className="mt-5 inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted">{item.actionLabel}</button>
        </div>
      ))}
    </div>
  );
}
