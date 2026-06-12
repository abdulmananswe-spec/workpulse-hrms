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
            <PressableScale onPress={() => router.push("/(app)/attendance/calendar")}>
              <View
                className="h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: tokens.primarySoft }}
              >
                <Ionicons name="calendar-outline" size={22} color={tokens.primary} />
              </View>
            </PressableScale>
          }
        />

        {today.isLoading ? (
          <Skeleton className="mb-5" height={160} />
        ) : (
          <GlassCard className="mb-5">
            <Text className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
              Current Status
            </Text>
            <Text className="mt-2 text-2xl font-bold tracking-tight" style={{ color: tokens.text }}>
              {getTodayStatusLabel(record ?? null)}
            </Text>
            <View className="mt-5 flex-row flex-wrap gap-y-4">
              <Metric label="Check-In" value={formatTime(record?.check_in_time ?? null)} />
              <Metric label="Check-Out" value={formatTime(record?.check_out_time ?? null)} />
              <Metric
                label="Working Hours"
                value={getWorkingHours(record?.check_in_time ?? null, record?.check_out_time ?? null)}
              />
              <Metric label="Branch" value={profile?.branch?.name ?? "Not assigned"} />
            </View>
          </GlassCard>
        )}

        <QuickActionCard
          title={isPending ? "Processing..." : "Check In Now"}
          subtitle="Verify location and start your workday"
          icon="log-in-outline"
          onPress={() => void handleCheckIn()}
          disabled={!canCheckIn}
        />
        <QuickActionCard
          title={isPending ? "Processing..." : "Check Out Now"}
          subtitle="Securely end your shift"
          icon="log-out-outline"
          colors={["#0F766E", "#14B8A6"]}
          onPress={() => void handleCheckOut()}
          disabled={!canCheckOut}
        />

        <GlassCard className="mb-6 mt-2">
          <Text className="text-lg font-bold" style={{ color: tokens.text }}>
            Monthly Summary
          </Text>
          <Text className="mt-2 text-sm leading-5" style={{ color: tokens.textSecondary }}>
            {presentCount} present days recorded this month. Keep your streak going.
          </Text>
        </GlassCard>

        <QuickActionCard
          title="Attendance Calendar"
          subtitle="View present, absent, and leave days"
          icon="grid-outline"
          onPress={() => router.push("/(app)/attendance/calendar")}
        />
        <QuickActionCard
          title="Request Correction"
          subtitle="Fix missed attendance entries"
          icon="create-outline"
          colors={["#C2410C", "#F97316"]}
          onPress={() => router.push("/(app)/attendance/correction")}
        />
      </ScreenShell>
    </ScreenSafeTop>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const tokens = useDesignTokens();
  return (
    <View className="min-w-[48%] pr-3">
      <Text className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
        {label}
      </Text>
      <Text className="mt-1 text-base font-semibold" style={{ color: tokens.text }}>
        {value}
      </Text>
    </View>
  );
}
