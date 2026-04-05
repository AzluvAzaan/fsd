import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-indigo-400 text-sm font-bold text-white shadow-lg shadow-primary/25">
            S
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">SyncUp</p>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Collaborative Calendar</p>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="font-medium text-muted-foreground transition hover:text-foreground">
            Log in
          </Link>
          <Link
            href="/app/calendar"
            className="shimmer-btn inline-flex rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-95"
          >
            Open workspace
          </Link>
        </nav>
      </div>
    </header>
  );
}
