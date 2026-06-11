import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/Avatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAchievements, useAttendanceStats } from "@/hooks/useHrQueries";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { profile } = useAuth();
  const stats = useAttendanceStats();
  const { achievements } = useAchievements();

  return (
    <SafeAreaView className="flex-1 bg-surface-muted" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-28 pt-4">
        <Text className="text-3xl font-bold text-slate-900">Profile</Text>

        <GlassCard className="mt-6">
          <View className="flex-row items-center">
            <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={72} />
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-slate-900">{profile?.full_name}</Text>
              <Text className="mt-1 text-sm text-slate-500">{profile?.designation ?? "Employee"}</Text>
              <Text className="text-sm text-slate-500">{profile?.branch?.name ?? "No branch assigned"}</Text>
            </View>
          </View>
        </GlassCard>

        <View className="mt-6 rounded-3xl bg-white p-5 shadow-premium">
          <InfoRow label="Email" value={profile?.email ?? "—"} />
          <InfoRow label="Phone" value={profile?.phone ?? "—"} />
          <InfoRow label="Employee Code" value={profile?.employee_code ?? "—"} />
          <InfoRow label="Department" value={profile?.designation ?? "—"} />
          <InfoRow label="Branch" value={profile?.branch?.name ?? "—"} />
        </View>

        <View className="mt-6 flex-row gap-3">
          <MiniStat label="Current Streak" value={stats.data?.currentStreak ?? 0} />
          <MiniStat label="Best Streak" value={stats.data?.bestStreak ?? 0} />
        </View>

        <Text className="mb-3 mt-8 text-lg font-bold text-slate-900">Achievements</Text>
        {achievements.map((item) => (
          <View
            key={item.id}
            className={`mb-3 flex-row items-center rounded-2xl p-4 ${
              item.unlocked ? "bg-emerald-50" : "bg-slate-100"
            }`}
          >
            <Ionicons
              name={item.icon as keyof typeof Ionicons.glyphMap}
              size={22}
              color={item.unlocked ? "#059669" : "#94a3b8"}
            />
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-slate-900">{item.title}</Text>
              <Text className="text-sm text-slate-500">{item.description}</Text>
            </View>
          </View>
        ))}

        <View className="mt-6 gap-3">
          <MenuLink title="Account Settings" onPress={() => router.push("/(app)/profile/settings")} />
          <MenuLink title="Branch Information" onPress={() => router.push("/(app)/profile/branch")} />
          <MenuLink title="Announcements" onPress={() => router.push("/(app)/profile/announcements")} />
        </View>

        <View className="mt-8 items-center pb-4">
          <Text className="text-center text-xs text-slate-400">© 2026 WorkPulse HRMS</Text>
          <Text className="mt-1 text-center text-xs text-slate-400">Developed by Abdul Manan</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</Text>
      <Text className="mt-1 text-base text-slate-900">{value}</Text>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 rounded-3xl bg-white p-4 shadow-premium">
      <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</Text>
      <Text className="mt-2 text-3xl font-bold text-slate-900">{value}</Text>
    </View>
  );
}

function MenuLink({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center rounded-2xl bg-white p-4 shadow-premium">
      <Text className="flex-1 font-semibold text-slate-900">{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </Pressable>
  );
}
