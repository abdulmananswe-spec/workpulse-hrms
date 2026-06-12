import { router } from "expo-router";
import { RefreshControl, Text, View } from "react-native";

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
            onRefresh={() => {
              void balances.refetch();
              void requests.refetch();
            }}
          />
        }
      >
        <SectionHeader title="Leave" subtitle="Plan time off with clarity and confidence" />

        <GlassCard className="mb-6">
          <Text className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
            Total Remaining
          </Text>
          <Text className="mt-2 text-[42px] font-bold tracking-tight" style={{ color: tokens.text }}>
            {totalRemaining}
          </Text>
          <Text className="text-sm" style={{ color: tokens.textSecondary }}>
            days available across all leave categories
          </Text>
        </GlassCard>

        <View className="mb-6 flex-row flex-wrap gap-3">
          {balances.isLoading ? (
            <>
              <Skeleton className="min-w-[46%] flex-1" height={96} />
              <Skeleton className="min-w-[46%] flex-1" height={96} />
            </>
          ) : (
            (balances.data ?? []).map((balance) => (
            <View
              key={balance.leave_type}
              className="min-w-[46%] flex-1 rounded-3xl p-4"
              style={{
                backgroundColor: tokens.backgroundElevated,
                borderWidth: 1,
                borderColor: tokens.borderSubtle,
              }}
            >
              <Text className="text-sm font-semibold" style={{ color: tokens.textSecondary }}>
                {LEAVE_TYPE_LABELS[balance.leave_type]}
              </Text>
              <Text className="mt-2 text-2xl font-bold" style={{ color: tokens.text }}>
                {balance.remaining_days}
              </Text>
              <Text className="text-xs" style={{ color: tokens.textMuted }}>
                of {balance.total_days} days
              </Text>
            </View>
            ))
          )}
        </View>

        <QuickActionCard
          title="Apply Leave"
          subtitle="Submit a new leave request"
          icon="add-circle-outline"
          onPress={() => router.push("/(app)/leaves/apply")}
        />
        <QuickActionCard
          title="Leave History"
          subtitle="Approved, pending, and rejected requests"
          icon="list-outline"
          colors={["#0F766E", "#14B8A6"]}
          onPress={() => router.push("/(app)/leaves/history")}
        />

        <SectionHeader title="Recent Requests" subtitle="Latest activity on your leave applications" />
        {(requests.data ?? []).slice(0, 3).map((request) => (
          <PressableScale key={request.id} onPress={() => router.push("/(app)/leaves/history")}>
            <View
              className="mb-3 rounded-3xl p-4"
              style={{
                backgroundColor: tokens.backgroundElevated,
                borderWidth: 1,
                borderColor: tokens.borderSubtle,
              }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="font-semibold" style={{ color: tokens.text }}>
                    {LEAVE_TYPE_LABELS[request.leave_type]}
                  </Text>
                  <Text className="mt-1 text-sm" style={{ color: tokens.textSecondary }}>
                    {request.start_date} to {request.end_date}
                  </Text>
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
        ))}
      </ScreenShell>
    </ScreenSafeTop>
  );
}
