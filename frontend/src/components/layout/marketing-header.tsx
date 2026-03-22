import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary shadow-lg shadow-primary/20" />
          <div>
            <p className="text-lg font-semibold tracking-tight">SyncUp</p>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Collaborative Calendar</p>
          </div>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="text-muted-foreground transition hover:text-foreground">Log in</Link>
          <Link href="/app/calendar" className="inline-flex rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-95">Open workspace</Link>
        </nav>
      </div>
    </header>
  );
}
