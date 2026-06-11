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
  Settings,
  Users,
  UserCheck,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";
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

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg">
          WP
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground">WorkPulse</p>
          <p className="text-xs text-muted-foreground">HRMS Platform</p>
        </div>
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
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
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
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {profile.full_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>
        <LogoutButton variant="outline" className="w-full justify-center" showIcon />
      </div>
    </aside>
  );
}
