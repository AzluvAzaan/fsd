"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { SectionCard } from "@/components/shared/section-card";
import { env } from "@/lib/env";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

function LoginCard() {
  const params = useSearchParams();
  const hasError = params.get("error") === "auth_failed";
  const googleLoginUrl = `${env.apiBaseUrl}/auth/google/login`;

  return (
    <SectionCard className="p-8">
      <h2 className="text-2xl font-semibold">Sign in</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Use your Google account to access your workspace.
      </p>

      {hasError && (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Sign-in failed. Please try again.
        </div>
      )}

      <div className="mt-8 space-y-3">
        <a
          href={googleLoginUrl}
          className="shimmer-btn flex w-full items-center justify-center gap-3 rounded-full bg-primary px-4 py-3.5 font-medium text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-95"
        >
          <GoogleIcon />
          Continue with Google
        </a>
      </div>

    </SectionCard>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader hideLoginButton />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-6 py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Welcome back</p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight lg:text-6xl">
              Sign in and get straight back to planning.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Connect your Google account to sync your calendar, manage group
              availability, and coordinate schedules — all in one place.
            </p>
          </div>
          <Suspense
            fallback={
              <SectionCard className="p-8">
                <div className="h-40 animate-pulse rounded-2xl bg-muted" />
              </SectionCard>
            }
          >
            <LoginCard />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
