import { Suspense } from "react";

import { AttendanceDashboard } from "@/components/attendance/AttendanceDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAdminAttendanceData } from "@/lib/attendance/queries";

type AttendancePageProps = {
  searchParams: Promise<{
    date?: string;
    q?: string;
  }>;
};

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const params = await searchParams;
  const { selectedDate, summary, rows } = await fetchAdminAttendanceData(params.date);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Attendance Analytics
        </h2>
        <p className="text-sm text-muted-foreground">
          Monitor daily attendance, late arrivals, and workforce check-ins.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <AttendanceDashboard selectedDate={selectedDate} summary={summary} rows={rows} />
      </Suspense>
    </div>
  );
}
