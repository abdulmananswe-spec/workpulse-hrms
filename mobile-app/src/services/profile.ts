import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";
import type { EmployeeBranch } from "@/types/branch";

export type ProfileUpdateInput = {
  full_name: string;
  phone: string | null;
};

export async function fetchEmployeeBranch(
  branchId: string | null,
): Promise<EmployeeBranch | null> {
  if (!branchId) {
    return null;
  }

  const { data, error } = await supabase
    .from("branches")
    .select("id, name, latitude, longitude, radius_meters, is_active")
    .eq("id", branchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProfileDetails(
  userId: string,
  input: ProfileUpdateInput,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name.trim(),
      phone: input.phone?.trim() || null,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  email: string,
): Promise<void> {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error("Current password is incorrect.");
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}
