"use client";

import { Download, FileSpreadsheet, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  downloadAttendanceReport,
  downloadLeaveReport,
  downloadWorkforceReport,
} from "@/lib/reports/export";
import { validateDateRange } from "@/lib/validation";
import type { ReportSummary } from "@/lib/reports/queries";

type ReportsDashboardProps = {
  summary: ReportSummary;
  defaultStartDate: string;
  defaultEndDate: string;
};

export function ReportsDashboard({
  summary,
  defaultStartDate,
  defaultEndDate,
}: ReportsDashboardProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleExport(
    type: "workforce" | "attendance" | "leave",
    exporter: ((start: string, end: string) => Promise<void>) | (() => Promise<void>),
  ) {
    if (type !== "workforce") {
      const dateError = validateDateRange(startDate, endDate);
      if (dateError) {
        toast.error(dateError);
        return;
      }
    }

    setLoading(type);
    try {
      if (type === "workforce") {
        await downloadWorkforceReport();
      } else {
        await (exporter as (start: string, end: string) => Promise<void>)(startDate, endDate);
      }
      toast.success("Report downloaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.totalEmployees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{summary.activeEmployees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.attendanceRecords}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.leaveRequests}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Users className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Workforce Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Employee directory with branch, designation, and status.
            </p>
            <Button
              className="w-full"
              disabled={loading !== null}
              onClick={() => void handleExport("workforce", downloadWorkforceReport)}
            >
              <Download className="h-4 w-4" />
              {loading === "workforce" ? "Exporting..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileSpreadsheet className="mb-2 h-8 w-8 text-emerald-600" />
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Daily check-in/out records for the selected period.
            </p>
            <Button
              className="w-full"
              variant="outline"
              disabled={loading !== null}
              onClick={() => void handleExport("attendance", downloadAttendanceReport)}
            >
              <Download className="h-4 w-4" />
              {loading === "attendance" ? "Exporting..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileSpreadsheet className="mb-2 h-8 w-8 text-violet-600" />
            <CardTitle>Leave Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              All leave requests with type, status, and dates.
            </p>
            <Button
              className="w-full"
              variant="outline"
              disabled={loading !== null}
              onClick={() => void handleExport("leave", downloadLeaveReport)}
            >
              <Download className="h-4 w-4" />
              {loading === "leave" ? "Exporting..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
