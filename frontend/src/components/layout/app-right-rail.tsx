"use client";

import { X } from "lucide-react";

import { notifications, requests, todayAgenda } from "@/lib/constants/mock-data";

type AppRightRailProps = {
  open: boolean;
  onClose: () => void;
};

export function AppRightRail({ open, onClose }: AppRightRailProps) {
  return (
    <aside
      style={{
        width: open ? "22rem" : 0,
        transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        flexShrink: 0,
      }}
      className="hidden 2xl:flex"
    >
      <div className="flex h-full w-[22rem] flex-col border-l border-border/70 bg-card/30">
        <div className="flex shrink-0 items-center justify-between px-6 pb-5 pt-7">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-muted-foreground/80">Today</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close panel"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <div className="flex-1 space-y-8 overflow-y-auto px-6 pb-8">
          <section>
            <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/60 p-6 shadow-sm">
              <h3 className="text-2xl font-semibold tracking-tight">Thursday, Oct 15</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">Your day at a glance</p>
            </div>
            <div className="mt-4 space-y-3">
              {todayAgenda.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
                  <p className="font-medium">{item.title}</p>
                  <p className={item.highlight ? "mt-1 text-sm font-medium text-primary" : "mt-1 text-sm text-muted-foreground"}>
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between">
              <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
                Pending requests
              </h4>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                {requests.filter((item) => item.status === "pending").length}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {requests
                .filter((item) => item.status === "pending")
                .slice(0, 2)
                .map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.group}</p>
                    <p className="mt-2 text-sm font-medium text-primary">{item.proposedTime}</p>
                  </div>
                ))}
            </div>
          </section>
          <section>
            <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
              Latest updates
            </h4>
            <div className="mt-4 space-y-3">
              {notifications.slice(0, 2).map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
}
