import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList } from "lucide-react";

export default function AttendanceRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Attendance Requests
        </h2>
        <p className="text-sm text-muted-foreground">
          Review and approve manual attendance correction requests from employees.
        </p>
      </div>
      <EmptyState
        icon={ClipboardList}
        title="Correction queue coming soon"
        description="Employee attendance correction requests will appear here for admin review."
      />
    </div>
  );
}
