"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAction } from "@/lib/auth/guard";
import { createAdminNotification } from "@/lib/notifications/actions";
import { createAdminClient } from "@/lib/supabase/admin";

export type AnnouncementFormInput = {
  title: string;
  body: string;
  priority: "high" | "medium" | "low";
  notifyEmployees?: boolean;
};

function normalizeInput(input: AnnouncementFormInput) {
  return {
    title: input.title.trim(),
    body: input.body.trim(),
    priority: input.priority,
    notifyEmployees: input.notifyEmployees ?? true,
  };
}

async function notifyAllEmployees(title: string, body: string, announcementId: string) {
  const adminClient = createAdminClient();

  const { data: employees, error: employeesError } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "employee")
    .eq("is_active", true);

  if (employeesError) {
    throw new Error(employeesError.message);
  }

  if (!employees?.length) {
    return;
  }

  const notifications = employees.map((employee) => ({
    employee_id: employee.id,
    title,
    body,
    type: "announcement" as const,
    metadata: { announcement_id: announcementId },
  }));

  const { error } = await adminClient.from("employee_notifications").insert(notifications);

  if (error) {
    throw new Error(error.message);
  }
}

function revalidateAnnouncementPages() {
  revalidatePath("/dashboard/announcements");
}

export async function createAnnouncementAction(
  input: AnnouncementFormInput,
): Promise<void> {
  await requireAdminAction();

  const payload = normalizeInput(input);

  if (!payload.title || !payload.body) {
    throw new Error("Title and message are required.");
  }

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("announcements")
    .insert({
      title: payload.title,
      body: payload.body,
      priority: payload.priority,
      is_active: true,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create announcement.");
  }

  if (payload.notifyEmployees) {
    await notifyAllEmployees(payload.title, payload.body, data.id);
  }

  await createAdminNotification({
    title: "Announcement published",
    message: `"${payload.title}" was published to employees.`,
    type: "announcement",
    metadata: { announcement_id: data.id },
  });

  revalidateAnnouncementPages();
}

export async function updateAnnouncementAction(
  announcementId: string,
  input: AnnouncementFormInput,
): Promise<void> {
  await requireAdminAction();

  const payload = normalizeInput(input);

  if (!payload.title || !payload.body) {
    throw new Error("Title and message are required.");
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("announcements")
    .update({
      title: payload.title,
      body: payload.body,
      priority: payload.priority,
    })
    .eq("id", announcementId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAnnouncementPages();
}

export async function setAnnouncementActiveAction(
  announcementId: string,
  isActive: boolean,
): Promise<void> {
  await requireAdminAction();

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("announcements")
    .update({ is_active: isActive })
    .eq("id", announcementId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAnnouncementPages();
}

export async function deleteAnnouncementAction(announcementId: string): Promise<void> {
  await requireAdminAction();

  const adminClient = createAdminClient();

  const { error } = await adminClient.from("announcements").delete().eq("id", announcementId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAnnouncementPages();
}

export async function republishAnnouncementAction(announcementId: string): Promise<void> {
  await requireAdminAction();

  const adminClient = createAdminClient();

  const { data: announcement, error: fetchError } = await adminClient
    .from("announcements")
    .select("*")
    .eq("id", announcementId)
    .maybeSingle();

  if (fetchError || !announcement) {
    throw new Error(fetchError?.message ?? "Announcement not found.");
  }

  await notifyAllEmployees(announcement.title, announcement.body, announcement.id);

  revalidateAnnouncementPages();
}
