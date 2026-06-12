"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAction } from "@/lib/auth/guard";
import { generateTemporaryPassword } from "@/lib/employees/password";
import { createAdminNotification } from "@/lib/notifications/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type EmployeeFormInput = {
  full_name: string;
  email: string;
  phone?: string;
  employee_code?: string;
  designation?: string;
  branch_id?: string | null;
  is_active?: boolean;
};

export type CreateEmployeeResult = {
  employeeId: string;
  email: string;
  temporaryPassword: string;
};

function normalizeEmployeeInput(input: EmployeeFormInput) {
  return {
    full_name: input.full_name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    employee_code: input.employee_code?.trim() || null,
    designation: input.designation?.trim() || null,
    branch_id: input.branch_id || null,
    is_active: input.is_active ?? true,
  };
}

function revalidateEmployeePages() {
  revalidatePath("/dashboard/employees");
  revalidatePath("/dashboard/attendance");
}

export async function createEmployeeAction(
  input: EmployeeFormInput,
): Promise<CreateEmployeeResult> {
  await requireAdminAction();

  const employee = normalizeEmployeeInput(input);

  if (!employee.full_name || !employee.email) {
    throw new Error("Full name and email are required.");
  }

  const temporaryPassword = generateTemporaryPassword();
  const adminClient = createAdminClient();

  const { data: createdUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email: employee.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: employee.full_name,
        role: "employee",
      },
    });

  if (createError || !createdUser.user) {
    throw new Error(createError?.message ?? "Failed to create auth user.");
  }

  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: employee.full_name,
      email: employee.email,
      phone: employee.phone,
      employee_code: employee.employee_code,
      designation: employee.designation,
      branch_id: employee.branch_id,
      is_active: employee.is_active,
      role: "employee",
    })
    .eq("id", createdUser.user.id);

  if (profileError) {
    await adminClient.auth.admin.deleteUser(createdUser.user.id);
    throw new Error(profileError.message);
  }

  revalidateEmployeePages();

  await createAdminNotification({
    title: "New employee added",
    message: `${employee.full_name} (${employee.email}) was added to the workforce.`,
    type: "employee",
    metadata: { employee_id: createdUser.user.id },
  });

  return {
    employeeId: createdUser.user.id,
    email: employee.email,
    temporaryPassword,
  };
}

export async function updateEmployeeAction(
  employeeId: string,
  input: EmployeeFormInput,
): Promise<void> {
  await requireAdminAction();

  const employee = normalizeEmployeeInput(input);

  if (!employee.full_name || !employee.email) {
    throw new Error("Full name and email are required.");
  }

  const supabase = await createClient();

  const { data: updated, error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: employee.full_name,
      email: employee.email,
      phone: employee.phone,
      employee_code: employee.employee_code,
      designation: employee.designation,
      branch_id: employee.branch_id,
      is_active: employee.is_active,
    })
    .eq("id", employeeId)
    .eq("role", "employee")
    .select("id")
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!updated) {
    throw new Error("Employee not found or could not be updated.");
  }

  const adminClient = createAdminClient();

  const { data: authUser } = await adminClient.auth.admin.getUserById(employeeId);

  if (authUser.user && authUser.user.email !== employee.email) {
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      employeeId,
      { email: employee.email },
    );

    if (authError) {
      throw new Error(authError.message);
    }
  }

  revalidateEmployeePages();
}

export async function setEmployeeActiveAction(
  employeeId: string,
  isActive: boolean,
): Promise<void> {
  await requireAdminAction();

  const supabase = await createClient();

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", employeeId)
    .eq("role", "employee")
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!updated) {
    throw new Error("Employee not found or could not be updated.");
  }

  const adminClient = createAdminClient();

  const { error: authError } = await adminClient.auth.admin.updateUserById(employeeId, {
    ban_duration: isActive ? "none" : "876000h",
  });

  if (authError) {
    throw new Error(authError.message);
  }

  revalidateEmployeePages();
}

export async function deleteEmployeeAction(employeeId: string): Promise<void> {
  await requireAdminAction();

  const adminClient = createAdminClient();

  const { data: employee, error: fetchError } = await adminClient
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", employeeId)
    .eq("role", "employee")
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!employee) {
    throw new Error("Employee not found.");
  }

  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(employeeId);

  if (authDeleteError) {
    throw new Error(authDeleteError.message);
  }

  revalidateEmployeePages();
}

export async function resetEmployeePasswordAction(
  employeeId: string,
): Promise<{ temporaryPassword: string }> {
  await requireAdminAction();

  const temporaryPassword = generateTemporaryPassword();
  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.updateUserById(employeeId, {
    password: temporaryPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { temporaryPassword };
}
