import { LeaveDashboard } from "@/components/leaves/LeaveDashboard";
import { fetchLeaveRequests, fetchLeaveSummary } from "@/lib/leaves/queries";
import type { LeaveStatus } from "@/lib/leaves/utils";

type LeavesPageProps = {
  searchParams: Promise<{ tab?: string; q?: string }>;
};

const validTabs: LeaveStatus[] = ["pending", "approved", "rejected"];

function parseTab(value?: string): LeaveStatus {
  if (value && validTabs.includes(value as LeaveStatus)) {
    return value as LeaveStatus;
  }

  return "pending";
}

export default async function LeavesPage({ searchParams }: LeavesPageProps) {
  const params = await searchParams;
  const tab = parseTab(params.tab);
  const search = params.q ?? "";

  const [requests, summary] = await Promise.all([
    fetchLeaveRequests(),
    fetchLeaveSummary(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review pending requests, approve or reject leave, and track history.
        </p>
      </div>

      <LeaveDashboard
        requests={requests}
        summary={summary}
        initialTab={tab}
        initialSearch={search}
      />
    </div>
  );
}
