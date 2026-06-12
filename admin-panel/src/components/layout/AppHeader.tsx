"use client";

import { Menu } from "lucide-react";

import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useSidebar } from "@/contexts/SidebarContext";
import type { Profile } from "@/types/database";

type AppHeaderProps = {
  profile: Profile;
  title?: string;
  description?: string;
};

export function AppHeader({ profile, title, description }: AppHeaderProps) {
  const { toggleMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground lg:hidden"
            aria-label="Open menu"
            onClick={toggleMobile}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            {title ? (
              <>
                <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
                  {title}
                </h1>
                {description ? (
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">
                    {description}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="truncate text-sm text-muted-foreground">
                Welcome back,{" "}
                <span className="font-medium text-foreground">{profile.full_name}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <GlobalSearch className="hidden sm:flex" />
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground sm:hidden"
            aria-label="Search"
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true }),
              );
            }}
          >
            <span className="text-xs font-bold">⌕</span>
          </button>
          <NotificationDropdown />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
