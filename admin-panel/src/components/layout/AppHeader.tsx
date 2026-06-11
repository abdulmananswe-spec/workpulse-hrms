"use client";

import { Bell, Search } from "lucide-react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Input } from "@/components/ui/input";
import type { Profile } from "@/types/database";

type AppHeaderProps = {
  profile: Profile;
  title?: string;
  description?: string;
};

export function AppHeader({ profile, title, description }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <div className="min-w-0">
          {title ? (
            <>
              <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
              {description ? (
                <p className="truncate text-sm text-muted-foreground">{description}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Welcome back, <span className="font-medium text-foreground">{profile.full_name}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employees, branches..."
              className="w-72 pl-9"
              readOnly
              aria-label="Global search"
            />
          </div>
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
