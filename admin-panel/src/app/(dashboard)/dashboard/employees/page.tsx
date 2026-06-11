import { EmployeeManagement } from "@/components/employees/EmployeeManagement";
import { fetchActiveBranches, fetchEmployees } from "@/lib/employees/queries";

type EmployeesPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const params = await searchParams;
  const search = params.q ?? "";
  const [employees, branches] = await Promise.all([
    fetchEmployees(search),
    fetchActiveBranches(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Employee Directory</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage employee accounts, branch assignments, and access status.
        </p>
      </div>

      <EmployeeManagement
        employees={employees}
        branches={branches}
        initialSearch={search}
      />
    </div>
  );
}
