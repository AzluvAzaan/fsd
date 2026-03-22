import Link from "next/link";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { SectionCard } from "@/components/shared/section-card";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center px-6 py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Welcome back</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight">Sign in and get straight back to planning.</h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">The production auth flow will later connect to Google. For now, this screen acts as the product shell and onboarding direction.</p>
          </div>
          <SectionCard>
            <h2 className="text-2xl font-semibold">Log in</h2>
            <p className="mt-2 text-sm text-muted-foreground">Use this as the future entry point for the Google auth flow.</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">Email</div>
              <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">Password</div>
              <button className="w-full rounded-full bg-primary px-4 py-3 font-medium text-primary-foreground">Continue</button>
              <button className="w-full rounded-full border border-border bg-background px-4 py-3 font-medium">Continue with Google</button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Need the app workspace right now? <Link href="/app/calendar" className="font-medium text-primary">Open the mock workspace</Link>.</p>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
