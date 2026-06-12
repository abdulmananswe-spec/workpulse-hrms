import { router } from "expo-router";
import { RefreshControl, Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { EmptyState, SectionHeader } from "@/components/ui/Feedback";
import { ListRow } from "@/components/ui/ListRow";
import { ScreenSafeTop, ScreenShell } from "@/components/ui/ScreenShell";
import {
  useAnnouncements,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useHrQueries";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { getUnreadCount } from "@/services/notifications";

export default function NotificationsScreen() {
  const tokens = useDesignTokens();
  const notifications = useNotifications();
  const announcements = useAnnouncements();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unread = getUnreadCount(notifications.data ?? []);

  return (
    <ScreenSafeTop>
      <ScreenShell
        contentClassName="px-5 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={notifications.isRefetching || announcements.isRefetching}
            onRefresh={() => {
              void notifications.refetch();
              void announcements.refetch();
            }}
          />
        }
      >
        <SectionHeader
          title="Inbox"
          subtitle={`${unread} unread notification${unread === 1 ? "" : "s"}`}
          action={
            unread > 0 ? (
              <PressableScale onPress={() => void markAll.mutateAsync()}>
                <View className="rounded-full px-4 py-2" style={{ backgroundColor: tokens.primary }}>
                  <Text className="text-xs font-semibold text-white">Mark all read</Text>
                </View>
              </PressableScale>
            ) : undefined
          }
        />

        <ListRow
          title="Company Announcements"
          subtitle="Priority updates from your organization"
          icon="megaphone-outline"
          onPress={() => router.push("/(app)/profile/announcements")}
        />

        {(notifications.data ?? []).length === 0 ? (
          <EmptyState
            title="All caught up"
            description="Leave approvals, attendance updates, and HR alerts will appear here."
            icon="notifications-outline"
          />
        ) : (
          (notifications.data ?? []).map((item) => (
            <PressableScale
              key={item.id}
              onPress={() => {
                if (!item.is_read) void markRead.mutateAsync(item.id);
              }}
            >
              <View
                className="mb-3 rounded-3xl p-4"
                style={{
                  backgroundColor: item.is_read ? tokens.backgroundElevated : tokens.primarySoft,
                  borderWidth: 1,
                  borderColor: item.is_read ? tokens.borderSubtle : `${tokens.primary}33`,
                }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="font-semibold" style={{ color: tokens.text }}>
                      {item.title}
                    </Text>
                    <Text className="mt-2 text-sm leading-5" style={{ color: tokens.textSecondary }}>
                      {item.body}
                    </Text>
                  </View>
                  {!item.is_read ? (
                    <View
                      className="mt-1 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: tokens.primary }}
                    />
                  ) : null}
                </View>
                <Text
                  className="mt-3 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: tokens.textMuted }}
                >
                  {item.type.replaceAll("_", " ")}
                </Text>
              </View>
            </PressableScale>
          ))
        )}
      </ScreenShell>
    </ScreenSafeTop>
  );
}
