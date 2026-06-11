import { router } from "expo-router";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/ui/GlassCard";
import { QuickActionCard } from "@/components/ui/QuickActionCard";
import { useLeaveBalances, useLeaveRequests } from "@/hooks/useHrQueries";
import { LEAVE_TYPE_LABELS } from "@/types/hr";

export default function LeavesScreen() {
  const balances = useLeaveBalances();
  const requests = useLeaveRequests();
  const totalRemaining = (balances.data ?? []).reduce((sum, b) => sum + b.remaining_days, 0);

  return (
    <SafeAreaView className="flex-1 bg-surface-muted" edges={["top"]}>
      <ScrollView
        contentContainerClassName="px-5 pb-28 pt-4"
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
        <Text className="text-3xl font-bold text-slate-900">Leave Dashboard</Text>
        <Text className="mt-1 text-sm text-slate-500">Manage your time off with clarity</Text>

        <GlassCard className="mt-6">
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Remaining Balance
          </Text>
          <Text className="mt-2 text-4xl font-bold text-slate-900">{totalRemaining}</Text>
          <Text className="text-sm text-slate-500">days available across all categories</Text>
        </GlassCard>

        <View className="mt-6 flex-row flex-wrap gap-3">
          {(balances.data ?? []).map((balance) => (
            <View key={balance.leave_type} className="min-w-[46%] flex-1 rounded-3xl bg-white p-4 shadow-premium">
              <Text className="text-sm font-semibold text-slate-500">
                {LEAVE_TYPE_LABELS[balance.leave_type]}
              </Text>
              <Text className="mt-2 text-2xl font-bold text-slate-900">
                {balance.remaining_days}
              </Text>
              <Text className="text-xs text-slate-400">of {balance.total_days} days</Text>
            </View>
          ))}
        </View>

        <View className="mt-8">
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
            colors={["#0f766e", "#14b8a6"]}
            onPress={() => router.push("/(app)/leaves/history")}
          />
        </View>

        <Text className="mb-3 mt-8 text-lg font-bold text-slate-900">Recent Requests</Text>
        {(requests.data ?? []).slice(0, 3).map((request) => (
          <Pressable
            key={request.id}
            onPress={() => router.push("/(app)/leaves/history")}
            className="mb-3 rounded-2xl bg-white p-4 shadow-premium"
          >
            <Text className="font-semibold text-slate-900">
              {LEAVE_TYPE_LABELS[request.leave_type]}
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              {request.start_date} to {request.end_date}
            </Text>
            <Text className="mt-2 text-sm capitalize text-indigo-600">{request.status}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
