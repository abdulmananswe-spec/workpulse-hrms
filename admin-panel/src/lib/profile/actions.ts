"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAction } from "@/lib/auth/guard";
import { getAuthenticatedAdminProfile } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

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

export async function uploadAvatarAction(formData: FormData): Promise<{ avatarUrl: string }> {
  await requireAdminAction();
  const { userId } = await getAuthenticatedAdminProfile();
  const supabase = await createClient();

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
  const filePath = `${userId}/avatar.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, buffer, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);
  const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/settings");

  return { avatarUrl };
}

export async function removeAvatarAction(): Promise<void> {
  await requireAdminAction();
  const { userId } = await getAuthenticatedAdminProfile();
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/settings");
}
