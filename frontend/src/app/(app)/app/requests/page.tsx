import { PageHeader } from "@/components/shared/page-header";
import { RequestList } from "@/components/requests/request-list";

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Coordination" title="Requests" description="Pending and historical request flows live here. This page is already structured so the data source can move from mocks to the real request domain later." />
      <RequestList />
    </div>
  );
}
