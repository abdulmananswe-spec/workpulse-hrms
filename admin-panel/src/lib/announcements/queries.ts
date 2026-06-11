import { createClient } from "@/lib/supabase/server";

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  priority: "high" | "medium" | "low";
  is_active: boolean;
  published_at: string;
  created_at: string;
};

export async function fetchAnnouncements(): Promise<AnnouncementRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AnnouncementRow[];
}
