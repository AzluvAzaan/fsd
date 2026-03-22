import { IntegrationList } from "@/components/integrations/integration-list";
import { PageHeader } from "@/components/shared/page-header";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Connections" title="Integrations" description="Google-facing connection surfaces belong here later. For now this page defines the structure and messaging direction." />
      <IntegrationList />
    </div>
  );
}
