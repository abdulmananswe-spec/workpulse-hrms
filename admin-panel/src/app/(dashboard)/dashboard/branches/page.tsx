import { BranchManagement } from "@/components/branches/BranchManagement";
import { fetchBranches } from "@/lib/branches/queries";

export default async function BranchesPage() {
  const branches = await fetchBranches();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Branch Management</h2>
        <p className="text-sm text-muted-foreground">
          Add branches manually with GPS coordinates and geofence radius. Assign branches to
          employees from the Employee Directory.
        </p>
      </div>

      <BranchManagement branches={branches} />
    </div>
  );
}
