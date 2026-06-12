import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

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

  return (
    <SubScreenLayout
      title="Leave History"
      subtitle="Track pending, approved, and rejected requests."
      onBack={() => router.back()}
    >
      {sections.map((status) => {
        const items = (requests.data ?? []).filter((item) => item.status === status);
        return (
          <View key={status} className="mb-8">
            <Text className="mb-3 text-lg font-bold capitalize" style={{ color: tokens.text }}>
              {status}
            </Text>
            {items.length === 0 ? (
              <EmptyState
                title={`No ${status} requests`}
                description="Your leave requests will appear here."
                icon="calendar-outline"
              />
            ) : (
              items.map((item) => (
                <View
                  key={item.id}
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
                        {LEAVE_TYPE_LABELS[item.leave_type]}
                      </Text>
                      <Text className="mt-1 text-sm" style={{ color: tokens.textSecondary }}>
                        {item.start_date} to {item.end_date}
                      </Text>
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
                    <Text className="mt-2 text-sm leading-5" style={{ color: tokens.textSecondary }}>
                      {item.reason}
                    </Text>
                  ) : null}
                  {item.admin_remarks ? (
                    <View
                      className="mt-3 rounded-2xl p-3"
                      style={{ backgroundColor: tokens.backgroundMuted }}
                    >
                      <Text className="text-xs font-semibold uppercase" style={{ color: tokens.textMuted }}>
                        Admin Remarks
                      </Text>
                      <Text className="mt-1 text-sm" style={{ color: tokens.textSecondary }}>
                        {item.admin_remarks}
                      </Text>
                    </View>
                  ) : null}
                  {status === "pending" ? (
                    <PressableScale onPress={() => handleCancel(item)}>
                      <View
                        className="mt-4 items-center rounded-xl py-3"
                        style={{ backgroundColor: tokens.dangerSoft }}
                      >
                        {cancellingId === item.id ? (
                          <ActivityIndicator color={tokens.danger} />
                        ) : (
                          <Text className="font-semibold" style={{ color: tokens.danger }}>
                            Cancel Request
                          </Text>
                        )}
                      </View>
                    </PressableScale>
                  ) : null}
                </View>
              ))
            )}
          </View>
        );
      })}
    </SubScreenLayout>
  );
}
