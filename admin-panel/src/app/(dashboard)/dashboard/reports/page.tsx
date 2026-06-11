import { ReportsDashboard } from "@/components/reports/ReportsDashboard";
import { fetchReportSummary, getDefaultReportRange } from "@/lib/reports/queries";

export default async function ReportsPage() {
  const { startDate, endDate } = getDefaultReportRange();
  const summary = await fetchReportSummary(startDate, endDate);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground">
          Export workforce analytics, attendance summaries, and leave reports.
        </p>
      </div>
      <ReportsDashboard
        summary={summary}
        defaultStartDate={startDate}
        defaultEndDate={endDate}
      />
    </div>
  );
}
