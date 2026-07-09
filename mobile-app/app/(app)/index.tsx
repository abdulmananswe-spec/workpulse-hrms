import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

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

  // Pulse animation for the check-in beacon
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (canCheckIn) {
      pulseScale.value = withRepeat(withTiming(1.3, { duration: 1600 }), -1, false);
      pulseOpacity.value = withRepeat(withTiming(0, { duration: 1600 }), -1, false);
    } else {
      pulseScale.value = 1;
      pulseOpacity.value = 0;
    }
  }, [canCheckIn]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    };
  });

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
            tintColor={tokens.primary}
            onRefresh={() => {
              void refreshProfile();
              void statsQuery.refetch();
              void todayQuery.refetch();
            }}
          />
        }
      >
        <LinearGradient colors={tokens.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <SafeAreaView edges={["top"]} className="px-5 pb-8 pt-3">
            <View className="mb-6 flex-row items-center justify-between">
              <View className="rounded-full px-3.5 py-1.5" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  WorkPulse
                </Text>
              </View>
              <PressableScale onPress={() => router.push("/(app)/notifications")} haptic className="relative">
                <View
                  className="h-10 w-10 items-center justify-center rounded-2xl border border-white/10"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                >
                  <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
                </View>
              </PressableScale>
            </View>

            <View className="flex-row items-center">
              <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={56} showStatus ring />
              <View className="ml-4 flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/90">
                  {getGreeting()}
                </Text>
                <Text className="text-xl font-black tracking-tight text-white" numberOfLines={1}>
                  {profile?.full_name ?? "Employee"}
                </Text>
                <Text className="mt-0.5 text-xs font-semibold text-indigo-100/75" numberOfLines={1}>
                  {profile?.designation ?? "Team Member"} · {profile?.branch?.name ?? "HQ"}
                </Text>
              </View>
            </View>

            <View className="mt-8 flex-row items-end justify-between">
              <View>
                <Text className="text-[34px] font-light tracking-[0.06em] text-white">{time}</Text>
                <Text className="mt-1 text-xs font-medium text-indigo-200/80">{date}</Text>
              </View>
              <View className="rounded-2xl px-4 py-2.5" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <Text className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">
                  Duty Status
                </Text>
                <Text className="mt-0.5 text-xs font-bold text-white">{statusLabel}</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View className="px-5 pb-5 pt-6" style={{ backgroundColor: tokens.background }}>
          <View className="flex-row gap-4">
            <View style={{ flex: 1 }}>
              <PressableScale disabled={!canCheckIn} onPress={() => void handleCheckIn()} haptic>
                <View style={{ height: 140, position: "relative", width: "100%" }}>
                  {canCheckIn ? (
                    <Animated.View
                      style={[
                        pulseStyle,
                        {
                          position: "absolute",
                          inset: 0,
                          borderRadius: 24,
                          backgroundColor: tokens.primary,
                        },
                      ]}
                    />
                  ) : null}
                  <LinearGradient
                    colors={
                      canCheckIn ? [tokens.primary, tokens.accent] : [`${tokens.backgroundMuted}`, `${tokens.backgroundMuted}`]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      height: 140,
                      borderRadius: 24,
                      paddingHorizontal: 16,
                      paddingVertical: 20,
                      justifyContent: "space-between",
                      borderWidth: canCheckIn ? 0 : 1,
                      borderColor: tokens.border,
                      shadowColor: tokens.primary,
                      shadowOffset: { width: 0, height: canCheckIn ? 12 : 0 },
                      shadowOpacity: canCheckIn ? 0.24 : 0,
                      shadowRadius: 24,
                      elevation: canCheckIn ? 8 : 0,
                    }}
                  >
                    <View className="h-10 w-10 rounded-2xl items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                      <Ionicons name="log-in-outline" size={22} color={canCheckIn ? "#FFFFFF" : tokens.textMuted} />
                    </View>
                    <View>
                      <Text className="text-base font-black tracking-tight" style={{ color: canCheckIn ? "#FFFFFF" : tokens.textSecondary }}>
                        {isAttendancePending ? "Processing..." : "Check In"}
                      </Text>
                      <Text className="mt-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: canCheckIn ? "rgba(255,255,255,0.8)" : tokens.textMuted }}>
                        GPS Verified
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              </PressableScale>
            </View>

            <View style={{ flex: 1 }}>
              <PressableScale disabled={!canCheckOut} onPress={() => void handleCheckOut()} haptic>
                <View
                  style={{
                    height: 140,
                    borderRadius: 24,
                    paddingHorizontal: 16,
                    paddingVertical: 20,
                    justifyContent: "space-between",
                    backgroundColor: tokens.backgroundElevated,
                    borderWidth: 1,
                    borderColor: tokens.border,
                    opacity: canCheckOut ? 1 : 0.55,
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: canCheckOut ? 8 : 0 },
                    shadowOpacity: canCheckOut ? 0.05 : 0,
                    shadowRadius: 16,
                    elevation: canCheckOut ? 4 : 0,
                  }}
                >
                  <View className="h-10 w-10 rounded-2xl items-center justify-center" style={{ backgroundColor: tokens.backgroundMuted }}>
                    <Ionicons name="log-out-outline" size={22} color={canCheckOut ? tokens.primary : tokens.textMuted} />
                  </View>
                  <View>
                    <Text className="text-base font-black tracking-tight" style={{ color: canCheckOut ? tokens.text : tokens.textSecondary }}>
                      Check Out
                    </Text>
                    <Text className="mt-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
                      End Shift
                    </Text>
                  </View>
                </View>
              </PressableScale>
            </View>
          </View>
        </View>

        <View className="px-5">
          {dutyHours.data ? (
            <GlassCard className="mb-6 flex-row items-center p-4">
              <View className="h-9 w-9 rounded-xl items-center justify-center bg-indigo-500/10 mr-3">
                <Ionicons name="time" size={18} color={tokens.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
                  Shift Window
                </Text>
                <Text className="mt-0.5 text-sm font-bold tracking-tight" style={{ color: tokens.text }}>
                  {formatDutyTime(dutyHours.data.duty_start_time)} – {formatDutyTime(dutyHours.data.duty_end_time)}
                </Text>
              </View>
            </GlassCard>
          ) : null}

          <SectionHeader title="Performance" subtitle="This month at a glance" />
          <View className="mb-6 flex-row flex-wrap gap-4">
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
            colors={[tokens.primary, tokens.accent]}
            onPress={() => router.push("/(app)/leaves/apply")}
          />
          <QuickActionCard
            title="Correction Request"
            subtitle="Fix missed attendance"
            icon="create-outline"
            colors={["#EF4444", "#F59E0B"]}
            onPress={() => router.push("/(app)/attendance/correction")}
          />
        </View>
      </ScrollView>
    </View>
  );
}
