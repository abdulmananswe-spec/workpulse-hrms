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
        <SafeAreaView edges={["top"]} className="px-5 pb-10 pt-3">
          <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">
            My Workspace
          </Text>
          <View className="mt-4 flex-row items-center">
            <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={64} showStatus ring />
            <View className="ml-4 flex-1">
              <Text className="text-xl font-black tracking-tight text-white" numberOfLines={1}>
                {profile?.full_name}
              </Text>
              <Text className="text-xs font-medium text-indigo-200/90" numberOfLines={1}>{profile?.email}</Text>
              <View className="mt-2.5 self-start rounded-full px-3 py-1" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <Text className="text-[9px] font-bold uppercase tracking-wider text-white">
                  {profile?.designation ?? "Employee"}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        className="-mt-5 flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 flex-row gap-4">
          <MiniStat label="Streak" value={stats.data?.currentStreak ?? 0} suffix="days" icon="flame" iconColor="#EF4444" />
          <MiniStat label="Best" value={stats.data?.bestStreak ?? 0} suffix="days" icon="trophy" iconColor="#F59E0B" />
          <MiniStat label="Badges" value={unlockedCount} icon="ribbon" iconColor="#6366F1" />
        </View>

        <View
          className="mb-5 rounded-[24px] p-5 border"
          style={{
            backgroundColor: tokens.backgroundElevated,
            borderColor: tokens.border,
          }}
        >
          <Text className="mb-4 text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
            Employee Details
          </Text>
          <DetailRow icon="id-card-outline" label="Code" value={profile?.employee_code ?? "—"} />
          <DetailRow icon="call-outline" label="Phone" value={profile?.phone ?? "—"} />
          <DetailRow icon="business-outline" label="Branch" value={profile?.branch?.name ?? "—"} last />
        </View>

        {/* Unlocked badges previews */}
        <View className="mb-5">
          {achievements.slice(0, 2).map((item) => (
            <View
              key={item.id}
              className="mb-2 flex-row items-center rounded-2xl px-4 py-3 border"
              style={{
                backgroundColor: item.unlocked ? tokens.successSoft : tokens.backgroundMuted,
                borderColor: item.unlocked ? `${tokens.success}22` : tokens.border,
              }}
            >
              <View className="h-7 w-7 rounded-lg items-center justify-center bg-white/10 dark:bg-black/10 mr-3">
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={item.unlocked ? tokens.success : tokens.textMuted}
                />
              </View>
              <View className="flex-grow">
                <Text className="text-xs font-bold tracking-tight" style={{ color: tokens.text }}>
                  {item.title}
                </Text>
              </View>
              {item.unlocked ? (
                <Ionicons name="checkmark-circle" size={16} color={tokens.success} />
              ) : (
                <Ionicons name="lock-closed-outline" size={14} color={tokens.textMuted} />
              )}
            </View>
          ))}
        </View>

        <Text className="mb-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
          Account Controls
        </Text>
        <ListRow
          title="Account Settings"
          subtitle="Security, notification & theme options"
          icon="settings-outline"
          onPress={() => router.push("/(app)/profile/settings")}
        />
        <ListRow
          title="Branch & Geofence"
          subtitle="Office location & coordinate logs"
          icon="location-outline"
          onPress={() => router.push("/(app)/profile/branch")}
        />
        <ListRow
          title="Announcements"
          subtitle="Important broadcasts & updates"
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
    <View className={`flex-row items-center ${last ? "" : "mb-3.5"}`}>
      <View className="h-7 w-7 rounded-lg items-center justify-center bg-zinc-100 dark:bg-zinc-800 mr-3">
        <Ionicons name={icon} size={15} color={tokens.textSecondary} />
      </View>
      <Text className="w-16 text-xs font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
        {label}
      </Text>
      <Text className="flex-1 text-sm font-semibold tracking-tight" style={{ color: tokens.text }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function MiniStat({
  label,
  value,
  suffix,
  icon,
  iconColor,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}) {
  const tokens = useDesignTokens();
  return (
    <View
      className="flex-1 rounded-[20px] p-3.5 border"
      style={{
        backgroundColor: tokens.backgroundElevated,
        borderColor: tokens.border,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
          {label}
        </Text>
        <Ionicons name={icon} size={14} color={iconColor} />
      </View>
      <Text className="text-xl font-black" style={{ color: tokens.text }}>
        {value}
        {suffix ? <Text className="text-[10px] font-semibold" style={{ color: tokens.textSecondary }}> {suffix}</Text> : null}
      </Text>
    </View>
  );
}
