"use client";

import { Clock, LogIn, LogOut, UserCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Columns definition removed in favor of premium animated cards layout

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
        <Card className="xl:col-span-2 border-none bg-transparent shadow-none">
          <CardHeader className="px-0">
            <CardTitle className="text-xl font-bold tracking-tight">Employee Attendance</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2"
            >
              {filteredRows.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
                  No attendance records found for this selection.
                </div>
              ) : (
                filteredRows.map((employee) => {
                  const status = employee.checkInTime ? employee.status : "absent";
                  const statusVariant =
                    status === "present" ? "success" : status === "late" ? "warning" : "danger";
                  const workHrs = workingHoursBetween(employee.checkInTime, employee.checkOutTime);

                  return (
                    <motion.div
                      key={employee.id}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
                      }}
                      whileHover={{ y: -3, transition: { duration: 0.15 } }}
                      className="isolate relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-md p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={employee.employeeName}
                            imageUrl={employee.employeeAvatarUrl}
                            size="md"
                          />
                          <div>
                            <h4 className="font-semibold text-foreground text-base tracking-tight leading-tight">
                              {employee.employeeName}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                              {employee.employeeCode ?? "—"}
                            </p>
                          </div>
                        </div>
                        <Badge variant={statusVariant} className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {status}
                        </Badge>
                      </div>

                      {/* Timings row */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/30 border border-border/40 rounded-xl p-3 text-xs">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                            <LogIn className="h-3 w-3 text-emerald-500" />
                            Check-In
                          </p>
                          <p className="font-bold text-foreground">
                            {formatTime(employee.checkInTime) || "—"}
                          </p>
                        </div>
                        <div className="space-y-1 border-l border-border pl-3">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                            <LogOut className="h-3 w-3 text-rose-500" />
                            Check-Out
                          </p>
                          <p className="font-bold text-foreground">
                            {formatTime(employee.checkOutTime) || (employee.checkInTime ? "In Progress" : "—")}
                          </p>
                        </div>
                      </div>

                      {/* Footer: working hours and duration info */}
                      <div className="flex items-center justify-between text-xs pt-2.5 border-t border-border/60">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-4 w-4 text-muted-foreground/75" />
                          <span>Hours:</span>
                          <span className="font-bold text-foreground">{workHrs}</span>
                        </div>

                        {employee.checkInTime && (
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Active</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
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
