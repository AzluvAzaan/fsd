import Image from "next/image";
import { Sparkles } from "lucide-react";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { GooglePopupLoginButton } from "@/components/shared/google-popup-login-button";

type LandingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readError(searchParams: Record<string, string | string[] | undefined> | undefined) {
  const value = searchParams?.error;
  return Array.isArray(value) ? value[0] : value;
}

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const hasAuthError = readError(resolvedSearchParams) === "auth_failed";

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <MarketingHeader />
      <main className="relative mx-auto max-w-7xl px-6 py-10 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] rounded-[3rem] opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 20% 18%, rgba(91,77,255,0.16), transparent 28%), radial-gradient(circle at 78% 24%, rgba(255,176,64,0.2), transparent 24%), radial-gradient(circle at 55% 70%, rgba(110,231,255,0.12), transparent 28%)",
          }}
        />

        <section className="relative overflow-hidden rounded-[2.4rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(239,237,255,0.72))] px-6 py-10 shadow-[0_32px_90px_-56px_rgba(23,24,28,0.45)] sm:px-8 md:px-12 md:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 bottom-0 size-72 rounded-full opacity-45 blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(91,77,255,0.18), transparent 72%)",
            }}
          />
          <div
            aria-hidden="true"
            className="animate-orb pointer-events-none absolute -right-12 top-8 size-72 rounded-full opacity-45 blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(255,176,64,0.24), transparent 72%)",
            }}
          />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.92fr)]">
            <div className="max-w-2xl lg:pr-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                <Sparkles className="size-3.5 text-[#5b4dff]" />
                Free slot detector
              </div>

              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-balance text-slate-900 md:text-6xl xl:text-[4.4rem]">
                Find shared free time without the scheduling chaos.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                SyncUp keeps planning simple. Sign in with Google, check overlap, and lock in the
                best slot in seconds.
              </p>

              {hasAuthError ? (
                <div className="mt-8 rounded-[1.4rem] border border-destructive/25 bg-destructive/8 px-5 py-4 text-sm text-destructive shadow-sm">
                  Sign-in failed. Please try again.
                </div>
              ) : null}

              <div className="mt-8 max-w-sm">
                <GooglePopupLoginButton label="Continue with Google" />
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[32rem]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-8 h-72 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(91,77,255,0.2) 0%, rgba(255,176,64,0.2) 48%, transparent 74%)",
                }}
              />
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_30px_70px_-45px_rgba(23,24,28,0.45)] sm:p-6">
                <div className="rounded-[1.6rem] bg-[linear-gradient(160deg,rgba(239,237,255,0.95),rgba(255,255,255,0.9))] p-4 sm:p-6">
                  <div className="mx-auto aspect-square w-full max-w-[25rem] rounded-[1.4rem] bg-[radial-gradient(circle,rgba(255,255,255,0.95),rgba(240,235,255,0.82),rgba(255,255,255,0.78))] p-4">
                    <Image
                      src="/rabbit.png"
                      alt="SyncUp rabbit mascot"
                      width={420}
                      height={420}
                      priority
                      className="h-full w-full object-contain drop-shadow-[0_20px_35px_rgba(91,77,255,0.2)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
