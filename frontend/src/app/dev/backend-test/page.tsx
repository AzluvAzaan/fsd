import { AppShell } from "@/components/layout/app-shell";
import { BackendTestForm } from "@/components/backend/backend-test-form";
import { env } from "@/lib/env";

export default function BackendTestPage() {
  return (
    <AppShell>
      <div className="mb-6 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Developer page</p>
        <h2 className="text-3xl font-semibold tracking-tight">Backend test bench</h2>
        <p className="max-w-3xl text-muted-foreground">
          Use this page to verify your frontend can talk to the Go backend before you start building real product flows.
          The current page focuses on the working <code>/users</code> endpoints because those are the most complete backend
          slice right now.
        </p>
        <p className="text-sm text-muted-foreground">
          API base URL: <span className="font-medium text-foreground">{env.apiBaseUrl}</span>
        </p>
      </div>

      <BackendTestForm />
    </AppShell>
  );
}
