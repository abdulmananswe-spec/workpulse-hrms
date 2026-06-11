"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAction } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";

export type BranchFormInput = {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active?: boolean;
};

function normalizeBranchInput(input: BranchFormInput) {
  const name = input.name.trim();

  if (/^https?:\/\//i.test(name)) {
    throw new Error("Branch name cannot be a URL. Enter a proper office name.");
  }

  return {
    name,
    address: input.address?.trim() || null,
    latitude: input.latitude,
    longitude: input.longitude,
    radius_meters: Math.max(10, Math.round(input.radius_meters)),
    is_active: input.is_active ?? true,
  };
}

function revalidateBranchPages() {
  revalidatePath("/dashboard/branches");
  revalidatePath("/dashboard/employees");
}

export async function createBranchAction(input: BranchFormInput): Promise<void> {
  await requireAdminAction();

  const branch = normalizeBranchInput(input);

  if (!branch.name) {
    throw new Error("Branch name is required.");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("branches").insert(branch);

  if (error) {
    throw new Error(error.message);
  }

  revalidateBranchPages();
}

export async function updateBranchAction(
  branchId: string,
  input: BranchFormInput,
): Promise<void> {
  await requireAdminAction();

  const branch = normalizeBranchInput(input);

  if (!branch.name) {
    throw new Error("Branch name is required.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("branches")
    .update(branch)
    .eq("id", branchId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateBranchPages();
}

export async function deleteBranchAction(branchId: string): Promise<void> {
  await requireAdminAction();

  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("branch_id", branchId);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error("Cannot delete a branch that has assigned employees.");
  }

  const { error } = await supabase.from("branches").delete().eq("id", branchId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateBranchPages();
}

export async function setBranchActiveAction(
  branchId: string,
  isActive: boolean,
): Promise<void> {
  await requireAdminAction();

  const supabase = await createClient();

  const { error } = await supabase
    .from("branches")
    .update({ is_active: isActive })
    .eq("id", branchId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateBranchPages();
}
