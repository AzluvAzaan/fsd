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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="rounded-[2rem] border border-border/70 bg-card px-8 py-16 shadow-sm md:px-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-medium text-primary">Calendar coordination without the chaos</p>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance">Find shared free time faster with a calmer scheduling workflow.</h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">FSD helps individuals and groups align schedules, review requests, and move from “when are you free?” to an actual slot that works.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/app/calendar" className="inline-flex rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/25">Open workspace</Link>
                <Link href="/login" className="inline-flex rounded-full border border-border bg-background px-6 py-3 font-medium transition hover:bg-muted">Log in</Link>
              </div>
            </div>
            <SectionCard className="bg-muted/40 p-8">
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
                  <p className="font-medium">This week</p>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {['M','T','W','T','F'].map((day, index) => (
                      <div key={day + index} className={`rounded-2xl px-3 py-4 text-center text-sm ${index === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{day}</div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <SectionCard key={feature.title}>
                <Icon className="size-5 text-primary" />
                <h2 className="mt-4 text-xl font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
              </SectionCard>
            );
          })}
        </section>
      </main>
    </div>
  );
}
