import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Preferences" title="Settings" description="Theme, account, and future preferences belong here. This page gives the app a complete main-nav destination while the product is still forming." />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard>
          <h2 className="text-xl font-semibold">Appearance</h2>
          <p className="mt-2 text-sm text-muted-foreground">Dark mode is already supported globally through the shared theme setup.</p>
        </SectionCard>
        <SectionCard>
          <h2 className="text-xl font-semibold">Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Later this will reflect real user session data and linked integrations.</p>
        </SectionCard>
      </div>
    </div>
  );
}
