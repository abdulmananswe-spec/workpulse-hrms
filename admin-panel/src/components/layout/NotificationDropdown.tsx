"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchAdminNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import { cn } from "@/lib/utils";

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotificationDropdown() {
  const queryClient = useQueryClient();

  const countQuery = useQuery({
    queryKey: ["admin-notifications-count"],
    queryFn: fetchUnreadNotificationCount,
    refetchInterval: 60_000,
  });

  const listQuery = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => fetchAdminNotifications(15),
    enabled: false,
  });

  const markRead = useMutation({
    mutationFn: markNotificationReadAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-notifications-count"] });
    },
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsReadAction,
    onSuccess: () => {
      toast.success("All notifications marked as read");
      void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-notifications-count"] });
    },
  });

  const unread = countQuery.data ?? 0;

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) void listQuery.refetch();
      }}
    >
      <DropdownMenuTrigger
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[min(100vw-2rem,22rem)]">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unread > 0 ? (
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-medium text-primary"
              onClick={() => void markAll.mutateAsync()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {listQuery.isFetching ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (listQuery.data ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BellOff className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">All caught up</p>
            <p className="text-xs text-muted-foreground">
              New employee, leave, and branch alerts will appear here.
            </p>
          </div>
        ) : (
          (listQuery.data ?? []).map((item) => (
            <DropdownMenuItem
              key={item.id}
              className={cn("flex-col items-start gap-1 py-3", !item.is_read && "bg-primary/5")}
              onSelect={() => {
                if (!item.is_read) void markRead.mutateAsync(item.id);
              }}
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.message}</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {item.type} · {formatTime(item.created_at)}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
