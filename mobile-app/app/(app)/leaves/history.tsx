import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { EmptyState, StatusBadge } from "@/components/ui/Feedback";
import { PressableScale } from "@/components/ui/PressableScale";
import { SubScreenLayout } from "@/components/ui/SubScreenLayout";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { useCancelLeave, useLeaveRequests } from "@/hooks/useHrQueries";
import { LEAVE_TYPE_LABELS, type LeaveRequest } from "@/types/hr";

const sections = ["pending", "approved", "rejected", "cancelled"] as const;

export default function LeaveHistoryScreen() {
  const tokens = useDesignTokens();
  const requests = useLeaveRequests();
  const cancelLeave = useCancelLeave();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof sections)[number]>("pending");

  function handleCancel(item: LeaveRequest) {
    Alert.alert(
      "Cancel Leave Request",
      "Are you sure you want to cancel this pending leave request?",
      [
        { text: "Keep Request", style: "cancel" },
        {
          text: "Cancel Leave",
          style: "destructive",
          onPress: () => {
            setCancellingId(item.id);
            cancelLeave.mutate(item.id, {
              onSettled: () => setCancellingId(null),
              onError: (error) => {
                Alert.alert(
                  "Unable to Cancel",
                  error instanceof Error ? error.message : "Please try again.",
                );
              },
            });
          },
        },
      ],
    );
  }

  const activeItems = (requests.data ?? []).filter((item) => item.status === activeTab);

  return (
    <SubScreenLayout
      title="Leave History"
      subtitle="Track the status of your time-off applications."
      onBack={() => router.back()}
    >
      {/* Segment Selector */}
      <View className="flex-row rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-1 mb-6">
        {sections.map((status) => {
          const isActive = activeTab === status;
          const count = (requests.data ?? []).filter((item) => item.status === status).length;
          return (
            <PressableScale
              key={status}
              onPress={() => setActiveTab(status)}
              className="flex-1 rounded-[12px] py-2 items-center justify-center relative"
              style={{
                backgroundColor: isActive ? tokens.backgroundElevated : "transparent",
              }}
              scale={0.96}
            >
              <Text
                className="text-[10px] font-bold uppercase tracking-wider text-center"
                style={{ color: isActive ? tokens.text : tokens.textSecondary }}
              >
                {status} ({count})
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {/* Render active tab items */}
      {requests.isLoading ? (
        <View className="items-center justify-center py-10">
          <ActivityIndicator color={tokens.primary} />
        </View>
      ) : activeItems.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} applications`}
          description={`Your leave requests marked as ${activeTab} will appear here.`}
          icon="calendar-outline"
        />
      ) : (
        activeItems.map((item) => (
          <View
            key={item.id}
            className="mb-4 rounded-[22px] p-5 border"
            style={{
              backgroundColor: tokens.backgroundElevated,
              borderColor: tokens.border,
            }}
          >
            <View className="flex-row items-center justify-between pb-3 border-b" style={{ borderColor: tokens.borderSubtle }}>
              <View className="flex-row items-center flex-1 pr-3">
                <View className="h-9 w-9 rounded-xl items-center justify-center bg-zinc-100 dark:bg-zinc-800 mr-3">
                  <Ionicons name="airplane" size={16} color={tokens.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold tracking-tight" style={{ color: tokens.text }}>
                    {LEAVE_TYPE_LABELS[item.leave_type]}
                  </Text>
                  <Text className="mt-0.5 text-[10px] font-semibold" style={{ color: tokens.textMuted }}>
                    {item.start_date} to {item.end_date}
                  </Text>
                </View>
              </View>
              <StatusBadge
                label={item.status}
                tone={
                  item.status === "approved"
                    ? "success"
                    : item.status === "rejected"
                      ? "danger"
                      : item.status === "pending"
                        ? "warning"
                        : "neutral"
                }
              />
            </View>

            {item.reason ? (
              <View className="mt-4">
                <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
                  Reason Notes
                </Text>
                <Text className="mt-1 text-xs font-medium leading-4" style={{ color: tokens.textSecondary }}>
                  {item.reason}
                </Text>
              </View>
            ) : null}

            {item.admin_remarks ? (
              <View
                className="mt-4 rounded-xl p-3 border"
                style={{ backgroundColor: tokens.backgroundMuted, borderColor: tokens.borderSubtle }}
              >
                <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
                  Admin Remarks
                </Text>
                <Text className="mt-1 text-xs leading-4" style={{ color: tokens.textSecondary }}>
                  {item.admin_remarks}
                </Text>
              </View>
            ) : null}

            {activeTab === "pending" ? (
              <PressableScale onPress={() => handleCancel(item)} style={{ marginTop: 16 }}>
                <View
                  className="items-center rounded-xl py-3 border"
                  style={{ backgroundColor: tokens.dangerSoft, borderColor: `${tokens.danger}33` }}
                >
                  {cancellingId === item.id ? (
                    <ActivityIndicator color={tokens.danger} size="small" />
                  ) : (
                    <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: tokens.danger }}>
                      Cancel Request
                    </Text>
                  )}
                </View>
              </PressableScale>
            ) : null}
          </View>
        ))
      )}
    </SubScreenLayout>
  );
}
