"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAction } from "@/lib/auth/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const EMPLOYEE_PHOTOS_BUCKET = "employees";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function extensionForMime(mime: string): string {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function revalidateEmployeeAvatarPages(employeeId: string) {
  revalidatePath("/dashboard/employees");
  revalidatePath(`/dashboard/employees/${employeeId}`);
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/leaves");
}

async function assertEmployeeExists(employeeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", employeeId)
    .eq("role", "employee")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Employee not found.");
  }
}

async function removeEmployeePhotoFiles(employeeId: string) {
  const adminClient = createAdminClient();
  const folder = employeeId;
  const { data: files, error: listError } = await adminClient.storage
    .from(EMPLOYEE_PHOTOS_BUCKET)
    .list(folder);

  if (listError) {
    throw new Error(listError.message);
  }

  if (!files?.length) {
    return;
  }

  const paths = files.map((file) => `${folder}/${file.name}`);
  const { error: removeError } = await adminClient.storage
    .from(EMPLOYEE_PHOTOS_BUCKET)
    .remove(paths);

  if (removeError) {
    throw new Error(removeError.message);
  }
}

export async function uploadEmployeeAvatarAction(
  employeeId: string,
  formData: FormData,
): Promise<{ avatarUrl: string }> {
  await requireAdminAction();
  await assertEmployeeExists(employeeId);

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please choose an image to upload.");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const extension = extensionForMime(file.type);
  const filePath = `${employeeId}/profile.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const adminClient = createAdminClient();

  await removeEmployeePhotoFiles(employeeId);

  const { error: uploadError } = await adminClient.storage
    .from(EMPLOYEE_PHOTOS_BUCKET)
    .upload(filePath, buffer, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicData } = adminClient.storage
    .from(EMPLOYEE_PHOTOS_BUCKET)
    .getPublicUrl(filePath);
  const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", employeeId)
    .eq("role", "employee");

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidateEmployeeAvatarPages(employeeId);

  return { avatarUrl };
}

export async function removeEmployeeAvatarAction(employeeId: string): Promise<void> {
  await requireAdminAction();
  await assertEmployeeExists(employeeId);

  await removeEmployeePhotoFiles(employeeId);

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", employeeId)
    .eq("role", "employee");

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidateEmployeeAvatarPages(employeeId);
}

export async function deleteEmployeePhotoStorageAction(employeeId: string): Promise<void> {
  await requireAdminAction();
  await removeEmployeePhotoFiles(employeeId);
}
