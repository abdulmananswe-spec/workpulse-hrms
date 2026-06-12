import { router } from "expo-router";
import { Text, View } from "react-native";

import { EmptyState } from "@/components/ui/Feedback";
import { FormCard, SubScreenLayout } from "@/components/ui/SubScreenLayout";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { useAnnouncements } from "@/hooks/useHrQueries";

export default function AnnouncementsScreen() {
  const tokens = useDesignTokens();
  const announcements = useAnnouncements();

  return (
    <SubScreenLayout
      title="Announcements"
      subtitle="Company updates and priority notices"
      onBack={() => router.back()}
    >
      {(announcements.data ?? []).length === 0 ? (
        <EmptyState
          title="No announcements"
          description="Important company updates will appear here."
          icon="megaphone-outline"
        />
      ) : (
        (announcements.data ?? []).map((item) => {
          const tone =
            item.priority === "high"
              ? tokens.dangerSoft
              : item.priority === "medium"
                ? tokens.warningSoft
                : tokens.backgroundElevated;

          return (
            <View
              key={item.id}
              className="mb-4 rounded-3xl p-5"
              style={{
                backgroundColor: tone,
                borderWidth: 1,
                borderColor: tokens.borderSubtle,
              }}
            >
              <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
                {item.priority} priority
              </Text>
              <Text className="mt-2 text-xl font-bold" style={{ color: tokens.text }}>
                {item.title}
              </Text>
              <Text className="mt-3 text-sm leading-6" style={{ color: tokens.textSecondary }}>
                {item.body}
              </Text>
            </View>
          );
        })
      )}
    </SubScreenLayout>
  );
}
