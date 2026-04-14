import Link from "next/link";

import { AppLogo } from "@/components/layout/app-logo";

type MarketingHeaderProps = {
  hideLoginButton?: boolean;
};

export function MarketingHeader({ hideLoginButton = false }: MarketingHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <AppLogo size={52} priority />
          <div>
            <p className="text-2xl font-semibold tracking-tight text-purple-600">SyncUp</p>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {!hideLoginButton && (
            <Link
              href="/login"
              className="inline-flex rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
