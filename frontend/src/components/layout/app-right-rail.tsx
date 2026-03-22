import { notifications, requests, todayAgenda } from "@/lib/constants/mock-data";

export function AppRightRail() {
  return (
    <aside className="hidden w-88 shrink-0 border-l border-border/70 bg-card/30 p-6 xl:block">
      <div className="space-y-8">
        <section>
          <h3 className="text-2xl font-semibold tracking-tight">Thursday, Oct 15</h3>
          <p className="mt-1 text-sm text-muted-foreground">Your day at a glance</p>
          <div className="mt-5 space-y-3">
            {todayAgenda.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border/70 bg-card p-4">
                <p className="font-medium">{item.title}</p>
                <p className={item.highlight ? "mt-1 text-sm font-medium text-primary" : "mt-1 text-sm text-muted-foreground"}>{item.time}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pending requests</h4>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{requests.filter((item) => item.status === "pending").length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {requests.filter((item) => item.status === "pending").slice(0, 2).map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/70 bg-card p-4">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.group}</p>
                <p className="mt-2 text-sm font-medium text-primary">{item.proposedTime}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Latest updates</h4>
          <div className="mt-4 space-y-3">
            {notifications.slice(0, 2).map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/70 bg-card p-4">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
