import { requests } from "@/lib/constants/mock-data";

export function RequestList() {
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <span>{request.type}</span>
                <span>•</span>
                <span>{request.group}</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold">{request.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Proposed by {request.from}</p>
              <p className="mt-3 text-sm font-medium text-primary">{request.proposedTime}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === "accepted" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : request.status === "declined" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-primary/10 text-primary"}`}>
              {request.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
