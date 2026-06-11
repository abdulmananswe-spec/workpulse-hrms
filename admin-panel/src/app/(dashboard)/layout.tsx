import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { getAuthenticatedAdminProfile } from "@/lib/auth/server";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile } = await getAuthenticatedAdminProfile();

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
