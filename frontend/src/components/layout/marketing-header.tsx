import Link from "next/link";

import { AppLogo } from "@/components/layout/app-logo";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition group-hover:-translate-y-0.5">
            <AppLogo size={56} priority />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight text-slate-900">SyncUp</p>
            <p className="-mt-0.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Free Slot Detector
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
