import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/ui/GlassCard";
import { QuickActionCard } from "@/components/ui/QuickActionCard";
import { Skeleton } from "@/components/ui/Feedback";
import { useAuth } from "@/contexts/AuthContext";
import { useMonthlyAttendance, useTodayAttendance } from "@/hooks/useHrQueries";
import { formatTime, getWorkingHours } from "@/lib/format";
import { getTodayStatusLabel } from "@/services/attendance";

export default function AttendanceScreen() {
  const { profile } = useAuth();
  const today = useTodayAttendance();
  const month = useMonthlyAttendance();
  const record = today.data;
  const presentCount = (month.data ?? []).filter((r) => r.check_in_time).length;

  return (
    <SafeAreaView className="flex-1 bg-surface-muted" edges={["top"]}>
      <ScrollView
        contentContainerClassName="px-5 pb-28 pt-4"
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
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-slate-900">Attendance</Text>
            <Text className="mt-1 text-sm text-slate-500">Track your daily presence</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(app)/attendance/calendar")}
            className="rounded-2xl bg-white p-3 shadow-premium"
          >
            <Ionicons name="calendar-outline" size={22} color="#4f46e5" />
          </Pressable>
        </View>

        {today.isLoading ? (
          <Skeleton className="mb-5 h-40" />
        ) : (
          <GlassCard className="mb-5">
            <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Current Status
            </Text>
            <Text className="mt-2 text-2xl font-bold text-slate-900">
              {getTodayStatusLabel(record ?? null)}
            </Text>
            <View className="mt-5 flex-row flex-wrap gap-4">
              <Metric label="Check-In" value={formatTime(record?.check_in_time ?? null)} />
              <Metric label="Check-Out" value={formatTime(record?.check_out_time ?? null)} />
              <Metric
                label="Working Hours"
                value={getWorkingHours(record?.check_in_time ?? null, record?.check_out_time ?? null)}
              />
              <Metric
                label="Location"
                value={profile?.branch?.name ? "Branch Assigned" : "Not Assigned"}
              />
            </View>
          </GlassCard>
        )}

        <GlassCard className="mb-5">
          <Text className="text-lg font-bold text-slate-900">Monthly Summary</Text>
          <Text className="mt-2 text-sm text-slate-500">
            {presentCount} present days recorded this month.
          </Text>
        </GlassCard>

        <QuickActionCard
          title="Open Calendar"
          subtitle="View present, absent, and leave days"
          icon="grid-outline"
          onPress={() => router.push("/(app)/attendance/calendar")}
        />
        <QuickActionCard
          title="Request Correction"
          subtitle="Fix missed attendance entries"
          icon="create-outline"
          colors={["#ea580c", "#f97316"]}
          onPress={() => router.push("/(app)/attendance/correction")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[45%]">
      <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</Text>
      <Text className="mt-1 text-base font-semibold text-slate-900">{value}</Text>
    </View>
  );
}
