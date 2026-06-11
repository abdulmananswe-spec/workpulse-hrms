import { supabase } from "@/lib/supabase";
import type { Announcement, EmployeeNotification } from "@/types/hr";

export async function fetchNotifications(
  employeeId: string,
): Promise<EmployeeNotification[]> {
  const { data, error } = await supabase
    .from("employee_notifications")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as EmployeeNotification[];
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("employee_notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(employeeId: string): Promise<void> {
  const { error } = await supabase
    .from("employee_notifications")
    .update({ is_read: true })
    .eq("employee_id", employeeId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Announcement[];
}

export function getUnreadCount(notifications: EmployeeNotification[]): number {
  return notifications.filter((n) => !n.is_read).length;
}
