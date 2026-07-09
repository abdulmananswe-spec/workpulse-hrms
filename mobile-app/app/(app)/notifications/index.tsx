import { router } from "expo-router";
import { RefreshControl, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
            tintColor={tokens.primary}
            onRefresh={() => {
              void notifications.refetch();
              void announcements.refetch();
            }}
          />
        }
      >
        <SectionHeader
          title="Inbox"
          subtitle={`${unread} unread message${unread === 1 ? "" : "s"}`}
          action={
            unread > 0 ? (
              <PressableScale onPress={() => void markAll.mutateAsync()} haptic>
                <View className="rounded-full px-3.5 py-2" style={{ backgroundColor: tokens.primary }}>
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-white">Mark all read</Text>
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

        <View className="mt-4">
          {(notifications.data ?? []).length === 0 ? (
            <EmptyState
              title="All Caught Up"
              description="Approvals, system alerts, and notifications will be listed here."
              icon="notifications-outline"
            />
          ) : (
            (notifications.data ?? []).map((item) => (
              <PressableScale
                key={item.id}
                onPress={() => {
                  if (!item.is_read) void markRead.mutateAsync(item.id);
                }}
                scale={0.98}
                haptic
              >
                <View
                  className="mb-3 rounded-[22px] p-5 border"
                  style={{
                    backgroundColor: item.is_read ? tokens.backgroundElevated : tokens.primarySoft,
                    borderColor: item.is_read ? tokens.border : `${tokens.primary}22`,
                  }}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center">
                        <View className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: item.is_read ? "transparent" : tokens.primary }} />
                        <Text className="font-bold text-sm tracking-tight flex-1" style={{ color: tokens.text }} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </View>
                      <Text className="mt-2 text-xs leading-5" style={{ color: tokens.textSecondary }}>
                        {item.body}
                      </Text>
                    </View>
                    <Ionicons name="chatbox-ellipses-outline" size={18} color={item.is_read ? tokens.textMuted : tokens.primary} />
                  </View>
                  <View className="mt-4 flex-row items-center justify-between border-t pt-2.5" style={{ borderColor: tokens.borderSubtle }}>
                    <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
                      {item.type.replaceAll("_", " ")}
                    </Text>
                    {item.is_read ? (
                      <Text className="text-[9px] font-semibold" style={{ color: tokens.textMuted }}>Read</Text>
                    ) : (
                      <Text className="text-[9px] font-bold" style={{ color: tokens.primary }}>New</Text>
                    )}
                  </View>
                </View>
              </PressableScale>
            ))
          )}
        </View>
      </ScreenShell>
    </ScreenSafeTop>
  );
}
