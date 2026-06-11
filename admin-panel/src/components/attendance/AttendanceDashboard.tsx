"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Clock, UserCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { Label } from "@/components/ui/label";
import type { AdminAttendanceRow, AdminAttendanceSummary } from "@/lib/attendance/queries";
import { formatTime, toDateInputValue, workingHoursBetween } from "@/lib/attendance/utils";

type AttendanceDashboardProps = {
  selectedDate: string;
  summary: AdminAttendanceSummary;
  rows: AdminAttendanceRow[];
};

export function AttendanceDashboard({
  selectedDate,
  summary,
  rows,
}: AttendanceDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(
      (row) =>
        row.employeeName.toLowerCase().includes(query) ||
        (row.employeeCode?.toLowerCase().includes(query) ?? false),
    );
  }, [rows, search]);

  const columns = useMemo<ColumnDef<AdminAttendanceRow>[]>(
    () => [
      {
        accessorKey: "employeeName",
        header: "Employee",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {row.original.employeeName.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{row.original.employeeName}</p>
              <p className="text-xs text-muted-foreground">
                {row.original.employeeCode ?? "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "checkIn",
        header: "Check-in",
        cell: ({ row }) => formatTime(row.original.checkInTime),
      },
      {
        id: "checkOut",
        header: "Check-out",
        cell: ({ row }) => formatTime(row.original.checkOutTime),
      },
      {
        id: "hours",
        header: "Working Hours",
        cell: ({ row }) =>
          workingHoursBetween(row.original.checkInTime, row.original.checkOutTime),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.checkInTime ? row.original.status : "absent";
          const variant =
            status === "present" ? "success" : status === "late" ? "warning" : "default";
          return <Badge variant={variant}>{status}</Badge>;
        },
      },
    ],
    [],
  );

  function handleDateChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", value);
    if (search.trim()) params.set("q", search.trim());
    router.replace(`/dashboard/attendance?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", selectedDate);
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    router.replace(`/dashboard/attendance?${params.toString()}`);
  }

  const lateArrivals = filteredRows.filter((row) => row.status === "late");
  const recentCheckIns = filteredRows.filter((row) => row.checkInTime).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Employees" value={summary.totalEmployees} icon={UserCheck} gradient="from-blue-500 to-blue-700" />
        <KpiCard label="Present Today" value={summary.totalPresent} icon={UserCheck} gradient="from-emerald-500 to-teal-600" />
        <KpiCard label="Absent Today" value={summary.totalAbsent} icon={UserX} gradient="from-rose-500 to-red-600" />
        <KpiCard label="Checked In" value={summary.totalCheckedIn} icon={Clock} gradient="from-violet-500 to-purple-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              max={toDateInputValue()}
              onChange={(event) => handleDateChange(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search">Search Employee</Label>
            <Input
              id="search"
              placeholder="Search by name or employee code"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Employee Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredRows}
              searchPlaceholder="Filter table..."
              emptyTitle="No attendance records"
              emptyDescription="No records found for the selected date."
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Late Arrivals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lateArrivals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No late arrivals today.</p>
              ) : (
                lateArrivals.map((row) => (
                  <div key={row.employeeId} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{row.employeeName}</span>
                    <span className="text-muted-foreground">{formatTime(row.checkInTime)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentCheckIns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No check-ins yet.</p>
              ) : (
                recentCheckIns.map((row) => (
                  <div key={row.employeeId} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{row.employeeName}</span>
                    <span className="text-muted-foreground">{formatTime(row.checkInTime)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
