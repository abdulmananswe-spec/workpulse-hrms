import Link from "next/link";
import { notFound } from "next/navigation";

import { EmployeeProfileView } from "@/components/employees/EmployeeProfileView";
import { fetchEmployeeById } from "@/lib/employees/queries";
import { createClient } from "@/lib/supabase/server";

type EmployeeProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeProfilePage({ params }: EmployeeProfilePageProps) {
  const { id } = await params;
  const employee = await fetchEmployeeById(id);

  if (!employee) {
    notFound();
  }

  const supabase = await createClient();
  const [balancesResult, attendanceResult] = await Promise.all([
    supabase
      .from("employee_leave_balances")
      .select("*")
      .eq("employee_id", id),
    supabase
      .from("attendance_records")
      .select("*")
      .eq("employee_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  if (balancesResult.error) throw new Error(balancesResult.error.message);
  if (attendanceResult.error) throw new Error(attendanceResult.error.message);

  const presentDays = (attendanceResult.data ?? []).filter((row) => row.check_in_time).length;
  const attendancePercentage = attendanceResult.data?.length
    ? Math.round((presentDays / attendanceResult.data.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/employees" className="text-sm font-medium text-primary">
          ← Back to directory
        </Link>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          {employee.full_name}
        </h2>
        <p className="text-sm text-muted-foreground">{employee.email}</p>
      </div>

      <EmployeeProfileView
        employee={employee}
        leaveBalances={balancesResult.data ?? []}
        attendancePercentage={attendancePercentage}
        recentAttendance={attendanceResult.data ?? []}
      />
    </div>
  );
}
