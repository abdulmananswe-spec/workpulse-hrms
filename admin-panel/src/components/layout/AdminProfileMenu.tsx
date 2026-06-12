"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  KeyRound,
  Monitor,
  Moon,
  Settings,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";

import { LogoutButton } from "@/components/auth/LogoutButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Profile } from "@/types/database";

type AdminProfileMenuProps = {
  profile: Profile;
};

export function AdminProfileMenu({ profile }: AdminProfileMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const initial = profile.full_name?.charAt(0).toUpperCase() || "A";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Administrator menu"
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition hover:bg-accent"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{profile.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">Administrator</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[min(100vw-2rem,20rem)]" align="start">
        <div className="px-3 py-3">
          <p className="font-semibold text-foreground">{profile.full_name}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">Role: Administrator</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => undefined}>
          <User className="h-4 w-4" />
          Edit profile (coming soon)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/reset-password")}>
          <KeyRound className="h-4 w-4" />
          Change password
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/dashboard/settings")}>
          <Settings className="h-4 w-4" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          <Sun className="h-4 w-4" />
          Light {theme === "light" ? "✓" : ""}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          <Moon className="h-4 w-4" />
          Dark {theme === "dark" ? "✓" : ""}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}>
          <Monitor className="h-4 w-4" />
          System {theme === "system" ? "✓" : ""}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Security</DropdownMenuLabel>
        <DropdownMenuItem disabled>
          <Shield className="h-4 w-4" />
          Active sessions
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Activity className="h-4 w-4" />
          Login history
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-2">
          <LogoutButton variant="outline" className="w-full justify-center" showIcon />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
