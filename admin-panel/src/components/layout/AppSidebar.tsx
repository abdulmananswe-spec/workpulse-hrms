"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  UserCheck,
  X,
} from "lucide-react";

import { AdminProfileMenu } from "@/components/layout/AdminProfileMenu";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/attendance", label: "Attendance", icon: UserCheck },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/leaves", label: "Leaves", icon: CalendarDays },
  { href: "/dashboard/requests", label: "Attendance Requests", icon: ClipboardList },
  { href: "/dashboard/branches", label: "Branches", icon: Building2 },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

type AppSidebarProps = {
  profile: Profile;
};

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname();
  const { mobileOpen, closeMobile, collapsed, toggleCollapsed } = useSidebar();

  function handleNavigate() {
    closeMobile();
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between gap-3 border-b border-sidebar-border px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg">
            WP
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-sidebar-foreground">WorkPulse</p>
              <p className="truncate text-xs text-muted-foreground">HRMS Platform</p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        >
          <X className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent md:flex lg:hidden"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-2 md:justify-center lg:justify-start lg:px-3",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <Icon className="relative h-4 w-4 shrink-0" />
              {!collapsed ? <span className="relative truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-sidebar-border p-3">
        <AdminProfileMenu profile={profile} collapsed={collapsed} />
        {!collapsed ? (
          <LogoutButton
            variant="outline"
            className="h-10 w-full justify-center border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            showIcon
          />
        ) : (
          <LogoutButton
            variant="outline"
            iconOnly
            className="mx-auto flex h-10 w-10 items-center justify-center border-destructive/30 p-0 text-destructive hover:bg-destructive/10"
            showIcon
          />
        )}
      </div>
    </>
  );

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "md:w-20 lg:w-64" : "md:w-64",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
