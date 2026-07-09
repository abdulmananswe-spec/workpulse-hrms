import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/Avatar";
import { EmptyState, SectionHeader, Skeleton } from "@/components/ui/Feedback";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTabBarClearance } from "@/components/navigation/CustomTabBar";
import { PressableScale } from "@/components/ui/PressableScale";
import { QuickActionCard } from "@/components/ui/QuickActionCard";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { useLiveClock } from "@/hooks/useLiveClock";
import {
  useAttendanceStats,
  useCheckInOut,
  useEmployeeDutyHours,
  formatDutyTime,
  useTodayAttendance,
} from "@/hooks/useHrQueries";
import { getGreeting } from "@/lib/format";
import { getTodayStatusLabel } from "@/services/attendance";

export default function HomeScreen() {
  const { profile, refreshProfile } = useAuth();
  const tokens = useDesignTokens();
  const bottomPad = useTabBarClearance();
  const { time, date } = useLiveClock();
  const statsQuery = useAttendanceStats();
  const todayQuery = useTodayAttendance();
  const dutyHours = useEmployeeDutyHours();
  const { checkIn, checkOut, isPending: isAttendancePending } = useCheckInOut();

  const statusLabel = getTodayStatusLabel(todayQuery.data ?? null);
  const canCheckIn = !todayQuery.data?.check_in_time && !isAttendancePending;
  const canCheckOut =
    Boolean(todayQuery.data?.check_in_time) &&
    !todayQuery.data?.check_out_time &&
    !isAttendancePending;

  async function handleCheckIn() {
    try {
      await checkIn();
      Alert.alert("Checked In", "Your attendance has been recorded.");
    } catch (error) {
      Alert.alert("Check-In Failed", error instanceof Error ? error.message : "Try again.");
    }
  }

  async function handleCheckOut() {
    try {
      await checkOut();
      Alert.alert("Checked Out", "Have a great rest of your day.");
    } catch (error) {
      Alert.alert("Check-Out Failed", error instanceof Error ? error.message : "Try again.");
    }
  }

  return (
    <View className="flex-1" style={{ backgroundColor: tokens.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        refreshControl={
          <RefreshControl
            refreshing={statsQuery.isRefetching || todayQuery.isRefetching}
            onRefresh={() => {
              void refreshProfile();
              void statsQuery.refetch();
              void todayQuery.refetch();
            }}
          />
        }
      >
        <LinearGradient colors={tokens.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <SafeAreaView edges={["top"]} className="px-5 pb-6 pt-2">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="rounded-full px-3 py-1" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-indigo-100">
                  WorkPulse
                </Text>
              </View>
              <PressableScale onPress={() => router.push("/(app)/notifications")} haptic={false}>
                <View
                  className="h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
                >
                  <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
                </View>
              </PressableScale>
            </View>

            <View className="flex-row items-center">
              <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={52} showStatus ring />
              <View className="ml-3 flex-1">
                <Text className="text-xs font-medium uppercase tracking-wider text-indigo-100/90">
                  {getGreeting()}
                </Text>
                <Text className="text-[22px] font-bold tracking-tight text-white" numberOfLines={1}>
                  {profile?.full_name ?? "Employee"}
                </Text>
                <Text className="mt-0.5 text-xs text-indigo-100/85" numberOfLines={1}>
                  {profile?.designation ?? "Team Member"} · {profile?.branch?.name ?? "HQ"}
                </Text>
              </View>
            </View>

            <View className="mt-5 flex-row items-end justify-between">
              <View>
                <Text className="text-[32px] font-light tracking-[0.08em] text-white">{time}</Text>
                <Text className="mt-0.5 text-xs text-indigo-100/90">{date}</Text>
              </View>
              <View className="rounded-2xl px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100">
                  Today
                </Text>
                <Text className="text-sm font-bold text-white">{statusLabel}</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View className="px-5 pb-5 pt-5" style={{ backgroundColor: tokens.background }}>
          <View className="flex-row gap-3">
            <View style={{ flex: 1 }}>
              <PressableScale disabled={!canCheckIn} onPress={() => void handleCheckIn()}>
                <LinearGradient
                  colors={
                    canCheckIn ? [tokens.primary, tokens.accent] : [`${tokens.primary}55`, `${tokens.accent}55`]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    height: 132,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 18,
                    justifyContent: "space-between",
                  }}
                >
                  <Ionicons name="log-in-outline" size={22} color="#FFFFFF" />
                  <View>
                    <Text className="text-base font-bold text-white">
                      {isAttendancePending ? "Processing..." : "Check In"}
                    </Text>
                    <Text className="mt-1 text-xs text-white/80">GPS verified</Text>
                  </View>
                </LinearGradient>
              </PressableScale>
            </View>

            <View style={{ flex: 1 }}>
              <PressableScale disabled={!canCheckOut} onPress={() => void handleCheckOut()}>
                <View
                  style={{
                    height: 132,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 18,
                    justifyContent: "space-between",
                    backgroundColor: tokens.backgroundElevated,
                    borderWidth: 1,
                    borderColor: tokens.borderSubtle,
                    opacity: canCheckOut ? 1 : 0.55,
                  }}
                >
                  <Ionicons name="log-out-outline" size={22} color={tokens.primary} />
                  <View>
                    <Text className="text-base font-bold" style={{ color: tokens.text }}>
                      Check Out
                    </Text>
                    <Text className="mt-1 text-xs" style={{ color: tokens.textSecondary }}>
                      End shift
                    </Text>
                  </View>
                </View>
              </PressableScale>
            </View>
          </View>
        </View>

        <View className="px-5">
          {dutyHours.data ? (
            <GlassCard className="mb-5">
              <Text className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
                Shift Window
              </Text>
              <Text className="mt-1 text-base font-semibold" style={{ color: tokens.text }}>
                {formatDutyTime(dutyHours.data.duty_start_time)} – {formatDutyTime(dutyHours.data.duty_end_time)}
              </Text>
            </GlassCard>
          ) : null}

          <SectionHeader title="Performance" subtitle="This month at a glance" />
          <View className="mb-5 flex-row flex-wrap gap-3">
            {statsQuery.isLoading ? (
              <>
                <Skeleton className="flex-1" height={88} />
                <Skeleton className="flex-1" height={88} />
              </>
            ) : statsQuery.data ? (
              <>
                <StatCard label="Present" value={statsQuery.data.presentDays} accent="success" />
                <StatCard label="Absent" value={statsQuery.data.absentDays} accent="danger" />
                <StatCard label="Leave Left" value={statsQuery.data.leaveBalance} suffix="d" />
                <StatCard label="Attendance" value={statsQuery.data.attendancePercentage} suffix="%" accent="primary" />
              </>
            ) : (
              <EmptyState title="Stats unavailable" description="Pull to refresh." icon="analytics-outline" />
            )}
          </View>

          <SectionHeader title="Shortcuts" />
          <QuickActionCard
            title="Apply Leave"
            subtitle="Request time off"
            icon="calendar-outline"
            colors={["#6D28D9", "#8B5CF6"]}
            onPress={() => router.push("/(app)/leaves/apply")}
          />
          <QuickActionCard
            title="Correction Request"
            subtitle="Fix missed attendance"
            icon="create-outline"
            colors={["#C2410C", "#F97316"]}
            onPress={() => router.push("/(app)/attendance/correction")}
          />
        </View>
      </ScrollView>
    </View>
  );
}
