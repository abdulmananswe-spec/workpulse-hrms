import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Branch = Database["public"]["Tables"]["branches"]["Row"];

export async function fetchBranches(): Promise<Branch[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
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
