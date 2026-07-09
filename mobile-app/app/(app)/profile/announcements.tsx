import { router } from "expo-router";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { EmptyState, StatusBadge } from "@/components/ui/Feedback";
import { FormCard, SubScreenLayout } from "@/components/ui/SubScreenLayout";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { useAnnouncements } from "@/hooks/useHrQueries";

export default function AnnouncementsScreen() {
  const tokens = useDesignTokens();
  const announcements = useAnnouncements();

  return (
    <SubScreenLayout
      title="Announcements"
      subtitle="Broadcast notifications and organizational notices."
      onBack={() => router.back()}
    >
      {(announcements.data ?? []).length === 0 ? (
        <EmptyState
          title="No Announcements"
          description="Priority broadcasts and organizational notes will be listed here."
          icon="megaphone-outline"
        />
      ) : (
        (announcements.data ?? []).map((item) => {
          const isHigh = item.priority === "high";
          const isMedium = item.priority === "medium";
          const borderStyle = isHigh
            ? `${tokens.danger}44`
            : isMedium
              ? `${tokens.warning}44`
              : tokens.border;

          return (
            <View
              key={item.id}
              className="mb-4 rounded-[22px] p-5 border"
              style={{
                backgroundColor: tokens.backgroundElevated,
                borderColor: borderStyle,
              }}
            >
              <View className="flex-row items-center justify-between pb-3 border-b" style={{ borderColor: tokens.borderSubtle }}>
                <View className="flex-row items-center">
                  <View className="h-7 w-7 rounded-lg items-center justify-center bg-indigo-500/10 mr-2.5">
                    <Ionicons name="megaphone" size={14} color={tokens.primary} />
                  </View>
                  <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
                    Broadcast Announcement
                  </Text>
                </View>
                <StatusBadge
                  label={`${item.priority} priority`}
                  tone={isHigh ? "danger" : isMedium ? "warning" : "neutral"}
                />
              </View>

              <Text className="mt-3.5 text-base font-black tracking-tight" style={{ color: tokens.text }}>
                {item.title}
              </Text>
              <Text className="mt-2 text-xs leading-5" style={{ color: tokens.textSecondary }}>
                {item.body}
              </Text>
            </View>
          );
        })
      )}
    </SubScreenLayout>
  );
}
