import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { fetchDashboardMetrics } from "@/lib/dashboard/queries";

export default async function DashboardPage() {
  const metrics = await fetchDashboardMetrics();

  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Executive Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Real-time workforce analytics and operational insights.
        </p>
      </div>
      <ExecutiveDashboard metrics={metrics} />
    </div>
  );
}
