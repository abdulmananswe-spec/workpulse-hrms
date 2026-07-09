import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, RefreshControl, Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { SectionHeader, Skeleton } from "@/components/ui/Feedback";
import { GlassCard } from "@/components/ui/GlassCard";
import { QuickActionCard } from "@/components/ui/QuickActionCard";
import { ScreenSafeTop, ScreenShell } from "@/components/ui/ScreenShell";
import { useAuth } from "@/contexts/AuthContext";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import {
  useCheckInOut,
  useMonthlyAttendance,
  useTodayAttendance,
} from "@/hooks/useHrQueries";
import { formatTime, getWorkingHours } from "@/lib/format";
import { getTodayStatusLabel } from "@/services/attendance";

export default function AttendanceScreen() {
  const { profile } = useAuth();
  const tokens = useDesignTokens();
  const today = useTodayAttendance();
  const month = useMonthlyAttendance();
  const { checkIn, checkOut, isPending } = useCheckInOut();
  const record = today.data;
  const presentCount = (month.data ?? []).filter((r) => r.check_in_time).length;

  const canCheckIn = !record?.check_in_time && !isPending;
  const canCheckOut = Boolean(record?.check_in_time) && !record?.check_out_time && !isPending;

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
    <ScreenSafeTop>
      <ScreenShell
        contentClassName="px-5 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={today.isRefetching || month.isRefetching}
            tintColor={tokens.primary}
            onRefresh={() => {
              void today.refetch();
              void month.refetch();
            }}
          />
        }
      >
        <SectionHeader
          title="Attendance"
          subtitle="Track presence, hours, and monthly performance"
          action={
            <PressableScale onPress={() => router.push("/(app)/attendance/calendar")} haptic>
              <View
                className="h-11 w-11 items-center justify-center rounded-2xl border"
                style={{ backgroundColor: tokens.primarySoft, borderColor: tokens.border }}
              >
                <Ionicons name="calendar" size={20} color={tokens.primary} />
              </View>
            </PressableScale>
          }
        />

        {today.isLoading ? (
          <Skeleton className="mb-5" height={160} />
        ) : (
          <GlassCard className="mb-5 p-5">
            <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
              Today's Presence
            </Text>
            <Text className="mt-1 text-2xl font-black tracking-tight" style={{ color: tokens.text }}>
              {getTodayStatusLabel(record ?? null)}
            </Text>
            <View className="mt-6 flex-row flex-wrap gap-y-5">
              <Metric label="Check-In" value={formatTime(record?.check_in_time ?? null)} icon="log-in-outline" />
              <Metric label="Check-Out" value={formatTime(record?.check_out_time ?? null)} icon="log-out-outline" />
              <Metric
                label="Hours Logged"
                value={getWorkingHours(record?.check_in_time ?? null, record?.check_out_time ?? null)}
                icon="hourglass-outline"
              />
              <Metric label="Branch Location" value={profile?.branch?.name ?? "HQ Office"} icon="location-outline" />
            </View>
          </GlassCard>
        )}

        <QuickActionCard
          title={isPending ? "Processing..." : "Clock In"}
          subtitle="Verify geofence coordinates and start shift"
          icon="log-in-outline"
          onPress={() => void handleCheckIn()}
          disabled={!canCheckIn}
        />
        <QuickActionCard
          title={isPending ? "Processing..." : "Clock Out"}
          subtitle="Record checkout time and close shift"
          icon="log-out-outline"
          colors={["#EF4444", "#DC2626"]}
          onPress={() => void handleCheckOut()}
          disabled={!canCheckOut}
        />

        <GlassCard className="mb-6 mt-2 p-5 flex-row items-center">
          <View className="h-10 w-10 rounded-2xl items-center justify-center bg-indigo-500/10 mr-4">
            <Ionicons name="star" size={20} color={tokens.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-black tracking-tight" style={{ color: tokens.text }}>
              Monthly Summary
            </Text>
            <Text className="mt-1 text-xs leading-4" style={{ color: tokens.textSecondary }}>
              {presentCount} active days recorded. Your punctuality maintains work pulse.
            </Text>
          </View>
        </GlassCard>

        <QuickActionCard
          title="Attendance Calendar"
          subtitle="Detailed ledger of your calendar status"
          icon="grid-outline"
          onPress={() => router.push("/(app)/attendance/calendar")}
        />
        <QuickActionCard
          title="Request Correction"
          subtitle="Log a shift correction request to HR"
          icon="create-outline"
          colors={["#F59E0B", "#D97706"]}
          onPress={() => router.push("/(app)/attendance/correction")}
        />
      </ScreenShell>
    </ScreenSafeTop>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  const tokens = useDesignTokens();
  return (
    <View className="min-w-[48%] pr-2 flex-row items-center">
      <View className="h-8 w-8 rounded-xl items-center justify-center bg-zinc-100 dark:bg-zinc-800 mr-2.5">
        <Ionicons name={icon} size={15} color={tokens.textSecondary} />
      </View>
      <View className="flex-1">
        <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
          {label}
        </Text>
        <Text className="mt-0.5 text-xs font-bold tracking-tight" style={{ color: tokens.text }} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}
