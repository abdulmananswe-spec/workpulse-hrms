import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/Feedback";
import { useAnnouncements } from "@/hooks/useHrQueries";

const priorityStyles = {
  high: "border-rose-200 bg-rose-50",
  medium: "border-amber-200 bg-amber-50",
  low: "border-slate-200 bg-white",
} as const;

export default function AnnouncementsScreen() {
  const announcements = useAnnouncements();

  return (
    <SafeAreaView className="flex-1 bg-surface-muted" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-semibold text-indigo-600">Back</Text>
        </Pressable>
        <Text className="text-3xl font-bold text-slate-900">Announcements</Text>
        <Text className="mt-1 text-sm text-slate-500">Company updates and priority notices</Text>

        {(announcements.data ?? []).length === 0 ? (
          <View className="mt-8">
            <EmptyState
              title="No announcements"
              description="Important company updates will appear here."
            />
          </View>
        ) : (
          (announcements.data ?? []).map((item) => (
            <View
              key={item.id}
              className={`mb-4 rounded-3xl border p-5 shadow-premium ${priorityStyles[item.priority]}`}
            >
              <Text className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {item.priority} priority
              </Text>
              <Text className="mt-2 text-xl font-bold text-slate-900">{item.title}</Text>
              <Text className="mt-3 text-sm leading-6 text-slate-600">{item.body}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
