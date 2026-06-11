import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export type BranchSummary = {
  id: string;
  name: string;
  is_active: boolean;
};

export type EmployeeRow = Profile & {
  branch: BranchSummary | null;
};

export async function fetchEmployees(search?: string): Promise<EmployeeRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        *,
        branch:branches (
          id,
          name,
          is_active
        )
      `,
    )
    .eq("role", "employee")
    .order("full_name");

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as EmployeeRow[];
  const normalizedSearch = search?.trim().toLowerCase();

  if (!normalizedSearch) {
    return rows;
  }

  return rows.filter((row) => {
    return (
      row.full_name.toLowerCase().includes(normalizedSearch) ||
      row.email.toLowerCase().includes(normalizedSearch) ||
      (row.employee_code?.toLowerCase().includes(normalizedSearch) ?? false) ||
      (row.designation?.toLowerCase().includes(normalizedSearch) ?? false) ||
      (row.branch?.name.toLowerCase().includes(normalizedSearch) ?? false)
    );
  });
}

export async function fetchEmployeeById(
  employeeId: string,
): Promise<EmployeeRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        *,
        branch:branches (
          id,
          name,
          is_active
        )
      `,
    )
    .eq("id", employeeId)
    .eq("role", "employee")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as EmployeeRow | null) ?? null;
}

export async function fetchActiveBranches(): Promise<BranchSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("branches")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).filter(
    (branch) => branch.name && !/^https?:\/\//i.test(branch.name),
  );
}
