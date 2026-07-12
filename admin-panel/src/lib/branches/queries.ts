import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Branch = Database["public"]["Tables"]["branches"]["Row"] & {
  employeeCount?: number;
};

export async function fetchBranches(): Promise<Branch[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("branches")
    .select("*, profiles(id, role, is_active)")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((branch) => {
    const profiles = (branch.profiles as { role: string; is_active: boolean }[] | null) || [];
    const employeeCount = profiles.filter(
      (p) => p.role === "employee" && p.is_active === true
    ).length;

    const branchData = { ...branch } as Record<string, unknown>;
    delete branchData.profiles;

    return {
      ...(branchData as unknown as Database["public"]["Tables"]["branches"]["Row"]),
      employeeCount,
    };
  });
}

export async function fetchBranchById(branchId: string): Promise<Branch | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("id", branchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
