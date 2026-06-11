import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/Feedback";
import {
  useAnnouncements,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useHrQueries";
import { getUnreadCount } from "@/services/notifications";

export default function NotificationsScreen() {
  const notifications = useNotifications();
  const announcements = useAnnouncements();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unread = getUnreadCount(notifications.data ?? []);

  return (
    <SafeAreaView className="flex-1 bg-surface-muted" edges={["top"]}>
      <ScrollView
        contentContainerClassName="px-5 pb-28 pt-4"
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
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-slate-900">Notifications</Text>
            <Text className="mt-1 text-sm text-slate-500">{unread} unread alerts</Text>
          </View>
          {unread > 0 ? (
            <Pressable
              onPress={() => void markAll.mutateAsync()}
              className="rounded-full bg-indigo-600 px-4 py-2"
            >
              <Text className="text-sm font-semibold text-white">Mark all read</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={() => router.push("/(app)/profile/announcements")}
          className="mb-6 rounded-3xl bg-white p-4 shadow-premium"
        >
          <View className="flex-row items-center">
            <Ionicons name="megaphone-outline" size={22} color="#4f46e5" />
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-slate-900">Announcements Feed</Text>
              <Text className="text-sm text-slate-500">Company updates and priority notices</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </View>
        </Pressable>

        {(notifications.data ?? []).length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="Leave approvals, attendance updates, and announcements will appear here."
          />
        ) : (
          (notifications.data ?? []).map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                if (!item.is_read) void markRead.mutateAsync(item.id);
              }}
              className={`mb-3 rounded-2xl border p-4 ${
                item.is_read ? "border-slate-100 bg-white" : "border-indigo-100 bg-indigo-50"
              }`}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-slate-900">{item.title}</Text>
                  <Text className="mt-2 text-sm text-slate-600">{item.body}</Text>
                </View>
                {!item.is_read ? (
                  <View className="ml-3 h-2.5 w-2.5 rounded-full bg-indigo-600" />
                ) : null}
              </View>
              <Text className="mt-3 text-xs capitalize text-slate-400">
                {item.type.replaceAll("_", " ")}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
