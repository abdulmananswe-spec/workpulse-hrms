import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/contexts/SidebarContext";
import type { Profile } from "@/types/database";

type DashboardShellProps = {
  profile: Profile;
  title?: string;
  description?: string;
  children: ReactNode;
};

export function DashboardShell({
  profile,
  title,
  description,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen overflow-x-hidden bg-background">
        <AppSidebar profile={profile} />
        <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
          <AppHeader profile={profile} title={title} description={description} />
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
