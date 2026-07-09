import { router } from "expo-router";
import { RefreshControl, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PressableScale } from "@/components/ui/PressableScale";
import { EmptyState, SectionHeader, Skeleton, StatusBadge } from "@/components/ui/Feedback";
import { GlassCard } from "@/components/ui/GlassCard";
import { QuickActionCard } from "@/components/ui/QuickActionCard";
import { ScreenSafeTop, ScreenShell } from "@/components/ui/ScreenShell";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { useLeaveBalances, useLeaveRequests } from "@/hooks/useHrQueries";
import { LEAVE_TYPE_LABELS } from "@/types/hr";

export default function LeavesScreen() {
  const tokens = useDesignTokens();
  const balances = useLeaveBalances();
  const requests = useLeaveRequests();
  const totalRemaining = (balances.data ?? []).reduce((sum, b) => sum + b.remaining_days, 0);

  return (
    <ScreenSafeTop>
      <ScreenShell
        contentClassName="px-5 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={balances.isRefetching || requests.isRefetching}
            tintColor={tokens.primary}
            onRefresh={() => {
              void balances.refetch();
              void requests.refetch();
            }}
          />
        }
      >
        <SectionHeader title="Leave Manager" subtitle="Plan time off with clarity and confidence" />

        <GlassCard className="mb-6 p-5 flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
              Total Remaining
            </Text>
            <Text className="mt-1 text-4xl font-black tracking-tight" style={{ color: tokens.text }}>
              {totalRemaining} Days
            </Text>
            <Text className="mt-1 text-xs" style={{ color: tokens.textSecondary }}>
              available across all leave categories
            </Text>
          </View>
          <View className="h-14 w-14 rounded-full bg-indigo-500/10 items-center justify-center">
            <Ionicons name="calendar-outline" size={26} color={tokens.primary} />
          </View>
        </GlassCard>

        <View className="mb-6 flex-row flex-wrap gap-4">
          {balances.isLoading ? (
            <>
              <Skeleton className="min-w-[47%] flex-1" height={100} />
              <Skeleton className="min-w-[47%] flex-1" height={100} />
            </>
          ) : (
            (balances.data ?? []).map((balance) => {
              const usedDays = balance.total_days - balance.remaining_days;
              const progress = balance.total_days > 0 ? balance.remaining_days / balance.total_days : 0;
              return (
                <View
                  key={balance.leave_type}
                  className="min-w-[47%] flex-1 rounded-[22px] p-4 border"
                  style={{
                    backgroundColor: tokens.backgroundElevated,
                    borderColor: tokens.border,
                  }}
                >
                  <Text className="text-xs font-bold" style={{ color: tokens.textSecondary }} numberOfLines={1}>
                    {LEAVE_TYPE_LABELS[balance.leave_type]}
                  </Text>
                  <Text className="mt-2 text-2xl font-black" style={{ color: tokens.text }}>
                    {balance.remaining_days}
                  </Text>
                  <Text className="text-[10px] font-semibold" style={{ color: tokens.textMuted }}>
                    of {balance.total_days} days remaining
                  </Text>
                  {/* Progress Line */}
                  <View className="mt-3.5 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: tokens.primary,
                        width: `${Math.min(100, progress * 100)}%`,
                      }}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        <QuickActionCard
          title="Apply Leave"
          subtitle="Submit a new time-off request to HR"
          icon="add-circle-outline"
          onPress={() => router.push("/(app)/leaves/apply")}
        />
        <QuickActionCard
          title="Leave History"
          subtitle="View full history and request statuses"
          icon="list-outline"
          colors={[tokens.primary, tokens.accent]}
          onPress={() => router.push("/(app)/leaves/history")}
        />

        <SectionHeader title="Recent Requests" subtitle="Latest updates on your leave applications" />
        {requests.isLoading ? (
          <View className="space-y-3">
            <Skeleton className="w-full" height={60} />
            <Skeleton className="w-full" height={60} />
          </View>
        ) : (requests.data ?? []).length === 0 ? (
          <EmptyState title="No leave requests" description="Your leave applications will appear here." icon="airplane-outline" />
        ) : (
          (requests.data ?? []).slice(0, 3).map((request) => (
            <PressableScale key={request.id} onPress={() => router.push("/(app)/leaves/history")} scale={0.98} haptic>
              <View
                className="mb-3 rounded-[20px] p-4 border"
                style={{
                  backgroundColor: tokens.backgroundElevated,
                  borderColor: tokens.border,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3 flex-row items-center">
                    <View className="h-9 w-9 rounded-xl items-center justify-center bg-zinc-100 dark:bg-zinc-800 mr-3">
                      <Ionicons name="airplane-outline" size={16} color={tokens.textSecondary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold tracking-tight" style={{ color: tokens.text }}>
                        {LEAVE_TYPE_LABELS[request.leave_type]}
                      </Text>
                      <Text className="mt-0.5 text-[10px] font-semibold" style={{ color: tokens.textMuted }}>
                        {request.start_date} to {request.end_date}
                      </Text>
                    </View>
                  </View>
                  <StatusBadge
                    label={request.status}
                    tone={
                      request.status === "approved"
                        ? "success"
                        : request.status === "rejected"
                          ? "danger"
                          : "warning"
                    }
                  />
                </View>
              </View>
            </PressableScale>
          ))
        )}
      </ScreenShell>
    </ScreenSafeTop>
  );
}
