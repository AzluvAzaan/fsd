import Link from "next/link";

import { GroupGrid } from "@/components/groups/group-grid";
import { PageHeader } from "@/components/shared/page-header";

export default function GroupsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Collaboration"
        title="Your groups"
        description="Build and review the UI with mock group data now, then replace the data source once the group endpoints are implemented."
        actions={
          <>
            <button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">Join group</button>
            <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create group</button>
          </>
        }
      />
      <GroupGrid />
      <div className="text-sm text-muted-foreground">Need a detail view example? Open <Link href="/app/groups/fsd-core" className="font-medium text-primary">FSD Core</Link>.</div>
    </div>
  );
}
