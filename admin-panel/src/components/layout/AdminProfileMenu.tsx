"use client";

import { useRouter } from "next/navigation";
import {
  ChevronUp,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { redirectToLogin } from "@/lib/auth/logout";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

type AdminProfileMenuProps = {
  profile: Profile;
  collapsed?: boolean;
};

export function AdminProfileMenu({ profile, collapsed = false }: AdminProfileMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  function handleSignOut() {
    void (async () => {
      try {
        queryClient.clear();
        await signOut();
        toast.success("Successfully signed out");
        redirectToLogin({ signedOut: true });
      } catch {
        toast.error("Sign out failed. Please try again.");
      }
    })();
  }

  return (
    <DropdownMenu className="block w-full">
      <DropdownMenuTrigger
        aria-label="Administrator menu"
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-3 text-left shadow-sm transition hover:border-primary/25 hover:shadow-md",
          collapsed && "justify-center p-2",
        )}
      >
        <UserAvatar
          name={profile.full_name}
          imageUrl={profile.avatar_url}
          size={collapsed ? "md" : "md"}
          showStatus
        />
        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{profile.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">Administrator</p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active now
              </p>
            </div>
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground transition group-aria-expanded:rotate-180" />
          </>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        className="w-[min(100vw-2rem,20rem)]"
      >
        <div className="flex items-center gap-3 px-3 py-3">
          <UserAvatar
            name={profile.full_name}
            imageUrl={profile.avatar_url}
            size="lg"
            showStatus
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{profile.full_name}</p>
            <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
            <p className="mt-1 text-xs font-medium text-primary">Administrator</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/dashboard/profile")}>
          <User className="h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/dashboard/settings")}>
          <Settings className="h-4 w-4" />
          Account Settings
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
        <DropdownMenuItem onSelect={() => router.push("/reset-password")}>
          <KeyRound className="h-4 w-4" />
          Change Password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onSelect={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
