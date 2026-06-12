"use server";

import { requireAdminAction } from "@/lib/auth/guard";
import { createNotificationClient } from "@/lib/notifications/client";
import { createClient } from "@/lib/supabase/server";

export type AdminNotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export async function fetchAdminNotifications(limit = 20): Promise<AdminNotificationRow[]> {
  await requireAdminAction();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const client = createNotificationClient();
  const { data, error } = await client
    .from("admin_notifications")
    .select("id, title, message, type, is_read, created_at")
    .or(`admin_id.is.null,admin_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[Notifications]", error.message);
    return [];
  }

  return (data ?? []) as AdminNotificationRow[];
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  await requireAdminAction();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const client = createNotificationClient();
  const { count, error } = await client
    .from("admin_notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false)
    .or(`admin_id.is.null,admin_id.eq.${user.id}`);

  if (error) return 0;
  return count ?? 0;
}

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  await requireAdminAction();
  const client = createNotificationClient();
  const { error } = await client
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw new Error(error.message);
}

export async function markAllNotificationsReadAction(): Promise<void> {
  await requireAdminAction();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const client = createNotificationClient();
  const { error } = await client
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("is_read", false)
    .or(`admin_id.is.null,admin_id.eq.${user.id}`);

  if (error) throw new Error(error.message);
}

export async function createAdminNotification(input: {
  title: string;
  message: string;
  type: "employee" | "leave" | "attendance" | "branch" | "announcement" | "system";
  adminId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const client = createNotificationClient();
    const { error } = await client.from("admin_notifications").insert({
      admin_id: input.adminId ?? null,
      title: input.title,
      message: input.message,
      type: input.type,
      metadata: input.metadata ?? null,
    });

    if (error) {
      console.warn("[Notifications] insert failed:", error.message);
    }
  } catch (error) {
    console.warn("[Notifications] skipped:", error);
  }
}
