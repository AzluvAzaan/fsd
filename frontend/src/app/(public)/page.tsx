import Link from "next/link";
import { CalendarDays, Link2, Users } from "lucide-react";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { SectionCard } from "@/components/shared/section-card";

const features = [
  {
    icon: CalendarDays,
    title: "Personal and group calendars",
    body: "See your own schedule, shared timelines, and upcoming requests in one clean workspace.",
  },
  {
    icon: Users,
    title: "Collaborative availability",
    body: "Compare overlap across members without turning scheduling into a chaotic group chat.",
  },
  {
    icon: Link2,
    title: "Integration-ready foundation",
    body: "Built to connect with Google Calendar and future integrations once the backend catches up.",
  },
];

const featureDelays = ["delay-700", "delay-[900ms]", "delay-1000"] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-6 py-20">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card px-10 py-24 shadow-sm md:px-16">
          {/* Ambient orb */}
          <div
            aria-hidden="true"
            className="animate-orb pointer-events-none absolute -right-32 -top-32 size-[600px] rounded-full opacity-25 blur-[100px] dark:opacity-15"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--primary) 60%, #a78bfa 40%), transparent 70%)",
            }}
          />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left: copy */}
            <div>
              <p className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500 text-sm font-medium text-primary">
                Calendar coordination without the chaos
              </p>
              <h1 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-600 delay-150 mt-5 text-5xl font-semibold tracking-tight text-balance lg:text-6xl">
                <span className="text-gradient-primary">Find shared free time faster</span>{" "}
                with a calmer scheduling workflow.
              </h1>
              <p className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500 delay-300 mt-6 max-w-2xl text-lg text-muted-foreground">
                FSD helps individuals and groups align schedules, review requests, and move from
                &ldquo;when are you free?&rdquo; to an actual slot that works.
              </p>
              <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 delay-500 mt-9 flex flex-wrap gap-3">
                <Link
                  href="/app/calendar"
                  className="shimmer-btn inline-flex rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground shadow-lg shadow-primary/30 transition hover:opacity-95 hover:shadow-xl hover:shadow-primary/40"
                >
                  Open workspace
                </Link>
                <Link
                  href="/login"
                  className="inline-flex rounded-full border border-border bg-background px-7 py-3.5 font-medium transition hover:bg-muted"
                >
                  Log in
                </Link>
              </div>
            </div>

            {/* Right: preview card */}
            <div className="animate-in fade-in slide-in-from-right-8 fill-mode-both duration-700 delay-400">
              <SectionCard className="animate-float bg-muted/40 p-8" style={{ animationDelay: "1.2s" }}>
                <div className="rounded-3xl bg-background p-6 shadow-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-primary/10 p-4">
                      <p className="text-sm font-medium text-primary">Best overlap</p>
                      <p className="mt-2 text-2xl font-semibold">Tue 2:00 PM</p>
                      <p className="mt-1 text-sm text-muted-foreground">4 of 5 members free</p>
                    </div>
                    <div className="rounded-2xl bg-muted p-4">
                      <p className="text-sm font-medium">Pending requests</p>
                      <p className="mt-2 text-2xl font-semibold">2</p>
                      <p className="mt-1 text-sm text-muted-foreground">Awaiting review</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-border/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">This week</p>
                      <p className="text-xs text-muted-foreground">Mon–Fri</p>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {["M", "T", "W", "T", "F"].map((day, index) => (
                        <div
                          key={day + index}
                          className={`rounded-2xl px-3 py-4 text-center text-sm ${
                            index === 3
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="size-2 shrink-0 rounded-full bg-primary" />
                        <p className="flex-1 text-xs text-muted-foreground">Team standup</p>
                        <p className="text-xs font-medium">9:00 AM</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="size-2 shrink-0 rounded-full bg-violet-400" />
                        <p className="flex-1 text-xs text-muted-foreground">Design review</p>
                        <p className="text-xs font-medium">2:30 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <SectionCard
                key={feature.title}
                className={`animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500 ${featureDelays[index]}`}
              >
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
              </SectionCard>
            );
          })}
        </section>
      </main>
    </div>
  );
}
