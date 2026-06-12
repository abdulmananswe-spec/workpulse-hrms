import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/Avatar";
import { ListRow } from "@/components/ui/ListRow";
import { useTabBarClearance } from "@/components/navigation/CustomTabBar";
import { useAchievements, useAttendanceStats } from "@/hooks/useHrQueries";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignTokens } from "@/hooks/useDesignTokens";

export default function ProfileScreen() {
  const { profile } = useAuth();
  const tokens = useDesignTokens();
  const stats = useAttendanceStats();
  const { achievements } = useAchievements();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const bottomPad = useTabBarClearance();

  return (
    <View className="flex-1" style={{ backgroundColor: tokens.background }}>
      <LinearGradient colors={tokens.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={["top"]} className="px-5 pb-12 pt-2">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/90">
            Account
          </Text>
          <View className="mt-4 flex-row items-center">
            <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={64} showStatus ring />
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold tracking-tight text-white" numberOfLines={1}>
                {profile?.full_name}
              </Text>
              <Text className="mt-1 text-sm text-indigo-100/90">{profile?.email}</Text>
              <View className="mt-2 self-start rounded-full px-2.5 py-1" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-white">
                  {profile?.designation ?? "Employee"}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        className="-mt-6 flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 flex-row gap-3">
          <MiniStat label="Streak" value={stats.data?.currentStreak ?? 0} suffix="days" />
          <MiniStat label="Best" value={stats.data?.bestStreak ?? 0} suffix="days" />
          <MiniStat label="Badges" value={unlockedCount} />
        </View>

        <View
          className="mb-4 rounded-3xl p-4"
          style={{
            backgroundColor: tokens.backgroundElevated,
            borderWidth: 1,
            borderColor: tokens.borderSubtle,
          }}
        >
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
            Employee Details
          </Text>
          <DetailRow icon="id-card-outline" label="Code" value={profile?.employee_code ?? "—"} />
          <DetailRow icon="call-outline" label="Phone" value={profile?.phone ?? "—"} />
          <DetailRow icon="business-outline" label="Branch" value={profile?.branch?.name ?? "—"} last />
        </View>

        {achievements.slice(0, 2).map((item) => (
          <View
            key={item.id}
            className="mb-2 flex-row items-center rounded-2xl px-4 py-3"
            style={{
              backgroundColor: item.unlocked ? tokens.successSoft : tokens.backgroundMuted,
              borderWidth: 1,
              borderColor: tokens.borderSubtle,
            }}
          >
            <Ionicons
              name={item.icon as keyof typeof Ionicons.glyphMap}
              size={18}
              color={item.unlocked ? tokens.success : tokens.textMuted}
            />
            <Text className="ml-3 flex-1 text-sm font-medium" style={{ color: tokens.text }}>
              {item.title}
            </Text>
            {item.unlocked ? (
              <Ionicons name="checkmark-circle" size={18} color={tokens.success} />
            ) : null}
          </View>
        ))}

        <Text className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
          Manage
        </Text>
        <ListRow
          title="Account Settings"
          subtitle="Security & appearance"
          icon="settings-outline"
          onPress={() => router.push("/(app)/profile/settings")}
        />
        <ListRow
          title="Branch & Location"
          subtitle="Geofence details"
          icon="location-outline"
          onPress={() => router.push("/(app)/profile/branch")}
        />
        <ListRow
          title="Announcements"
          subtitle="Company updates"
          icon="megaphone-outline"
          onPress={() => router.push("/(app)/profile/announcements")}
        />
      </ScrollView>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  const tokens = useDesignTokens();
  return (
    <View className={`flex-row items-center ${last ? "" : "mb-3"}`}>
      <Ionicons name={icon} size={16} color={tokens.textMuted} />
      <Text className="ml-2 w-16 text-xs font-medium" style={{ color: tokens.textMuted }}>
        {label}
      </Text>
      <Text className="flex-1 text-sm font-semibold" style={{ color: tokens.text }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function MiniStat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const tokens = useDesignTokens();
  return (
    <View
      className="flex-1 rounded-2xl px-3 py-3"
      style={{
        backgroundColor: tokens.backgroundElevated,
        borderWidth: 1,
        borderColor: tokens.borderSubtle,
      }}
    >
      <Text className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
        {label}
      </Text>
      <Text className="mt-1 text-xl font-bold" style={{ color: tokens.text }}>
        {value}
        {suffix ? <Text className="text-xs font-medium" style={{ color: tokens.textSecondary }}> {suffix}</Text> : null}
      </Text>
    </View>
  );
}
