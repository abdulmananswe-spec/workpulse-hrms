import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/Avatar";
import { QuickActionCard } from "@/components/ui/QuickActionCard";
import { Skeleton, EmptyState } from "@/components/ui/Feedback";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveClock } from "@/hooks/useLiveClock";
import {
  useAttendanceStats,
  useCheckInOut,
  useOrgSettings,
  formatDutyTime,
  useTodayAttendance,
} from "@/hooks/useHrQueries";
import { getGreeting } from "@/lib/format";
import { getTodayStatusLabel } from "@/services/attendance";
import { useTheme } from "@/providers/ThemeProvider";

export default function HomeScreen() {
  const { profile, refreshProfile } = useAuth();
  const { isDark } = useTheme();
  const { time, date } = useLiveClock();
  const statsQuery = useAttendanceStats();
  const todayQuery = useTodayAttendance();
  const orgSettings = useOrgSettings();
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
    <View className={`flex-1 ${isDark ? "bg-slate-950" : "bg-surface-muted"}`}>
      <LinearGradient
        colors={isDark ? ["#0f172a", "#312e81"] : ["#312e81", "#4f46e5"]}
        className="px-5 pb-28 pt-14"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center">
            <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={64} />
            <View className="ml-4 flex-1">
              <Text className="text-sm text-indigo-100">{getGreeting()}</Text>
              <Text className="text-2xl font-bold text-white">
                {profile?.full_name ?? "Employee"}
              </Text>
              <Text className="mt-1 text-sm text-indigo-100">
                {profile?.designation ?? "Team Member"} · {profile?.branch?.name ?? "No Branch"}
              </Text>
            </View>
          </View>
          <Text className="mt-6 text-4xl font-light tracking-widest text-white">{time}</Text>
          <Text className="mt-1 text-sm text-indigo-100">{date}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        className="-mt-20 flex-1"
        contentContainerClassName="px-5 pb-28"
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
        <GlassCard className={`mb-5 shadow-glow ${isDark ? "bg-slate-900/80" : ""}`}>
          <Text className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Today&apos;s Status
          </Text>
          <Text className={`mt-2 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {statusLabel}
          </Text>
          {orgSettings.data ? (
            <Text className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Duty hours: {formatDutyTime(orgSettings.data.duty_start_time)} –{" "}
              {formatDutyTime(orgSettings.data.duty_end_time)}
            </Text>
          ) : null}
        </GlassCard>

        <View className="mb-5 flex-row flex-wrap gap-3">
          {statsQuery.isLoading ? (
            <>
              <Skeleton className="h-24 flex-1" />
              <Skeleton className="h-24 flex-1" />
            </>
          ) : statsQuery.data ? (
            <>
              <StatCard label="Present Days" value={statsQuery.data.presentDays} />
              <StatCard label="Absent Days" value={statsQuery.data.absentDays} colors={["#fff1f2", "#ffffff"]} />
              <StatCard label="Leave Balance" value={statsQuery.data.leaveBalance} suffix="days" />
              <StatCard
                label="Attendance"
                value={statsQuery.data.attendancePercentage}
                suffix="%"
                colors={["#ecfdf5", "#ffffff"]}
              />
            </>
          ) : (
            <EmptyState title="Stats unavailable" description="Pull to refresh your dashboard." />
          )}
        </View>

        <Text className={`mb-3 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Quick Actions
        </Text>
        <QuickActionCard
          title={isAttendancePending ? "Processing..." : "Check In"}
          subtitle="Start your workday with GPS verification"
          icon="log-in-outline"
          onPress={() => void handleCheckIn()}
          disabled={!canCheckIn}
        />
        <QuickActionCard
          title={isAttendancePending ? "Processing..." : "Check Out"}
          subtitle="End your workday securely"
          icon="log-out-outline"
          colors={["#0f766e", "#14b8a6"]}
          onPress={() => void handleCheckOut()}
          disabled={!canCheckOut}
        />
        <QuickActionCard
          title="Apply Leave"
          subtitle="Request time off in seconds"
          icon="calendar-outline"
          colors={["#7c3aed", "#a855f7"]}
          onPress={() => router.push("/(app)/leaves/apply")}
        />
        <QuickActionCard
          title="Attendance Correction"
          subtitle="Submit missed check-in or check-out"
          icon="create-outline"
          colors={["#ea580c", "#f97316"]}
          onPress={() => router.push("/(app)/attendance/correction")}
        />
      </ScrollView>
    </View>
  );
}
