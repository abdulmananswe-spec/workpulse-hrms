"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/lib/attendance/utils";
import type { EmployeeRow } from "@/lib/employees/queries";

type EmployeeProfileViewProps = {
  employee: EmployeeRow;
  leaveBalances: {
    leave_type: string;
    total_days: number;
    used_days: number;
  }[];
  attendancePercentage: number;
  recentAttendance: {
    id: string;
    check_in_time: string | null;
    check_out_time: string | null;
    status: string;
    created_at: string;
  }[];
};

const tabs = ["Overview", "Attendance", "Leaves", "Settings"] as const;

export function EmployeeProfileView({
  employee,
  leaveBalances,
  attendancePercentage,
  recentAttendance,
}: EmployeeProfileViewProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");

  const totalLeaveRemaining = leaveBalances.reduce(
    (sum, row) => sum + (Number(row.total_days) - Number(row.used_days)),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={employee.full_name}
                  imageUrl={employee.avatar_url}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-foreground">{employee.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {employee.avatar_url ? "Photo on file" : "Initials avatar"}
                  </p>
                </div>
              </div>
              <p>
                <span className="text-muted-foreground">Designation:</span>{" "}
                {employee.designation ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Branch:</span>{" "}
                {employee.branch?.name ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Code:</span>{" "}
                {employee.employee_code ?? "—"}
              </p>
              <Badge variant={employee.is_active ? "success" : "danger"}>
                {employee.is_active ? "Active" : "Inactive"}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance %</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">{attendancePercentage}%</p>
              <p className="text-sm text-muted-foreground">Last 30 records</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">{totalLeaveRemaining}</p>
              <p className="text-sm text-muted-foreground">Days remaining</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeTab === "Attendance" ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendance records.</p>
            ) : (
              recentAttendance.map((row) => (
                <div key={row.id} className="flex items-center justify-between text-sm">
                  <span>{new Date(row.created_at).toLocaleDateString()}</span>
                  <span className="text-muted-foreground">
                    {formatTime(row.check_in_time)} – {formatTime(row.check_out_time)}
                  </span>
                  <Badge variant={row.status === "present" ? "success" : "warning"}>
                    {row.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "Leaves" ? (
        <Card>
          <CardHeader>
            <CardTitle>Leave Balances</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {leaveBalances.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leave balances configured.</p>
            ) : (
              leaveBalances.map((row) => (
                <div key={row.leave_type} className="rounded-xl border border-border p-4">
                  <p className="font-medium capitalize">{row.leave_type.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {Number(row.total_days) - Number(row.used_days)} / {row.total_days} days
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "Settings" ? (
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Email: {employee.email}</p>
            <p>Phone: {employee.phone ?? "—"}</p>
            <p>Use the employee directory to edit profile or reset password.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
