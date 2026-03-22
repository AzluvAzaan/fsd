import Link from "next/link";
import { ArrowRight, Blocks, CalendarDays, Database, FormInput } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

const stack = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "TanStack Query",
  "React Hook Form",
  "Zod",
];

const structure = [
  "src/app — route entrypoints and layouts",
  "src/components — reusable UI and feature components",
  "src/lib — API client, env, query client, utilities",
  "src/hooks — custom hooks when needed later",
];

export default function Home() {
  return (
    <AppShell>
      <div className="grid gap-6">
        <section className="rounded-3xl border bg-background p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-medium text-muted-foreground">FSD web frontend</p>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Low-friction starter for building your product UI on top of the Go backend.
              </h2>
              <p className="text-base text-muted-foreground md:text-lg">
                This setup is intentionally simple: modern defaults, clean structure, and just enough plumbing to let you
                start shipping pages instead of wrestling config.
              </p>
            </div>

            <Link
              href="/dev/backend-test"
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 md:w-auto"
            >
              Test backend connection
              <ArrowRight />
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <Blocks className="mb-4 size-5 text-muted-foreground" />
            <h3 className="font-semibold">Starter stack</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {stack.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <FormInput className="mb-4 size-5 text-muted-foreground" />
            <h3 className="font-semibold">Ready for forms</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              React Hook Form + Zod are already installed so your auth, group, and event flows can stay clean from the start.
            </p>
          </div>

          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <CalendarDays className="mb-4 size-5 text-muted-foreground" />
            <h3 className="font-semibold">Calendar-friendly</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              You can keep the UI simple for now, then add FullCalendar later only if your scheduling views need more power.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <h3 className="font-semibold">Suggested working structure</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {structure.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <Database className="mb-4 size-5 text-muted-foreground" />
            <h3 className="font-semibold">Backend-first testing</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              There is a dev page that talks to your current user endpoints so you can verify the frontend is wired up before
              building real flows.
            </p>
            <Link
              href="/dev/backend-test"
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Open backend test page
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
