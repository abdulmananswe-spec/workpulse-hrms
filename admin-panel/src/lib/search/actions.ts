"use server";

import { requireAdminAction } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: "employee" | "branch" | "leave" | "announcement";
};

export async function globalSearchAction(query: string): Promise<SearchResult[]> {
  await requireAdminAction();

  const term = query.trim();
  if (term.length < 2) return [];

  const supabase = await createClient();
  const pattern = `%${term}%`;
  const results: SearchResult[] = [];

  const [byName, byEmail, branches, leaves, announcements] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "employee")
      .ilike("full_name", pattern)
      .limit(5),
    supabase
      .from("profiles")
      .select("id, full_name, email, employee_code")
      .eq("role", "employee")
      .or(`email.ilike.${pattern},employee_code.ilike.${pattern}`)
      .limit(5),
    supabase.from("branches").select("id, name, address").ilike("name", pattern).limit(5),
    supabase
      .from("leave_requests")
      .select("id, reason, status, employee:profiles!leave_requests_employee_id_fkey(full_name)")
      .ilike("reason", pattern)
      .limit(5),
    supabase
      .from("announcements")
      .select("id, title, body")
      .ilike("title", pattern)
      .limit(5),
  ]);

  const seen = new Set<string>();

  for (const row of [...(byName.data ?? []), ...(byEmail.data ?? [])]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    results.push({
      id: `emp-${row.id}`,
      title: row.full_name,
      subtitle: row.email,
      href: `/dashboard/employees/${row.id}`,
      category: "employee",
    });
  }

  for (const row of branches.data ?? []) {
    results.push({
      id: `branch-${row.id}`,
      title: row.name,
      subtitle: row.address ?? "Branch",
      href: "/dashboard/branches",
      category: "branch",
    });
  }

  for (const row of leaves.data ?? []) {
    const emp = row.employee as { full_name?: string } | null;
    results.push({
      id: `leave-${row.id}`,
      title: emp?.full_name ?? "Leave request",
      subtitle: `${row.status} — ${row.reason ?? ""}`.slice(0, 80),
      href: "/dashboard/leaves?tab=pending",
      category: "leave",
    });
  }

  for (const row of announcements.data ?? []) {
    results.push({
      id: `ann-${row.id}`,
      title: row.title,
      subtitle: row.body.slice(0, 80),
      href: "/dashboard/announcements",
      category: "announcement",
    });
  }

  return results.slice(0, 12);
}
